import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, dau, mau, blockedUsers, byPlatform, byVersion] =
      await Promise.all([
        prisma.deviceUser.count(),
        prisma.deviceUser.count({ where: { lastSeenAt: { gte: oneDayAgo } } }),
        prisma.deviceUser.count({ where: { lastSeenAt: { gte: thirtyDaysAgo } } }),
        prisma.deviceUser.count({ where: { isBlocked: true } }),
        prisma.deviceUser.groupBy({
          by: ['platform'],
          _count: { _all: true },
        }),
        prisma.deviceUser.groupBy({
          by: ['appVersion'],
          _count: { _all: true },
          orderBy: { _count: { appVersion: 'desc' } },
          take: 6,
        }),
      ]);

    return NextResponse.json({
      totalUsers,
      dau,
      mau,
      blockedUsers,
      platformBreakdown: byPlatform.map((item) => ({
        label: item.platform,
        count: item._count._all,
      })),
      versionBreakdown: byVersion.map((item) => ({
        label: item.appVersion,
        count: item._count._all,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

