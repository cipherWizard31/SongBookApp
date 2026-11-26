import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const updates = await prisma.appUpdate.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ updates });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      version?: string;
      minSupportedVersion?: string;
      releaseNotes?: string;
      forceUpdate?: boolean;
      storeUrl?: string;
      isActive?: boolean;
    };

    if (!body.version || !body.minSupportedVersion || !body.releaseNotes) {
      return NextResponse.json(
        { error: 'version, minSupportedVersion, and releaseNotes are required' },
        { status: 400 }
      );
    }

    const update = await prisma.appUpdate.create({
      data: {
        version: body.version,
        minSupportedVersion: body.minSupportedVersion,
        releaseNotes: body.releaseNotes,
        forceUpdate: Boolean(body.forceUpdate),
        storeUrl: body.storeUrl,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json({ update }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

