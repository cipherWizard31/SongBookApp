import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      isPublished?: boolean;
      title?: string;
      artist?: string;
      kignit?: string;
      lyrics?: string;
      chords?: string;
    };

    const [song] = await prisma.$transaction([
      prisma.song.update({
        where: { id },
        data: {
          ...(typeof body.isPublished === 'boolean'
            ? { isPublished: body.isPublished }
            : {}),
          ...(body.title ? { title: body.title } : {}),
          ...(typeof body.artist === 'string' ? { artist: body.artist } : {}),
          ...(body.kignit ? { kignit: body.kignit } : {}),
          ...(body.lyrics ? { lyrics: body.lyrics } : {}),
          ...(typeof body.chords === 'string' ? { chords: body.chords } : {}),
          version: { increment: 1 },
        },
      }),
      prisma.dictionaryVersion.upsert({
        where: { id: 'global' },
        update: { version: { increment: 1 } },
        create: { id: 'global', version: 1 },
      }),
    ]);

    return NextResponse.json({ song });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.$transaction([
      prisma.song.delete({ where: { id } }),
      prisma.dictionaryVersion.upsert({
        where: { id: 'global' },
        update: { version: { increment: 1 } },
        create: { id: 'global', version: 1 },
      }),
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

