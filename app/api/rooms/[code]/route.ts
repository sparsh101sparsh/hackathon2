import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

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

    if (room.status === 'IN_PROGRESS' && room.startedAt) {
      const deadline = room.startedAt.getTime() + room.durationSeconds * 1000;
      if (Date.now() >= deadline) {
        await prisma.customRoom.updateMany({
          where: { id: room.id, status: 'IN_PROGRESS' },
          data: { status: 'FINISHED', endedAt: new Date() },
        });
        room.status = 'FINISHED';
        room.endedAt = new Date();
      }
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
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
    const { action, pointsToAdd = 100, progress = 'CODING' } = body;
    const session = getSessionFromRequest(req);
    const userId = session?.userId;
    const userName = session?.name;
    if (!userId) return NextResponse.json({ error: 'Sign in to use battle rooms.' }, { status: 401 });

    const room = await prisma.customRoom.findUnique({
      where: { code },
      include: { participants: true },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (action === 'START_BATTLE') {
      if (room.status !== 'WAITING') {
        return NextResponse.json({ error: 'This battle has already started.' }, { status: 409 });
      }
      if (room.mode === 'DUEL' && room.participants.length < 2) {
        return NextResponse.json({ error: 'A duel starts when both coders are in the room.' }, { status: 400 });
      }
      const updated = await prisma.customRoom.update({
        where: { id: room.id },
        data: { status: 'IN_PROGRESS', startedAt: new Date(), endedAt: null, winnerId: null },
        include: { participants: { orderBy: { score: 'desc' } } },
      });
      return NextResponse.json({ success: true, room: updated, deadline: updated.startedAt ? updated.startedAt.getTime() + updated.durationSeconds * 1000 : null });
    }

    if (action === 'LEAVE_ROOM') {
      const participant = await prisma.roomParticipant.findUnique({
        where: { roomId_userId: { roomId: room.id, userId } },
      });

      if (participant) {
        await prisma.roomParticipant.delete({
          where: { id: participant.id },
        });
      }

      const remaining = room.participants.filter((p) => p.userId !== userId);
      if (remaining.length === 0) {
        // Delete room if no participants left
        await prisma.customRoom.delete({ where: { id: room.id } });
      } else if (room.hostName === userName) {
        // Reassign host
        await prisma.customRoom.update({
          where: { id: room.id },
          data: { hostName: remaining[0].userName },
        });
      }

      return NextResponse.json({ success: true, left: true });
    }

    if (action === 'CLOSE_ROOM') {
      if (room.status === 'WAITING') {
        await prisma.customRoom.delete({ where: { id: room.id } });
        return NextResponse.json({ success: true, closed: true, deleted: true });
      } else {
        const updated = await prisma.customRoom.update({
          where: { id: room.id },
          data: { status: 'FINISHED', endedAt: new Date() },
          include: { participants: true },
        });
        return NextResponse.json({ success: true, closed: true, room: updated });
      }
    }

    if (action === 'UPDATE_PROGRESS') {
      if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
      const allowed = ['WAITING', 'CODING', 'SUBMITTED', 'SOLVED'];
      const nextProgress = allowed.includes(progress) ? progress : 'CODING';
      const participant = await prisma.roomParticipant.findUnique({ where: { roomId_userId: { roomId: room.id, userId } } });
      if (!participant) return NextResponse.json({ error: 'Join the room before updating progress.' }, { status: 403 });
      const updated = await prisma.roomParticipant.update({
        where: { id: participant.id },
        data: { progress: nextProgress },
      });
      return NextResponse.json({ success: true, participant: updated });
    }

    if (action === 'SCORE_POINTS') {
      if (!userId) {
        return NextResponse.json({ error: 'userId required' }, { status: 400 });
      }

      const participant = await prisma.roomParticipant.findUnique({ where: { roomId_userId: { roomId: room.id, userId } } });

      if (!participant) {
        return NextResponse.json({ error: 'Join the room before submitting a battle result.' }, { status: 403 });
      } else {
        if (room.status !== 'IN_PROGRESS') {
          return NextResponse.json({ success: false, finished: true, room }, { status: 409 });
        }
        await prisma.$transaction(async (tx) => {
          const currentRoom = await tx.customRoom.findUnique({ where: { id: room.id }, include: { participants: true } });
          if (!currentRoom || currentRoom.status !== 'IN_PROGRESS') return;
          const currentParticipant = currentRoom.participants.find((item) => item.userId === userId);
          if (!currentParticipant || currentParticipant.acceptedAt) return;
          const acceptedAt = new Date();
          await tx.roomParticipant.update({
            where: { id: currentParticipant.id },
            data: { score: currentParticipant.score + (Number(pointsToAdd) || 100), solved: currentParticipant.solved + 1, progress: 'SOLVED', acceptedAt },
          });
          if (currentRoom.mode === 'DUEL') {
            await tx.customRoom.update({ where: { id: currentRoom.id }, data: { status: 'FINISHED', endedAt: acceptedAt, winnerId: currentParticipant.userId } });
          }
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

      return NextResponse.json({ success: true, room: updatedRoom, finished: updatedRoom?.status === 'FINISHED', winnerId: updatedRoom?.winnerId || null });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error updating battle room:', error);
    return NextResponse.json({ error: 'Failed to update battle room' }, { status: 500 });
  }
}
