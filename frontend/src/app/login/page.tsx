'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 hero-mesh">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="card card-ambient p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--primary)] to-[#7C3AED] items-center justify-center mb-4">
              <Home className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Welcome back</h1>
            <p className="text-sm text-[var(--foreground-secondary)] mt-1">Sign in to your EassyNest account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-[var(--radius)] bg-[var(--destructive-light)] text-[var(--destructive)] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--foreground-secondary)] mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[var(--primary)] font-medium hover:underline">
              Create one
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-3 rounded-[var(--radius)] bg-[var(--muted-light)] text-xs text-[var(--foreground-secondary)] space-y-1">
            <p className="font-medium text-[var(--foreground)]">Demo Accounts:</p>
            <p>Tenant: <code className="text-[var(--primary)]">tenant1@eassynest.com</code> / <code>TenantPassword123!</code></p>
            <p>Owner: <code className="text-[var(--primary)]">owner1@eassynest.com</code> / <code>OwnerPassword123!</code></p>
            <p>Admin: <code className="text-[var(--primary)]">admin@eassynest.com</code> / <code>AdminPassword123!</code></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
