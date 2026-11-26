import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      isActive?: boolean;
      forceUpdate?: boolean;
    };

    const update = await prisma.appUpdate.update({
      where: { id },
      data: {
        ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
        ...(typeof body.forceUpdate === 'boolean'
          ? { forceUpdate: body.forceUpdate }
          : {}),
      },
    });

    return NextResponse.json({ update });
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
    await prisma.appUpdate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

