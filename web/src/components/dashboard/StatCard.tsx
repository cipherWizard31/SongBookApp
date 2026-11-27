'use client';

import { theme } from '@/lib/theme';

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  loading?: boolean;
}

export function StatCard({ label, value, hint, loading }: StatCardProps) {
  return (
    <div
      className="transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{
        backgroundColor: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.subtle}`,
        borderRadius: theme.radii.outer,
        padding: theme.spacing.md,
        boxShadow: theme.elevation.ambient,
      }}
    >
      <p
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: theme.colors.text.secondary }}
      >
        {label}
      </p>
      {loading ? (
        <div
          className="h-8 w-20 animate-pulse"
          style={{
            backgroundColor: theme.colors.background.subtle,
            borderRadius: theme.radii.inner,
            marginTop: theme.spacing.xs,
          }}
        />
      ) : (
        <p
          className="text-2xl font-semibold tracking-tight tabular-nums"
          style={{
            color: theme.colors.text.primary,
            marginTop: theme.spacing.xs,
          }}
        >
          {value}
        </p>
      )}
      {hint && (
        <p
          className="text-xs font-medium"
          style={{
            color: theme.colors.text.muted,
            marginTop: theme.spacing.xs,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

