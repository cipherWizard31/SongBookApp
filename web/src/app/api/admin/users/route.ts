import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('q')?.trim();
    const platform = request.nextUrl.searchParams.get('platform')?.trim();

    const users = await prisma.deviceUser.findMany({
      where: {
        ...(platform ? { platform } : {}),
        ...(search
          ? {
              OR: [
                { installId: { contains: search, mode: 'insensitive' } },
                { appVersion: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { lastSeenAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

