'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';
import { Send, Inbox, Check, X, MessageCircle, Heart } from 'lucide-react';

export default function InterestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'sent' | 'received'>('sent');
  const [sent, setSent] = useState<any[]>([]);
  const [received, setReceived] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    Promise.all([
      api.get('/interests/sent').catch(() => []),
      api.get('/interests/received').catch(() => []),
    ]).then(([s, r]) => {
      setSent(Array.isArray(s) ? s : s?.data || []);
      setReceived(Array.isArray(r) ? r : r?.data || []);
    }).finally(() => setLoading(false));
  }, [user, router]);

  async function handleAccept(id: string) {
    try {
      await api.patch(`/interests/${id}/accept`);
      setReceived(prev => prev.map(i => i.id === id ? { ...i, status: 'ACCEPTED' } : i));
    } catch (err: any) { alert(err.message); }
  }

  async function handleDecline(id: string) {
    try {
      await api.patch(`/interests/${id}/decline`);
      setReceived(prev => prev.map(i => i.id === id ? { ...i, status: 'DECLINED' } : i));
    } catch (err: any) { alert(err.message); }
  }

  const items = tab === 'sent' ? sent : received;

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  }

  return (
    <PageTransition className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Interests</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--muted-light)] rounded-[var(--radius)] mb-6 w-fit">
        <button
          onClick={() => setTab('sent')}
          className={`px-4 py-2 text-sm font-medium rounded-[var(--radius-sm)] transition-all ${tab === 'sent' ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm' : 'text-[var(--foreground-muted)]'}`}
        >
          <Send className="h-3.5 w-3.5 inline mr-1.5" />Sent ({sent.length})
        </button>
        <button
          onClick={() => setTab('received')}
          className={`px-4 py-2 text-sm font-medium rounded-[var(--radius-sm)] transition-all ${tab === 'received' ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm' : 'text-[var(--foreground-muted)]'}`}
        >
          <Inbox className="h-3.5 w-3.5 inline mr-1.5" />Received ({received.length})
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={tab === 'sent' ? <Send className="h-8 w-8" /> : <Inbox className="h-8 w-8" />}
          title={tab === 'sent' ? 'No interests sent yet' : 'No interests received yet'}
          description={tab === 'sent' ? 'Browse listings to express interest.' : 'Your interests will appear here.'}
          action={tab === 'sent' ? <Link href="/properties"><Button size="sm">Browse Listings</Button></Link> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => {
            const otherUser = tab === 'sent'
              ? item.targetProperty?.owner || item.targetSeekerProfile?.user
              : item.fromUser;
            const targetName = tab === 'sent'
              ? item.targetProperty?.title || item.targetSeekerProfile?.user?.name
              : item.targetProperty?.title || 'Your profile';

            return (
              <div key={item.id} className="card p-4">
                <div className="flex items-center gap-3">
                  <Avatar src={otherUser?.avatarUrl} name={otherUser?.name || 'User'} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {tab === 'sent' ? `You → ${targetName}` : `${otherUser?.name} → ${targetName}`}
                    </p>
                    <p className="text-xs text-[var(--foreground-muted)]">{formatDate(item.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={item.status === 'ACCEPTED' ? 'success' : item.status === 'DECLINED' ? 'destructive' : 'warning'}
                      size="sm"
                    >
                      {item.status}
                    </Badge>

                    {/* Chat link for accepted */}
                    {item.status === 'ACCEPTED' && (
                      <Link href={`/chat/${item.id}`}>
                        <Button variant="ghost" size="icon"><MessageCircle className="h-4 w-4" /></Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Accept/decline for received pending */}
                {tab === 'received' && item.status === 'PENDING' && (
                  <div className="flex gap-2 mt-3 ml-13">
                    <Button size="sm" onClick={() => handleAccept(item.id)} className="gap-1">
                      <Check className="h-3.5 w-3.5" /> Accept
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDecline(item.id)} className="gap-1">
                      <X className="h-3.5 w-3.5" /> Decline
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
