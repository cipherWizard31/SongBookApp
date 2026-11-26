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
      kignit?: string;
      lyrics?: string;
      chords?: string;
      tags?: string[];
      isPublished?: boolean;
    };

    if (!body.title || !body.kignit || !body.lyrics) {
      return NextResponse.json(
        { error: 'title, kignit, and lyrics are required' },
        { status: 400 }
      );
    }

    const [song] = await prisma.$transaction([
      prisma.song.create({
        data: {
          title: body.title,
          artist: body.artist,
          kignit: body.kignit,
          lyrics: body.lyrics,
          chords: body.chords,
          tags: body.tags ?? [],
          isPublished: body.isPublished ?? true,
        },
      }),
      prisma.dictionaryVersion.upsert({
        where: { id: 'global' },
        update: { version: { increment: 1 } },
        create: { id: 'global', version: 1 },
      }),
    ]);

    return NextResponse.json({ song }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

