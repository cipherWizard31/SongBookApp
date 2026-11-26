import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileApiKey } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  if (!verifyMobileApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const [latestUpdate, announcements] = await Promise.all([
      prisma.appUpdate.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.announcement.findMany({
        where: {
          isActive: true,
          startsAt: { lte: now },
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      update: latestUpdate,
      announcements,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

