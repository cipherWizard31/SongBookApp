'use client';

import { useState } from 'react';
import { Menu, X, Download } from 'lucide-react';
import { theme } from '@/lib/theme';

const LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#whats-new', label: "What's New" },
  { href: '#about', label: 'About' },
];

function scrollTo(id: string) {
  document.getElementById(id.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
}

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{
        backgroundColor: theme.colors.background.secondary + 'e6', // 90% opacity
        borderBottom: `1px solid ${theme.colors.border.subtle}`,
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <button
          type="button"
          onClick={() => scrollTo('#home')}
          className="flex items-center gap-2.5 cursor-pointer"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
            style={{
              backgroundColor: theme.colors.accent.primary,
              color: theme.colors.accent.foreground,
            }}
          >
            SK
          </div>
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: theme.colors.text.primary }}
          >
            Selah Kignit
          </span>
        </button>

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7">
          {LINKS.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => scrollTo(link.href)}
              className="text-sm font-medium transition-opacity hover:opacity-80 cursor-pointer"
              style={{
                color: theme.colors.text.secondary,
                background: 'none',
                border: 'none',
                padding: 0,
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right: Download CTA + Mobile Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollTo('#download')}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-semibold transition-transform duration-150 hover:-translate-y-0.5 cursor-pointer"
            style={{
              backgroundColor: theme.colors.accent.primary,
              color: theme.colors.accent.foreground,
              border: 'none',
            }}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download App</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg cursor-pointer"
            style={{
              border: `1px solid ${theme.colors.border.subtle}`,
              color: theme.colors.text.primary,
              background: 'none',
            }}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="md:hidden px-4 pb-4 pt-2 space-y-1"
          style={{
            backgroundColor: theme.colors.background.secondary,
            borderBottom: `1px solid ${theme.colors.border.subtle}`,
          }}
        >
          {LINKS.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => { scrollTo(link.href); setMobileOpen(false); }}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
              style={{ color: theme.colors.text.primary, background: 'none', border: 'none' }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

