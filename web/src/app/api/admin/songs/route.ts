import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const kignit = request.nextUrl.searchParams.get('kignit')?.trim();
    const songs = await prisma.song.findMany({
      where: kignit ? { kignit } : undefined,
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json({ songs });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      title?: string;
      artist?: string;
      album?: string;
      rhythmStyle?: string;
      scale?: string;
      audioUrl?: string;
      kignit?: string;
      lyrics?: string;
      chords?: string;
      tags?: string[];
      isPublished?: boolean;
    };

    if (!body.title || !body.lyrics) {
      return NextResponse.json(
        { error: 'title and lyrics are required' },
        { status: 400 }
      );
    }

    // Pack extra metadata into tags JSON
    const tagsMeta: Record<string, string> = {};
    if (body.album) tagsMeta.album = body.album;
    if (body.rhythmStyle) tagsMeta.rhythmStyle = body.rhythmStyle;
    if (body.scale) tagsMeta.scale = body.scale;
    if (body.audioUrl) tagsMeta.audioUrl = body.audioUrl;

    const [song] = await prisma.$transaction([
      prisma.song.create({
        data: {
          title: body.title,
          artist: body.artist,
          kignit: body.rhythmStyle ?? body.kignit ?? 'Uncategorized',
          lyrics: body.lyrics,
          chords: body.chords,
          tags: JSON.stringify(Object.keys(tagsMeta).length ? tagsMeta : (body.tags ?? [])),
          isPublished: body.isPublished ?? true,
        },
      }),
      prisma.dictionaryVersion.upsert({
        where: { id: 'global' },
        update: { version: { increment: 1 } },
        create: { id: 'global', version: 2 },
      }),
    ]);

    return NextResponse.json({ song }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

