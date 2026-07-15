'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
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
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => setMobileOpen(false), [pathname]);

  // Track scroll for glass effect intensity
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen]);

  const navLinks = [
    { href: '/properties', label: 'Find a Room', icon: Search },
    { href: '/flatmates', label: 'Find a Flatmate', icon: Users },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 glass transition-all duration-200 ${
        scrolled
          ? 'border-b border-[var(--border)] shadow-sm'
          : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
             <div className="relative h-9 w-9 rounded-[var(--radius)] bg-gradient-to-br from-[var(--primary)] to-[var(--primary-gradient-to)] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Home className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
              EassyNest
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-[var(--radius)] text-sm font-medium transition-all duration-200 ${
                  isActive(href)
                    ? 'text-[var(--primary)]'
                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted-light)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {/* Active indicator bar */}
                {isActive(href) && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-[var(--primary)] rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 flex items-center justify-center rounded-[var(--radius)] text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)] hover:text-[var(--foreground)] transition-all duration-200"
                aria-label="Toggle theme"
              >
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </motion.div>
              </button>
            )}

            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <Link
                  href="/notifications"
                  className={`relative h-9 w-9 flex items-center justify-center rounded-[var(--radius)] text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)] hover:text-[var(--foreground)] transition-all duration-200 ${
                    isActive('/notifications') ? 'text-[var(--primary)] bg-[var(--primary-light)]' : ''
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </Link>

                {/* Interests */}
                <Link
                  href="/interests"
                  className={`h-9 w-9 flex items-center justify-center rounded-[var(--radius)] text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)] hover:text-[var(--foreground)] transition-all duration-200 ${
                    isActive('/interests') ? 'text-[var(--primary)] bg-[var(--primary-light)]' : ''
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                </Link>

                {/* User menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-[var(--radius-full)] hover:bg-[var(--muted-light)] transition-all duration-200 border border-transparent hover:border-[var(--border)]"
                  >
                    <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                    <ChevronDown className={`h-3 w-3 text-[var(--foreground-muted)] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-60 rounded-[var(--radius-lg)] bg-[var(--surface-elevated)] border border-[var(--border)] shadow-[var(--shadow-elevated)] py-1 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-[var(--border)]">
                          <p className="text-sm font-semibold text-[var(--foreground)]">{user.name}</p>
                          <p className="text-xs text-[var(--foreground-muted)] truncate">{user.email}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            href={user.role === 'ADMIN' ? '/admin' : user.role === 'OWNER' ? '/dashboard/owner' : '/dashboard/tenant'}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)] hover:text-[var(--foreground)] transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            {user.role === 'ADMIN' ? <Shield className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
                            {user.role === 'ADMIN' ? 'Admin Panel' : 'Dashboard'}
                          </Link>

                          <button
                            onClick={() => { logout(); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--destructive)] hover:bg-[var(--destructive-light)] transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
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
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-[var(--radius)] text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)] transition-colors"
            >
              <motion.div
                key={mobileOpen ? 'close' : 'menu'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
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
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-[var(--border)]"
            >
              <div className="py-3 space-y-1">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius)] text-sm font-medium transition-colors ${
                      isActive(href)
                        ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                        : 'text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}

                {isAuthenticated && user && (
                  <>
                    <div className="my-2 border-t border-[var(--border)]" />
                    <Link
                      href="/notifications"
                      className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius)] text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)]"
                    >
                      <Bell className="h-4 w-4" />
                      Notifications
                    </Link>
                    <Link
                      href="/interests"
                      className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius)] text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)]"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Interests
                    </Link>
                    <Link
                      href={user.role === 'ADMIN' ? '/admin' : user.role === 'OWNER' ? '/dashboard/owner' : '/dashboard/tenant'}
                      className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius)] text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)]"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </>
                )}

                {!isAuthenticated && (
                  <div className="pt-2 flex gap-2 px-4">
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
