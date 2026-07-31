import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: contestId } = params;
    const session = getSessionFromRequest(req);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Sign in to register for contests.' }, { status: 401 });
    }
    const userId = session.userId;

    let contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) {
      contest = await prisma.contest.findFirst();
    }

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    // Check if participant already exists
    const existingParticipant = await prisma.contestParticipant.findFirst({
      where: {
        contestId: contest.id,
        userId: userId,
      },
    });

    if (existingParticipant) {
      return NextResponse.json({
        message: 'Already registered for this contest',
        participant: existingParticipant,
        registered: true,
      });
    }

    const userRating = 0;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

    const participant = await prisma.contestParticipant.create({
      data: {
        contestId: contest.id,
        userId: userId,
        name: user?.name || session.name,
        oldRating: userRating,
        newRating: userRating,
        score: 0,
      },
    });

    return NextResponse.json({
      message: 'Successfully registered for contest',
      participant,
      registered: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error in /api/contests/[id]/register:', error);
    return NextResponse.json(
      { error: message || 'Failed to register for contest' },
      { status: 500 }
    );
  }
}
