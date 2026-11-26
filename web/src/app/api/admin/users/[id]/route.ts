import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { isBlocked, notes } = (await request.json()) as {
      isBlocked?: boolean;
      notes?: string;
    };

    const user = await prisma.deviceUser.update({
      where: { id },
      data: {
        ...(typeof isBlocked === 'boolean' ? { isBlocked } : {}),
        ...(typeof notes === 'string' ? { notes } : {}),
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

