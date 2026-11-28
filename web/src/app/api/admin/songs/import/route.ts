import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ImportSongInput {
  title?: string;
  artist?: string | null;
  author?: string | null;
  kignit?: string;
  scale?: string;
  lyrics?: string;
  content?: string;
  chords?: string | null;
  style?: string;
  album?: string;
  tags?: string[] | string;
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
        const rawKignit = (s.kignit ?? s.scale)?.trim() || 'Tizita';

        const extraTags: string[] = [];
        if (s.style?.trim()) extraTags.push(s.style.trim());
        if (s.album?.trim()) extraTags.push(`album:${s.album.trim()}`);

        const baseTags = Array.isArray(s.tags)
          ? s.tags
          : typeof s.tags === 'string'
            ? (JSON.parse(s.tags) as string[])
            : [];

        return {
          title: String(s.title).trim(),
          artist: rawArtist,
          kignit: rawKignit,
          lyrics: rawLyrics,
          chords: rawChords,
          tags: JSON.stringify([...baseTags, ...extraTags]),
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

