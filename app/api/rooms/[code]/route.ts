import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code.trim().toUpperCase();

    const room = await prisma.customRoom.findUnique({
      where: { code },
      include: {
        participants: {
          orderBy: [{ score: 'desc' }, { solved: 'desc' }, { joinedAt: 'asc' }],
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const problemIds: string[] = JSON.parse(room.problemIds || '[]');
    const problems = await prisma.problem.findMany({
      where: { id: { in: problemIds } },
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        statement: true,
        constraints: true,
        inputFormat: true,
        outputFormat: true,
        topicTags: true,
        testCases: {
          where: { isSample: true },
          select: { id: true, input: true, expectedOutput: true, isSample: true },
        },
        codeTemplates: true,
      },
    });

    return NextResponse.json({
      room,
      problems,
    });
  } catch (error: any) {
    console.error('Error fetching custom room:', error);
    return NextResponse.json({ error: 'Failed to fetch battle room' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code.trim().toUpperCase();
    const body = await req.json();
    const { action, userId, userName, pointsToAdd = 100 } = body;

    const room = await prisma.customRoom.findUnique({
      where: { code },
      include: { participants: true },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (action === 'START_BATTLE') {
      const updated = await prisma.customRoom.update({
        where: { id: room.id },
        data: { status: 'IN_PROGRESS' },
        include: { participants: { orderBy: { score: 'desc' } } },
      });
      return NextResponse.json({ success: true, room: updated });
    }

    if (action === 'SCORE_POINTS') {
      if (!userId) {
        return NextResponse.json({ error: 'userId required' }, { status: 400 });
      }

      const participant = await prisma.roomParticipant.findUnique({
        where: {
          roomId_userId: {
            roomId: room.id,
            userId,
          },
        },
      });

      if (!participant) {
        // Create if not existing
        await prisma.roomParticipant.create({
          data: {
            roomId: room.id,
            userId,
            userName: userName || 'Coder',
            score: pointsToAdd,
            solved: 1,
          },
        });
      } else {
        await prisma.roomParticipant.update({
          where: { id: participant.id },
          data: {
            score: participant.score + pointsToAdd,
            solved: participant.solved + 1,
          },
        });
      }

      const updatedRoom = await prisma.customRoom.findUnique({
        where: { id: room.id },
        include: {
          participants: {
            orderBy: [{ score: 'desc' }, { solved: 'desc' }],
          },
        },
      });

      return NextResponse.json({ success: true, room: updatedRoom });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating battle room:', error);
    return NextResponse.json({ error: 'Failed to update battle room' }, { status: 500 });
  }
}
