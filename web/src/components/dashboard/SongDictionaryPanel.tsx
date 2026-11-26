'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { theme } from '@/lib/theme';

interface SongRow {
  id: string;
  title: string;
  artist: string | null;
  kignit: string;
  lyrics: string;
  chords: string | null;
  tags: string[];
  isPublished: boolean;
  version: number;
}

export function SongDictionaryPanel() {
  const [songs, setSongs] = useState<SongRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [kignitFilter, setKignitFilter] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [kignit, setKignit] = useState('Tizita');
  const [lyrics, setLyrics] = useState('');
  const [chords, setChords] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadSongs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (kignitFilter) params.set('kignit', kignitFilter);
      const res = await fetch(`/api/admin/songs?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as { songs: SongRow[] };
        setSongs(data.songs);
      }
    } finally {
      setLoading(false);
    }
  }, [kignitFilter]);

  useEffect(() => {
    void loadSongs();
  }, [loadSongs]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          artist: artist || undefined,
          kignit,
          lyrics,
          chords: chords || undefined,
        }),
      });
      if (res.ok) {
        setTitle('');
        setArtist('');
        setLyrics('');
        setChords('');
        await loadSongs();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePublished(song: SongRow) {
    const res = await fetch(`/api/admin/songs/${song.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !song.isPublished }),
    });
    if (res.ok) await loadSongs();
  }

  function handleExportJson() {
    const blob = new Blob([JSON.stringify(songs, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selahkignit-dictionary.json';
    a.click();
    URL.revokeObjectURL(url);
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
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        style={{ gap: theme.spacing.sm, marginBottom: theme.spacing.md }}
      >
        <h2
          className="text-base font-semibold"
          style={{ color: theme.colors.text.primary }}
        >
          Global Song Dictionary
        </h2>

        <div className="flex items-center" style={{ gap: theme.spacing.xs }}>
          <select
            value={kignitFilter}
            onChange={(e) => setKignitFilter(e.target.value)}
            className="min-h-[44px] text-sm outline-none cursor-pointer"
            style={{
              backgroundColor: theme.colors.background.subtle,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.subtle}`,
              borderRadius: theme.radii.inner,
              padding: `0 ${theme.spacing.sm}`,
            }}
          >
            <option value="">All Kignits</option>
            <option value="Tizita">Tizita</option>
            <option value="Bati">Bati</option>
            <option value="Ambassel">Ambassel</option>
            <option value="Anchihoye">Anchihoye</option>
          </select>

          <button
            type="button"
            onClick={handleExportJson}
            className="min-h-[44px] text-xs font-semibold cursor-pointer"
            style={{
              backgroundColor: theme.colors.background.subtle,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.subtle}`,
              borderRadius: theme.radii.inner,
              padding: `0 ${theme.spacing.sm}`,
            }}
          >
            Export JSON
          </button>
        </div>
      </div>

      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 md:grid-cols-3"
        style={{ gap: theme.spacing.sm, marginBottom: theme.spacing.md }}
      >
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Song title"
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
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Artist (optional)"
          className="min-h-[44px] text-sm outline-none"
          style={{
            backgroundColor: theme.colors.background.subtle,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.subtle}`,
            borderRadius: theme.radii.inner,
            padding: `0 ${theme.spacing.sm}`,
          }}
        />
        <select
          value={kignit}
          onChange={(e) => setKignit(e.target.value)}
          className="min-h-[44px] text-sm outline-none cursor-pointer"
          style={{
            backgroundColor: theme.colors.background.subtle,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.subtle}`,
            borderRadius: theme.radii.inner,
            padding: `0 ${theme.spacing.sm}`,
          }}
        >
          <option value="Tizita">Tizita</option>
          <option value="Bati">Bati</option>
          <option value="Ambassel">Ambassel</option>
          <option value="Anchihoye">Anchihoye</option>
        </select>

        <textarea
          required
          rows={3}
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="Lyrics..."
          className="text-sm outline-none md:col-span-2"
          style={{
            backgroundColor: theme.colors.background.subtle,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.subtle}`,
            borderRadius: theme.radii.inner,
            padding: theme.spacing.sm,
          }}
        />
        <textarea
          rows={3}
          value={chords}
          onChange={(e) => setChords(e.target.value)}
          placeholder="Chords / notation (optional)"
          className="text-sm outline-none"
          style={{
            backgroundColor: theme.colors.background.subtle,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.subtle}`,
            borderRadius: theme.radii.inner,
            padding: theme.spacing.sm,
          }}
        />

        <div className="flex justify-end md:col-span-3">
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
            {submitting ? 'Saving...' : 'Add Song to Dictionary'}
          </button>
        </div>
      </form>

      {loading ? (
        <div
          className="h-20 w-full animate-pulse"
          style={{
            backgroundColor: theme.colors.background.subtle,
            borderRadius: theme.radii.inner,
          }}
        />
      ) : songs.length === 0 ? (
        <p className="text-sm" style={{ color: theme.colors.text.muted }}>
          No songs in the global dictionary yet.
        </p>
      ) : (
        <div className="flex flex-col" style={{ gap: theme.spacing.xs }}>
          {songs.map((song) => (
            <div
              key={song.id}
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
                  {song.title} {song.artist ? `— ${song.artist}` : ''}
                </p>
                <p
                  className="text-xs"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Kignit: {song.kignit} • v{song.version}
                </p>
              </div>
              <button
                type="button"
                onClick={() => togglePublished(song)}
                className="min-h-[44px] text-xs font-semibold cursor-pointer"
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  color: song.isPublished
                    ? theme.colors.status.success
                    : theme.colors.text.muted,
                  border: `1px solid ${theme.colors.border.subtle}`,
                  borderRadius: theme.radii.inner,
                  padding: `0 ${theme.spacing.sm}`,
                }}
              >
                {song.isPublished ? 'Published' : 'Draft'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

