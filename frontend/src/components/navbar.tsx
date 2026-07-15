'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Home, Search, Users, Bell, MessageCircle, Menu, X,
  Sun, Moon, LayoutDashboard, LogOut, ChevronDown, Shield,
} from 'lucide-react';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setMobileOpen(false), [pathname]);

  const navLinks = [
    { href: '/properties', label: 'Find a Room', icon: Search },
    { href: '/flatmates', label: 'Find a Flatmate', icon: Users },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-[var(--radius)] bg-gradient-to-br from-[var(--primary)] to-[#7C3AED] flex items-center justify-center">
              <Home className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[var(--foreground)] tracking-tight">
              EassyNest
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted-light)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 flex items-center justify-center rounded-[var(--radius)] text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}

            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <Link
                  href="/notifications"
                  className="relative h-9 w-9 flex items-center justify-center rounded-[var(--radius)] text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)] transition-colors"
                >
                  <Bell className="h-4 w-4" />
                </Link>

                {/* Chat */}
                <Link
                  href={user.role === 'TENANT' ? '/dashboard/tenant' : '/dashboard/owner'}
                  className="h-9 w-9 flex items-center justify-center rounded-[var(--radius)] text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)] transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-[var(--radius-full)] hover:bg-[var(--muted-light)] transition-colors"
                  >
                    <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                    <ChevronDown className="h-3 w-3 text-[var(--foreground-muted)]" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-[var(--radius-lg)] bg-[var(--surface-elevated)] border border-[var(--border)] shadow-[var(--shadow-elevated)] py-1 z-50"
                        onMouseLeave={() => setUserMenuOpen(false)}
                      >
                        <div className="px-3 py-2 border-b border-[var(--border)]">
                          <p className="text-sm font-medium text-[var(--foreground)]">{user.name}</p>
                          <p className="text-xs text-[var(--foreground-muted)]">{user.email}</p>
                        </div>

                        <Link
                          href={user.role === 'ADMIN' ? '/admin' : user.role === 'OWNER' ? '/dashboard/owner' : '/dashboard/tenant'}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          {user.role === 'ADMIN' ? <Shield className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
                          {user.role === 'ADMIN' ? 'Admin Panel' : 'Dashboard'}
                        </Link>

                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--destructive)] hover:bg-[var(--destructive-light)] transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-[var(--radius)] text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)]"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-[var(--border)]"
            >
              <div className="py-3 space-y-1">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] text-sm font-medium ${
                      isActive(href)
                        ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                        : 'text-[var(--foreground-secondary)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <div className="pt-2 flex gap-2 px-3">
                    <Link href="/login" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/register" className="flex-1">
                      <Button size="sm" className="w-full">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
