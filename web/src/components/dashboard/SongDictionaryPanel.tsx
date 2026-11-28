'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { theme } from '@/lib/theme';

interface SongRow {
  id: string;
  title: string;
  artist: string | null;
  lyrics: string;
  chords: string | null;
  tags: string;
  isPublished: boolean;
  version: number;
}

export function SongDictionaryPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [songs, setSongs] = useState<SongRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [chords, setChords] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadSongs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/songs');
      if (res.ok) {
        const data = (await res.json()) as { songs: SongRow[] };
        setSongs(data.songs);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSongs();
  }, [loadSongs]);

  const filteredSongs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return songs.filter((song) => {
      if (statusFilter === 'published' && !song.isPublished) return false;
      if (statusFilter === 'draft' && song.isPublished) return false;
      if (!q) return true;
      return (
        song.title.toLowerCase().includes(q) ||
        (song.artist?.toLowerCase().includes(q) ?? false) ||
        song.lyrics.toLowerCase().includes(q)
      );
    });
  }, [songs, search, statusFilter]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          artist: artist || undefined,
          lyrics,
          chords: chords || undefined,
        }),
      });
      if (res.ok) {
        setTitle('');
        setArtist('');
        setLyrics('');
        setChords('');
        setShowAddForm(false);
        setFeedback('Song added to global dictionary.');
        await loadSongs();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeedback(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const res = await fetch('/api/admin/songs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = (await res.json()) as {
        importedCount?: number;
        skippedCount?: number;
        error?: string;
      };
      if (!res.ok) {
        setFeedback(data.error || 'Import failed.');
      } else {
        setFeedback(
          `Imported ${data.importedCount ?? 0} songs` +
            (data.skippedCount ? ` (${data.skippedCount} skipped)` : '.')
        );
        await loadSongs();
      }
    } catch {
      setFeedback('Invalid JSON file. Please check the file format.');
    } finally {
      e.target.value = '';
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

  async function handleDelete(song: SongRow) {
    const res = await fetch(`/api/admin/songs/${song.id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      if (expandedId === song.id) setExpandedId(null);
      await loadSongs();
    }
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
        <div>
          <h2
            className="text-base font-semibold"
            style={{ color: theme.colors.text.primary }}
          >
            Global Song Dictionary ({filteredSongs.length})
          </h2>
          <p className="text-xs" style={{ color: theme.colors.text.secondary }}>
            Browse, import JSON, or manage songs synced to Android devices.
          </p>
        </div>

        <div className="flex flex-wrap items-center" style={{ gap: theme.spacing.xs }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
            aria-label="Import songs JSON file"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] text-xs font-semibold cursor-pointer"
            style={{
              backgroundColor: theme.colors.background.subtle,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.subtle}`,
              borderRadius: theme.radii.inner,
              padding: `0 ${theme.spacing.sm}`,
            }}
          >
            Import JSON
          </button>

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

          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="min-h-[44px] text-xs font-semibold cursor-pointer"
            style={{
              backgroundColor: theme.colors.accent.primary,
              color: theme.colors.accent.foreground,
              borderRadius: theme.radii.inner,
              padding: `0 ${theme.spacing.sm}`,
            }}
          >
            {showAddForm ? 'Close Form' : '+ Add Song'}
          </button>
        </div>
      </div>

      {feedback && (
        <p
          role="status"
          className="text-xs font-medium"
          style={{
            color: theme.colors.text.primary,
            backgroundColor: theme.colors.background.subtle,
            borderRadius: theme.radii.inner,
            padding: theme.spacing.xs,
            marginBottom: theme.spacing.sm,
          }}
        >
          {feedback}
        </p>
      )}

      <div
        className="grid grid-cols-1 sm:grid-cols-3"
        style={{ gap: theme.spacing.xs, marginBottom: theme.spacing.md }}
      >
        <input
          type="search"
          aria-label="Search songs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, artist, or lyrics..."
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
          aria-label="Filter by publish status"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as 'all' | 'published' | 'draft')
          }
          className="min-h-[44px] text-sm outline-none cursor-pointer"
          style={{
            backgroundColor: theme.colors.background.subtle,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.subtle}`,
            borderRadius: theme.radii.inner,
            padding: `0 ${theme.spacing.sm}`,
          }}
        >
          <option value="all">All Statuses</option>
          <option value="published">Published Only</option>
          <option value="draft">Drafts Only</option>
        </select>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-3"
          style={{
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.md,
            padding: theme.spacing.sm,
            backgroundColor: theme.colors.background.subtle,
            borderRadius: theme.radii.inner,
          }}
        >
          <input
            required
            aria-label="Song title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Song title"
            className="min-h-[44px] text-sm outline-none"
            style={{
              backgroundColor: theme.colors.background.secondary,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.subtle}`,
              borderRadius: theme.radii.inner,
              padding: `0 ${theme.spacing.sm}`,
            }}
          />
          <input
            aria-label="Artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist (optional)"
            className="min-h-[44px] text-sm outline-none"
            style={{
              backgroundColor: theme.colors.background.secondary,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.subtle}`,
              borderRadius: theme.radii.inner,
              padding: `0 ${theme.spacing.sm}`,
            }}
          />
          <textarea
            required
            aria-label="Lyrics and inline chords"
            rows={5}
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="Lyrics with inline chords, e.g. Yefikir [G]Amlak [Em]getaye..."
            className="text-sm font-mono outline-none md:col-span-3"
            style={{
              backgroundColor: theme.colors.background.secondary,
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
              {submitting ? 'Saving...' : 'Save Song'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div
          className="h-20 w-full animate-pulse"
          style={{
            backgroundColor: theme.colors.background.subtle,
            borderRadius: theme.radii.inner,
          }}
        />
      ) : filteredSongs.length === 0 ? (
        <p className="text-sm" style={{ color: theme.colors.text.muted }}>
          No songs match your filters.
        </p>
      ) : (
        <div className="flex flex-col" style={{ gap: theme.spacing.xs }}>
          {filteredSongs.map((song) => {
            const isExpanded = expandedId === song.id;
            return (
              <div
                key={song.id}
                style={{
                  backgroundColor: theme.colors.background.subtle,
                  borderRadius: theme.radii.inner,
                  padding: theme.spacing.sm,
                }}
              >
                <div
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
                  style={{ gap: theme.spacing.xs }}
                >
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => setExpandedId(isExpanded ? null : song.id)}
                    className="text-left min-h-[44px] flex-1 cursor-pointer"
                  >
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
                      v{song.version} •{' '}
                      {isExpanded ? 'Hide preview' : 'Show lyrics & chords'}
                    </p>
                  </button>

                  <div className="flex items-center" style={{ gap: theme.spacing.xs }}>
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

                    <button
                      type="button"
                      aria-label={`Delete ${song.title}`}
                      onClick={() => handleDelete(song)}
                      className="min-h-[44px] text-xs font-semibold cursor-pointer"
                      style={{
                        backgroundColor: theme.colors.background.secondary,
                        color: theme.colors.status.danger,
                        border: `1px solid ${theme.colors.border.subtle}`,
                        borderRadius: theme.radii.inner,
                        padding: `0 ${theme.spacing.sm}`,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    className="grid grid-cols-1 md:grid-cols-2"
                    style={{
                      gap: theme.spacing.sm,
                      marginTop: theme.spacing.sm,
                      paddingTop: theme.spacing.sm,
                      borderTop: `1px solid ${theme.colors.border.subtle}`,
                    }}
                  >
                    <div>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: theme.colors.text.secondary }}
                      >
                        Lyrics
                      </p>
                      <pre
                        className="text-xs whitespace-pre-wrap font-sans"
                        style={{
                          color: theme.colors.text.primary,
                          marginTop: '4px',
                        }}
                      >
                        {song.lyrics}
                      </pre>
                    </div>
                    {song.chords && (
                      <div>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: theme.colors.text.secondary }}
                        >
                          Chords / Notation
                        </p>
                        <pre
                          className="text-xs whitespace-pre-wrap font-mono"
                          style={{
                            color: theme.colors.text.primary,
                            marginTop: '4px',
                          }}
                        >
                          {song.chords}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
