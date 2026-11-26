'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { theme } from '@/lib/theme';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: theme.colors.background.primary,
        padding: theme.spacing.md,
      }}
    >
      <div
        className="w-full max-w-md"
        style={{
          backgroundColor: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.subtle}`,
          borderRadius: theme.radii.outer,
          padding: theme.spacing.lg,
          boxShadow: theme.elevation.ambient,
        }}
      >
        <div style={{ marginBottom: theme.spacing.md }}>
          <h1
            className="text-xl font-semibold tracking-tight"
            style={{ color: theme.colors.text.primary }}
          >
            SelahKignit Controller
          </h1>
          <p
            className="text-sm font-medium"
            style={{
              color: theme.colors.text.secondary,
              marginTop: theme.spacing.xs,
            }}
          >
            Sign in to manage users, updates, and the global song dictionary.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: theme.spacing.sm }}>
          <div className="flex flex-col" style={{ gap: theme.spacing.xs }}>
            <label
              htmlFor="email"
              className="text-sm font-medium"
              style={{ color: theme.colors.text.primary }}
            >
              Admin Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@selahkignit.local"
              className="min-h-[44px] w-full text-sm outline-none transition-colors"
              style={{
                backgroundColor: theme.colors.background.subtle,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.subtle}`,
                borderRadius: theme.radii.inner,
                padding: `0 ${theme.spacing.sm}`,
              }}
            />
          </div>

          <div className="flex flex-col" style={{ gap: theme.spacing.xs }}>
            <label
              htmlFor="password"
              className="text-sm font-medium"
              style={{ color: theme.colors.text.primary }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="min-h-[44px] w-full text-sm outline-none transition-colors"
              style={{
                backgroundColor: theme.colors.background.subtle,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.subtle}`,
                borderRadius: theme.radii.inner,
                padding: `0 ${theme.spacing.sm}`,
              }}
            />
          </div>

          {error && (
            <p
              className="text-sm font-medium"
              style={{ color: theme.colors.status.danger }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] w-full text-sm font-semibold transition-opacity disabled:opacity-60 cursor-pointer"
            style={{
              backgroundColor: theme.colors.accent.primary,
              color: theme.colors.accent.foreground,
              borderRadius: theme.radii.inner,
              marginTop: theme.spacing.xs,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}

