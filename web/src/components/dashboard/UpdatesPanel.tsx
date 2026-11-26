'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { theme } from '@/lib/theme';

interface AppUpdateRow {
  id: string;
  version: string;
  minSupportedVersion: string;
  releaseNotes: string;
  forceUpdate: boolean;
  storeUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export function UpdatesPanel() {
  const [updates, setUpdates] = useState<AppUpdateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState('');
  const [minSupportedVersion, setMinSupportedVersion] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [forceUpdate, setForceUpdate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadUpdates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/updates');
      if (res.ok) {
        const data = (await res.json()) as { updates: AppUpdateRow[] };
        setUpdates(data.updates);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUpdates();
  }, [loadUpdates]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version,
          minSupportedVersion,
          releaseNotes,
          storeUrl: storeUrl || undefined,
          forceUpdate,
        }),
      });
      if (res.ok) {
        setVersion('');
        setMinSupportedVersion('');
        setReleaseNotes('');
        setStoreUrl('');
        setForceUpdate(false);
        await loadUpdates();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(item: AppUpdateRow) {
    const res = await fetch(`/api/admin/updates/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    if (res.ok) await loadUpdates();
  }

  return (
    <section
      style={{
        backgroundColor: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.subtle}`,
        borderRadius: theme.radii.outer,
        padding: theme.spacing.md,
        boxShadow: theme.elevation.ambient,
      }}
    >
      <h2
        className="text-base font-semibold"
        style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}
      >
        Universal App Updates
      </h2>

      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ gap: theme.spacing.sm, marginBottom: theme.spacing.md }}
      >
        <input
          required
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          placeholder="Target version (e.g. 1.4.0)"
          className="min-h-[44px] text-sm outline-none"
          style={{
            backgroundColor: theme.colors.background.subtle,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.subtle}`,
            borderRadius: theme.radii.inner,
            padding: `0 ${theme.spacing.sm}`,
          }}
        />
        <input
          required
          value={minSupportedVersion}
          onChange={(e) => setMinSupportedVersion(e.target.value)}
          placeholder="Min supported version (e.g. 1.2.0)"
          className="min-h-[44px] text-sm outline-none"
          style={{
            backgroundColor: theme.colors.background.subtle,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.subtle}`,
            borderRadius: theme.radii.inner,
            padding: `0 ${theme.spacing.sm}`,
          }}
        />
        <input
          value={storeUrl}
          onChange={(e) => setStoreUrl(e.target.value)}
          placeholder="Store / download URL (optional)"
          className="min-h-[44px] text-sm outline-none md:col-span-2"
          style={{
            backgroundColor: theme.colors.background.subtle,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.subtle}`,
            borderRadius: theme.radii.inner,
            padding: `0 ${theme.spacing.sm}`,
          }}
        />
        <textarea
          required
          rows={2}
          value={releaseNotes}
          onChange={(e) => setReleaseNotes(e.target.value)}
          placeholder="Release notes..."
          className="text-sm outline-none md:col-span-2"
          style={{
            backgroundColor: theme.colors.background.subtle,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.subtle}`,
            borderRadius: theme.radii.inner,
            padding: theme.spacing.sm,
          }}
        />
        <div className="flex items-center justify-between md:col-span-2">
          <label
            className="flex items-center text-sm font-medium cursor-pointer min-h-[44px]"
            style={{ gap: theme.spacing.xs, color: theme.colors.text.primary }}
          >
            <input
              type="checkbox"
              checked={forceUpdate}
              onChange={(e) => setForceUpdate(e.target.checked)}
            />
            Force update
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] text-sm font-semibold cursor-pointer disabled:opacity-60"
            style={{
              backgroundColor: theme.colors.accent.primary,
              color: theme.colors.accent.foreground,
              borderRadius: theme.radii.inner,
              padding: `0 ${theme.spacing.md}`,
            }}
          >
            {submitting ? 'Publishing...' : 'Publish Update'}
          </button>
        </div>
      </form>

      {loading ? (
        <div
          className="h-16 w-full animate-pulse"
          style={{
            backgroundColor: theme.colors.background.subtle,
            borderRadius: theme.radii.inner,
          }}
        />
      ) : updates.length === 0 ? (
        <p className="text-sm" style={{ color: theme.colors.text.muted }}>
          No app updates published yet.
        </p>
      ) : (
        <div className="flex flex-col" style={{ gap: theme.spacing.xs }}>
          {updates.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
              style={{
                backgroundColor: theme.colors.background.subtle,
                borderRadius: theme.radii.inner,
                padding: theme.spacing.sm,
                gap: theme.spacing.xs,
              }}
            >
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: theme.colors.text.primary }}
                >
                  v{item.version} (min v{item.minSupportedVersion})
                  {item.forceUpdate ? ' • Forced' : ''}
                </p>
                <p
                  className="text-xs"
                  style={{ color: theme.colors.text.secondary }}
                >
                  {item.releaseNotes}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleActive(item)}
                className="min-h-[44px] text-xs font-semibold cursor-pointer"
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  color: item.isActive
                    ? theme.colors.status.success
                    : theme.colors.text.muted,
                  border: `1px solid ${theme.colors.border.subtle}`,
                  borderRadius: theme.radii.inner,
                  padding: `0 ${theme.spacing.sm}`,
                }}
              >
                {item.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

