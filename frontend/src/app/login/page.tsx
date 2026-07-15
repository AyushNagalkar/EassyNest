'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, LogIn, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex-1 flex min-h-0">
      {/* Left side — Illustration panel (desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--primary-gradient-to)]">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-white/5 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute inset-0 dot-grid opacity-10" />

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-11 w-11 rounded-[var(--radius-lg)] bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">EassyNest</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
            Welcome back to your nest
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-sm">
            Sign in to manage your listings, check compatibility scores, and continue conversations with your matches.
          </p>
          <div className="mt-8 flex items-center gap-2 text-white/60 text-sm">
            <Sparkles className="h-4 w-4" />
            AI-powered matching for better shared living
          </div>
        </div>
      </div>

      {/* Right side — Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-8 hero-mesh">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="card card-ambient p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="lg:hidden inline-flex h-12 w-12 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--primary)] to-[var(--primary-gradient-to)] items-center justify-center mb-4">
                <Home className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Welcome back</h1>
              <p className="text-sm text-[var(--foreground-secondary)] mt-1">Sign in to your EassyNest account</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-[var(--radius)] bg-[var(--destructive-light)] text-[var(--destructive)] text-sm flex items-center gap-2"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="8" opacity="0.15"/><path d="M8 4.5v4M8 10.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Button type="submit" loading={loading} className="w-full gap-2">
                <LogIn className="h-4 w-4" />
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
            <div className="mt-6 p-4 rounded-[var(--radius-lg)] bg-[var(--muted-light)] border border-[var(--border)] text-xs space-y-2">
              <p className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                Demo Accounts
              </p>
              <div className="grid gap-1.5 text-[var(--foreground-secondary)]">
                <p>Tenant: <code className="text-[var(--primary)] bg-[var(--primary-light)] px-1.5 py-0.5 rounded text-[11px]">tenant1@eassynest.com</code> / <code className="bg-[var(--muted-light)] px-1.5 py-0.5 rounded text-[11px]">TenantPassword123!</code></p>
                <p>Owner: <code className="text-[var(--primary)] bg-[var(--primary-light)] px-1.5 py-0.5 rounded text-[11px]">owner1@eassynest.com</code> / <code className="bg-[var(--muted-light)] px-1.5 py-0.5 rounded text-[11px]">OwnerPassword123!</code></p>
                <p>Admin: <code className="text-[var(--primary)] bg-[var(--primary-light)] px-1.5 py-0.5 rounded text-[11px]">admin@eassynest.com</code> / <code className="bg-[var(--muted-light)] px-1.5 py-0.5 rounded text-[11px]">AdminPassword123!</code></p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
