import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileApiKey } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  if (!verifyMobileApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { installId, platform, appVersion } = (await request.json()) as {
      installId?: string;
      platform?: string;
      appVersion?: string;
    };

    if (!installId || !platform || !appVersion) {
      return NextResponse.json(
        { error: 'installId, platform, and appVersion are required' },
        { status: 400 }
      );
    }

    const user = await prisma.deviceUser.upsert({
      where: { installId },
      update: {
        platform,
        appVersion,
        lastSeenAt: new Date(),
      },
      create: {
        installId,
        platform,
        appVersion,
      },
      select: {
        id: true,
        isBlocked: true,
      },
    });

    return NextResponse.json({
      ok: true,
      blocked: user.isBlocked,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

