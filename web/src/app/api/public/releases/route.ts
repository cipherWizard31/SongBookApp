import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const [updates, announcements] = await Promise.all([
      prisma.appUpdate.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          version: true,
          minSupportedVersion: true,
          releaseNotes: true,
          forceUpdate: true,
          storeUrl: true,
          createdAt: true,
        },
      }),
      prisma.announcement.findMany({
        where: {
          isActive: true,
          startsAt: { lte: now },
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          createdAt: true,
        },
      }),
    ]);

    const [latest, ...previous] = updates;

    return NextResponse.json(
      {
        latestRelease: latest
          ? {
              id: latest.id,
              version: latest.version,
              platform: 'android',
              downloadUrl: latest.storeUrl,
              releaseNotes: latest.releaseNotes,
              minSupportedVersion: latest.minSupportedVersion,
              publishedAt: latest.createdAt,
            }
          : null,
        previousReleases: previous.map((u) => ({
          id: u.id,
          version: u.version,
          platform: 'android',
          downloadUrl: u.storeUrl,
          releaseNotes: u.releaseNotes,
          publishedAt: u.createdAt,
        })),
        announcements,
      },
      {
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch {
    return NextResponse.json(
      { latestRelease: null, previousReleases: [], announcements: [] },
      { status: 200 }
    );
  }
}

