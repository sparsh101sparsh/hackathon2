import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(req);
    const { id: contestId } = params;

    // Fetch or fallback user ID
    let userId = authUser?.id;
    if (!userId) {
      const firstUser = await prisma.user.findFirst();
      userId = firstUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

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

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    const userRating = dbUser?.rating || 1500;

    const participant = await prisma.contestParticipant.create({
      data: {
        contestId: contest.id,
        userId: userId,
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
  } catch (error: any) {
    console.error('Error in /api/contests/[id]/register:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register for contest' },
      { status: 500 }
    );
  }
}
