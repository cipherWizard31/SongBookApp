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

    if (sinceVersion >= currentVersion) {
      return NextResponse.json({
        upToDate: true,
        version: currentVersion,
        songs: [],
      });
    }

    const songs = await prisma.song.findMany({
      where: { isPublished: true },
      orderBy: { title: 'asc' },
    });

    return NextResponse.json({
      upToDate: false,
      version: currentVersion,
      songs,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

