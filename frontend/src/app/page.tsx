'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CompatibilityBadge } from '@/components/ui/compatibility-badge';
import {
  Search, Users, Building, ArrowRight, Sparkles, Shield, MessageCircle, MapPin,
  Star, CheckCircle2,
} from 'lucide-react';

const fadeUp: any = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const features = [
  {
    icon: Sparkles,
    title: 'AI Compatibility Scoring',
    description: 'Our scoring engine analyzes budget, location, lifestyle, and preferences to calculate how well you match with each listing or flatmate.',
    color: 'var(--primary)',
    bg: 'var(--primary-light)',
  },
  {
    icon: MapPin,
    title: 'Map-First Discovery',
    description: 'Browse rooms and flatmates on an interactive map. Filter by city, budget, room type, and see matches in your preferred neighborhoods.',
    color: 'var(--accent-room)',
    bg: 'var(--accent-room-light)',
  },
  {
    icon: MessageCircle,
    title: 'Built-In Chat',
    description: 'Once a match is accepted, chat directly in-app with real-time messaging, read receipts, and typing indicators. No phone number swaps needed.',
    color: 'var(--accent-flatmate)',
    bg: 'var(--accent-flatmate-light)',
  },
  {
    icon: Shield,
    title: 'Verified Profiles',
    description: 'Email-verified users, owner property verification, and community reviews build trust before you commit to sharing a living space.',
    color: 'var(--success)',
    bg: 'var(--success-light)',
  },
];

const trustItems = [
  { label: '500+ Happy Renters', icon: Star },
  { label: 'AI-Powered Matching', icon: Sparkles },
  { label: 'Verified Listings', icon: CheckCircle2 },
  { label: 'Real-Time Chat', icon: MessageCircle },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ====== HERO ====== */}
      <section className="relative hero-mesh overflow-hidden">
        {/* Dot grid pattern */}
        <div className="absolute inset-0 dot-grid opacity-40" />

        {/* Floating decorative orbs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-[var(--primary)]/5 blur-3xl animate-float" />
        <div className="absolute bottom-10 right-[15%] w-96 h-96 rounded-full bg-[var(--accent-room)]/5 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-[var(--accent-flatmate)]/4 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[var(--radius-full)] bg-[var(--primary-light)] text-[var(--primary)] text-sm font-medium mb-6 border border-[var(--primary)]/10"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Compatibility Matching
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.08]"
            >
              Find your perfect{' '}
              <span className="gradient-text bg-gradient-to-r from-[var(--primary)] to-[var(--primary-gradient-to)] animate-gradient-text">
                room
              </span>{' '}
              or{' '}
              <span className="gradient-text bg-gradient-to-r from-[var(--accent-flatmate)] to-[#EF4444] animate-gradient-text" style={{ animationDelay: '2s' }}>
                flatmate
              </span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-6 text-lg sm:text-xl text-[var(--foreground-secondary)] leading-relaxed max-w-2xl mx-auto"
            >
              Stop scrolling through mismatched listings. Our AI scores every room and flatmate
              for compatibility with your lifestyle, budget, and preferences — so you can move in
              with confidence.
            </motion.p>

            {/* Demo badge */}
            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-8 flex justify-center"
            >
              <CompatibilityBadge score={92} explanation="Excellent budget fit, perfect city match, available from dates align exactly, and preferences are fully compatible." size="lg" />
            </motion.div>

            {/* Split CTAs */}
            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
            >
              <Link href="/properties">
                <Button variant="room" size="lg" className="gap-2 min-w-[200px]">
                  <Search className="h-4 w-4" />
                  Find a Room
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/flatmates">
                <Button variant="flatmate" size="lg" className="gap-2 min-w-[200px]">
                  <Users className="h-4 w-4" />
                  Find a Flatmate
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="gap-2 min-w-[200px]">
                  <Building className="h-4 w-4" />
                  List Your Property
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="relative border-t border-[var(--border)]/50 bg-[var(--surface)]/50 backdrop-blur-sm"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
              {trustItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)]">
                  <item.icon className="h-4 w-4 text-[var(--primary)]" />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ====== FEATURES ====== */}
      <section className="py-20 sm:py-28 bg-[var(--background)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
              Why EassyNest?
            </h2>
            <p className="mt-4 text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              We combine smart technology with a trust-first design to make shared living work.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="card card-hover p-6 lg:p-8 group relative overflow-hidden"
              >
                {/* Colored top accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${feature.color}, transparent)` }}
                />
                <div
                  className="h-12 w-12 rounded-[var(--radius-lg)] flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{ backgroundColor: feature.bg }}
                >
                  <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="py-20 sm:py-28 bg-[var(--background-alt)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-[var(--foreground-secondary)] max-w-xl mx-auto">
              Three simple steps to find your perfect match.
            </p>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-7 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-[var(--primary)]/20 via-[var(--accent-room)]/20 to-[var(--accent-flatmate)]/20" />

            {[
              {
                step: '01',
                title: 'Create Your Profile',
                desc: 'Tell us your budget, preferred city, move-in date, and lifestyle preferences. Takes under 2 minutes.',
                gradient: 'var(--gradient-primary)',
              },
              {
                step: '02',
                title: 'Browse Matches',
                desc: 'See rooms and flatmates scored by compatibility. Filter, sort by score, and explore on the map.',
                gradient: 'var(--gradient-room)',
              },
              {
                step: '03',
                title: 'Connect & Move In',
                desc: 'Express interest, chat in real-time once accepted, and coordinate your move — all in one place.',
                gradient: 'var(--gradient-flatmate)',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className="relative text-center"
              >
                <div
                  className="relative z-10 inline-flex h-14 w-14 rounded-[var(--radius-xl)] items-center justify-center text-white font-bold text-lg mb-5 shadow-lg"
                  style={{ background: item.gradient }}
                >
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA FOOTER ====== */}
      <section className="py-20 sm:py-24 hero-mesh relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
              Ready to find your nest?
            </h2>
            <p className="mt-4 text-lg text-[var(--foreground-secondary)] max-w-lg mx-auto">
              Join thousands of people finding better shared living through smart matching.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="min-w-[200px] gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/properties">
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  Browse Listings
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--primary)] to-[var(--primary-gradient-to)] flex items-center justify-center">
                  <Building className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-[var(--foreground)]">EassyNest</span>
              </div>
              <p className="text-xs text-[var(--foreground-muted)] leading-relaxed max-w-xs">
                AI-powered room and flatmate finder. Smart matching for better shared living.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-3">Explore</p>
              <div className="flex flex-col gap-2">
                <Link href="/properties" className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors">
                  Find a Room
                </Link>
                <Link href="/flatmates" className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors">
                  Find a Flatmate
                </Link>
                <Link href="/register" className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors">
                  List Property
                </Link>
              </div>
            </div>

            {/* Account */}
            <div>
              <p className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-3">Account</p>
              <div className="flex flex-col gap-2">
                <Link href="/login" className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors">
                  Create Account
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--foreground-muted)] text-center">
              © {new Date().getFullYear()} EassyNest. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
