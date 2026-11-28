import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileApiKey } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  if (!verifyMobileApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sinceParam = request.nextUrl.searchParams.get('sinceVersion');
    const sinceVersion = sinceParam ? Number.parseInt(sinceParam, 10) : 0;

    const dictVersion = await prisma.dictionaryVersion.findUnique({
      where: { id: 'global' },
    });

    const currentVersion = dictVersion?.version ?? 1;

    // Always fetch the full published ID list so the client can purge removed songs
    const publishedIds = await prisma.song.findMany({
      where: { isPublished: true },
      select: { id: true },
      orderBy: { title: 'asc' },
    });
    const allPublishedIds = publishedIds.map((s) => s.id);

    if (sinceVersion >= currentVersion) {
      // Up-to-date: no song data needed, but send IDs so client can detect deletions
      return NextResponse.json({
        upToDate: true,
        version: currentVersion,
        publishedIds: allPublishedIds,
        songs: [],
      });
    }

    const rawSongs = await prisma.song.findMany({
      where: { isPublished: true },
      orderBy: { title: 'asc' },
    });

    const songs = rawSongs.map((s) => {
      let album = '';
      let style = s.kignit || 'Uncategorized';
      let scale = 'Uncategorized';
      let audioUrl = '';

      try {
        const parsed = JSON.parse(s.tags) as unknown;
        if (parsed && !Array.isArray(parsed) && typeof parsed === 'object') {
          const meta = parsed as Record<string, unknown>;
          if (typeof meta.album === 'string') album = meta.album;
          if (typeof meta.rhythmStyle === 'string') style = meta.rhythmStyle;
          if (typeof meta.scale === 'string') scale = meta.scale;
          if (typeof meta.audioUrl === 'string') audioUrl = meta.audioUrl;
        } else if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (typeof item === 'string' && item.startsWith('album:')) {
              album = item.slice(6);
            }
          }
        }
      } catch {
        // Ignore malformed tags JSON
      }

      return {
        ...s,
        author: s.artist ?? '',
        album,
        style,
        scale,
        content: s.lyrics,
        audioUrl,
      };
    });

    return NextResponse.json({
      upToDate: false,
      version: currentVersion,
      publishedIds: allPublishedIds,
      songs,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

