'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { connectSocket, getSocket } from '@/lib/socket';
import { PageTransition } from '@/components/page-transition';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatRelativeTime } from '@/lib/utils';
import { Bell, Check, CheckCheck, MessageCircle, Heart, Users, X } from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.get('/notifications').then((data) => {
      const notifs = Array.isArray(data) ? data : data?.data || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n: any) => !n.read).length);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user, router]);

  // Live push via WebSocket
  useEffect(() => {
    if (!user) return;
    let socket: any;
    try {
      socket = connectSocket();
      socket.on('notification:new', (notif: any) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(c => c + 1);
      });
    } catch {}
    return () => { socket?.off('notification:new'); };
  }, [user]);

  async function markRead(id: string) {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  }

  async function markAllRead() {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  }

  function getIcon(type: string) {
    switch (type) {
      case 'NEW_MESSAGE': return <MessageCircle className="h-4 w-4 text-[var(--primary)]" />;
      case 'INTEREST_RECEIVED': return <Heart className="h-4 w-4 text-[var(--accent-flatmate)]" />;
      case 'INTEREST_ACCEPTED': return <Check className="h-4 w-4 text-[var(--success)]" />;
      default: return <Bell className="h-4 w-4 text-[var(--foreground-muted)]" />;
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-2xl px-4 py-8 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }

  return (
    <PageTransition className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-[var(--foreground-muted)]">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="gap-1">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<Bell className="h-8 w-8" />} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                  notif.read ? 'opacity-70' : 'border-l-2 border-l-[var(--primary)]'
                }`}
                onClick={() => {
                  if (!notif.read) markRead(notif.id);
                  // Navigate to relevant page
                  if (notif.meta?.chatRoomId || notif.type === 'NEW_MESSAGE') {
                    const interestId = notif.meta?.interestId || '';
                    if (interestId) router.push(`/chat/${interestId}`);
                  }
                }}
              >
                <div className="h-9 w-9 rounded-full bg-[var(--muted-light)] flex items-center justify-center shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)]">{notif.title}</p>
                  <p className="text-xs text-[var(--foreground-secondary)] line-clamp-2">{notif.body}</p>
                  <p className="text-[10px] text-[var(--foreground-muted)] mt-1">{formatRelativeTime(notif.createdAt)}</p>
                </div>
                {!notif.read && (
                  <div className="h-2 w-2 rounded-full bg-[var(--primary)] shrink-0 mt-2" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </PageTransition>
  );
}
