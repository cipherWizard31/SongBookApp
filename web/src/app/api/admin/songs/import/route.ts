import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ImportSongInput {
  id?: string;
  title?: string;
  artist?: string | null;
  author?: string | null;
  kignit?: string;
  scale?: string;
  lyrics?: string;
  content?: string;
  chords?: string | null;
  style?: string;
  rhythmStyle?: string;
  album?: string;
  audioUrl?: string | null;
  audioUri?: string | null;
  tags?: string[] | string | Record<string, string>;
  isPublished?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const raw = (await request.json()) as
      | ImportSongInput[]
      | { songs?: ImportSongInput[] };

    const items = Array.isArray(raw) ? raw : raw.songs;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Provide a non-empty JSON array of songs.' },
        { status: 400 }
      );
    }

    const validSongs = items
      .filter((s) => {
        const hasTitle = Boolean(s?.title?.trim());
        const hasLyrics = Boolean((s?.lyrics ?? s?.content)?.trim());
        return hasTitle && hasLyrics;
      })
      .map((s) => {
        let rawLyrics = (s.lyrics ?? s.content ?? '').trim();
        const rawChords = s.chords ? String(s.chords).trim() : null;
        // Preserve chords if provided separately and lyrics don't already contain inline [chords]
        if (rawChords && !rawLyrics.includes('[')) {
          rawLyrics = `${rawLyrics}\n\n${rawChords}`;
        }
        const rawArtist = (s.artist ?? s.author)?.trim() || null;
        const rawStyle = (s.style ?? s.rhythmStyle)?.trim() || '';
        const rawScale = (s.scale ?? s.kignit)?.trim() || '';
        const rawKignit = rawStyle || rawScale || 'Uncategorized';
        const rawAlbum = s.album?.trim() || '';
        const rawAudioUrl = (s.audioUrl ?? s.audioUri)?.trim() || '';

        const tagsMeta: Record<string, string> = {};
        if (rawAlbum) tagsMeta.album = rawAlbum;
        if (rawStyle) tagsMeta.rhythmStyle = rawStyle;
        if (rawScale) tagsMeta.scale = rawScale;
        if (rawAudioUrl) tagsMeta.audioUrl = rawAudioUrl;

        return {
          title: String(s.title).trim(),
          artist: rawArtist,
          kignit: rawKignit,
          lyrics: rawLyrics,
          chords: rawChords,
          tags: JSON.stringify(Object.keys(tagsMeta).length ? tagsMeta : (s.tags ?? [])),
          isPublished: s.isPublished ?? true,
        };
      });

    if (validSongs.length === 0) {
      return NextResponse.json(
        { error: 'No valid songs found (each song requires title and lyrics).' },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.song.createMany({ data: validSongs }),
      prisma.dictionaryVersion.upsert({
        where: { id: 'global' },
        update: { version: { increment: 1 } },
        create: { id: 'global', version: 2 },
      }),
    ]);

    return NextResponse.json({
      importedCount: validSongs.length,
      skippedCount: items.length - validSongs.length,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}

