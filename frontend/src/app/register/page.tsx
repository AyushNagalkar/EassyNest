'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, UserPlus, Search, Building } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'TENANT' | 'OWNER'>('TENANT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ email, password, name, role });
      router.push(role === 'OWNER' ? '/dashboard/owner' : '/dashboard/tenant');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
            <div className="inline-flex h-12 w-12 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--primary)] to-[var(--primary-gradient-to)] items-center justify-center mb-4">
              <Home className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Create your account</h1>
            <p className="text-sm text-[var(--foreground-secondary)] mt-1">Join EassyNest and find your perfect match</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-[var(--radius)] bg-[var(--destructive-light)] text-[var(--destructive)] text-sm">
              {error}
            </div>
          )}

          {/* Role picker */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('TENANT')}
              className={`p-4 rounded-[var(--radius-lg)] border-2 transition-all text-center ${
                role === 'TENANT'
                  ? 'border-[var(--primary)] bg-[var(--primary-light)]'
                  : 'border-[var(--border)] hover:border-[var(--border-hover)]'
              }`}
            >
              <Search className={`h-6 w-6 mx-auto mb-2 ${role === 'TENANT' ? 'text-[var(--primary)]' : 'text-[var(--foreground-muted)]'}`} />
              <p className={`text-sm font-medium ${role === 'TENANT' ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
                I&apos;m Looking
              </p>
              <p className="text-xs text-[var(--foreground-muted)] mt-0.5">Find a room or flatmate</p>
            </button>
            <button
              type="button"
              onClick={() => setRole('OWNER')}
              className={`p-4 rounded-[var(--radius-lg)] border-2 transition-all text-center ${
                role === 'OWNER'
                  ? 'border-[var(--primary)] bg-[var(--primary-light)]'
                  : 'border-[var(--border)] hover:border-[var(--border-hover)]'
              }`}
            >
              <Building className={`h-6 w-6 mx-auto mb-2 ${role === 'OWNER' ? 'text-[var(--primary)]' : 'text-[var(--foreground-muted)]'}`} />
              <p className={`text-sm font-medium ${role === 'OWNER' ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
                I&apos;m Listing
              </p>
              <p className="text-xs text-[var(--foreground-muted)] mt-0.5">List a property</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--foreground-secondary)] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
