'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils';
import { Send, ArrowLeft, CheckCheck, Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { interestId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load messages
  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    async function load() {
      try {
        const data = await api.get(`/chat/${interestId}/messages`);
        const msgs = data.messages || data.data || data || [];
        setMessages(Array.isArray(msgs) ? msgs : []);
        setChatRoomId(data.chatRoomId || data.chatRoom?.id || null);
        // Determine other user
        if (data.interest || data.chatRoom?.interest) {
          const interest = data.interest || data.chatRoom?.interest;
          const fromUser = interest.fromUser;
          const toUser = interest.targetProperty?.owner || interest.targetSeekerProfile?.user;
          setOtherUser(fromUser?.id === user?.id ? toUser : fromUser);
        }
      } catch (err) {
        console.error('Failed to load chat:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [interestId, user, router]);

  // Socket connection
  useEffect(() => {
    if (!chatRoomId || !user) return;
    let socket: any;
    try {
      socket = connectSocket();
      socket.emit('chat:join', { chatRoomId });

      socket.on('chat:message', (msg: any) => {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      });

      socket.on('chat:typing', (data: any) => {
        if (data.userId !== user.id) {
          setTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setTyping(false), 2000);
        }
      });
    } catch (err) {
      console.error('Socket error:', err);
    }

    return () => {
      if (socket) {
        socket.off('chat:message');
        socket.off('chat:typing');
        socket.emit('chat:leave', { chatRoomId });
      }
    };
  }, [chatRoomId, user, scrollToBottom]);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !chatRoomId) return;
    const socket = getSocket();
    if (socket) {
      socket.emit('chat:message', { chatRoomId, content: input.trim(), type: 'TEXT' });
    }
    setInput('');
  }

  function handleTyping() {
    const socket = getSocket();
    if (socket && chatRoomId) {
      socket.emit('chat:typing', { chatRoomId });
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="border-b border-[var(--border)] p-4"><Skeleton className="h-10 w-48" /></div>
        <div className="flex-1 p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className={`h-12 ${i % 2 === 0 ? 'w-2/3' : 'w-1/2 ml-auto'}`} />)}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-h-[calc(100vh-4rem)]">
      {/* Chat header */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)]">
          <ArrowLeft className="h-5 w-5" />
        </button>
        {otherUser && <Avatar src={otherUser.avatarUrl} name={otherUser.name || 'User'} size="md" />}
        <div>
          <p className="font-semibold text-[var(--foreground)]">{otherUser?.name || 'Chat'}</p>
          <AnimatePresence>
            {typing && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-[var(--primary)]">
                typing…
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--background-alt)]">
        {messages.length === 0 && (
          <div className="text-center py-12 text-sm text-[var(--foreground-muted)]">No messages yet. Start the conversation!</div>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.senderId === user?.id;
          return (
            <motion.div
              key={msg.id || i}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] sm:max-w-[60%] px-4 py-2.5 rounded-[var(--radius-xl)] ${
                isMine
                  ? 'bg-[var(--primary)] text-white rounded-br-[var(--radius-sm)]'
                  : 'bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] rounded-bl-[var(--radius-sm)]'
              }`}>
                <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                  <span className={`text-[10px] ${isMine ? 'text-white/60' : 'text-[var(--foreground-muted)]'}`}>
                    {formatRelativeTime(msg.createdAt)}
                  </span>
                  {isMine && msg.readAt && <CheckCheck className="h-3 w-3 text-white/60" />}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-[var(--border)] bg-[var(--surface)] p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); handleTyping(); }}
          placeholder="Type a message…"
          className="flex-1 h-10 px-4 rounded-[var(--radius-full)] bg-[var(--background-alt)] text-[var(--foreground)] text-sm border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] placeholder:text-[var(--foreground-muted)]"
        />
        <Button type="submit" size="icon" disabled={!input.trim()} className="rounded-full shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
