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
      album?: string;
      rhythmStyle?: string;
      scale?: string;
      audioUrl?: string;
      kignit?: string;
      lyrics?: string;
      chords?: string;
    };

    const hasTagsMeta =
      body.album !== undefined ||
      body.rhythmStyle !== undefined ||
      body.scale !== undefined ||
      body.audioUrl !== undefined;

    const tagsMeta: Record<string, string> = {};
    if (body.album) tagsMeta.album = body.album;
    if (body.rhythmStyle) tagsMeta.rhythmStyle = body.rhythmStyle;
    if (body.scale) tagsMeta.scale = body.scale;
    if (body.audioUrl) tagsMeta.audioUrl = body.audioUrl;

    const [song] = await prisma.$transaction([
      prisma.song.update({
        where: { id },
        data: {
          ...(typeof body.isPublished === 'boolean'
            ? { isPublished: body.isPublished }
            : {}),
          ...(body.title ? { title: body.title } : {}),
          ...(typeof body.artist === 'string' ? { artist: body.artist } : {}),
          ...(body.rhythmStyle || body.kignit
            ? { kignit: body.rhythmStyle ?? body.kignit }
            : {}),
          ...(body.lyrics ? { lyrics: body.lyrics } : {}),
          ...(typeof body.chords === 'string' ? { chords: body.chords } : {}),
          ...(hasTagsMeta ? { tags: JSON.stringify(tagsMeta) } : {}),
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

