'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { theme } from '@/lib/theme';

interface AnnouncementRow {
  id: string;
  title: string;
  message: string;
  type: string;
  isActive: boolean;
  createdAt: string;
}

export function AnnouncementsPanel() {
  const [items, setItems] = useState<AnnouncementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [submitting, setSubmitting] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/announcements');
      if (res.ok) {
        const data = (await res.json()) as { announcements: AnnouncementRow[] };
        setItems(data.announcements);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnnouncements();
  }, [loadAnnouncements]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, type }),
      });
      if (res.ok) {
        setTitle('');
        setMessage('');
        setType('info');
        await loadAnnouncements();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(item: AnnouncementRow) {
    const res = await fetch(`/api/admin/announcements/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    if (res.ok) await loadAnnouncements();
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
        In-App Announcements
      </h2>

      <form
        onSubmit={handleCreate}
        className="flex flex-col"
        style={{ gap: theme.spacing.sm, marginBottom: theme.spacing.md }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: theme.spacing.sm }}>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
            className="min-h-[44px] text-sm outline-none sm:col-span-2"
            style={{
              backgroundColor: theme.colors.background.subtle,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.subtle}`,
              borderRadius: theme.radii.inner,
              padding: `0 ${theme.spacing.sm}`,
            }}
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="min-h-[44px] text-sm outline-none cursor-pointer"
            style={{
              backgroundColor: theme.colors.background.subtle,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.subtle}`,
              borderRadius: theme.radii.inner,
              padding: `0 ${theme.spacing.sm}`,
            }}
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="release">Release</option>
          </select>
        </div>

        <textarea
          required
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message shown to mobile users..."
          className="text-sm outline-none"
          style={{
            backgroundColor: theme.colors.background.subtle,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.subtle}`,
            borderRadius: theme.radii.inner,
            padding: theme.spacing.sm,
          }}
        />

        <div className="flex justify-end">
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
            {submitting ? 'Posting...' : 'Post Announcement'}
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
      ) : items.length === 0 ? (
        <p className="text-sm" style={{ color: theme.colors.text.muted }}>
          No announcements posted yet.
        </p>
      ) : (
        <div className="flex flex-col" style={{ gap: theme.spacing.xs }}>
          {items.map((item) => (
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
                  [{item.type.toUpperCase()}] {item.title}
                </p>
                <p
                  className="text-xs"
                  style={{ color: theme.colors.text.secondary }}
                >
                  {item.message}
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
                {item.isActive ? 'Active' : 'Hidden'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

