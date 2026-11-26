'use client';

import { theme } from '@/lib/theme';

export interface BreakdownItem {
  label: string;
  count: number;
}

interface BreakdownCardProps {
  title: string;
  items: BreakdownItem[];
  loading?: boolean;
}

export function BreakdownCard({ title, items, loading }: BreakdownCardProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div
      style={{
        backgroundColor: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.subtle}`,
        borderRadius: theme.radii.outer,
        padding: theme.spacing.md,
        boxShadow: theme.elevation.ambient,
      }}
    >
      <h2
        className="text-sm font-semibold"
        style={{
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.sm,
        }}
      >
        {title}
      </h2>

      {loading ? (
        <div className="flex flex-col" style={{ gap: theme.spacing.xs }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-6 w-full animate-pulse"
              style={{
                backgroundColor: theme.colors.background.subtle,
                borderRadius: theme.radii.inner,
              }}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm" style={{ color: theme.colors.text.muted }}>
          No data recorded yet.
        </p>
      ) : (
        <div className="flex flex-col" style={{ gap: theme.spacing.xs }}>
          {items.map((item) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div
                key={item.label}
                className="flex flex-col"
                style={{ gap: '4px' }}
              >
                <div className="flex items-center justify-between text-xs font-medium">
                  <span style={{ color: theme.colors.text.primary }}>
                    {item.label}
                  </span>
                  <span style={{ color: theme.colors.text.secondary }}>
                    {item.count} ({pct}%)
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden"
                  style={{
                    backgroundColor: theme.colors.background.subtle,
                    borderRadius: theme.radii.inner,
                  }}
                >
                  <div
                    className="h-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: theme.colors.accent.primary,
                      borderRadius: theme.radii.inner,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

