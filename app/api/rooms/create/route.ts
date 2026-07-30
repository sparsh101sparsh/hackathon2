import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'BATTLE-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, hostName, difficulty = 'MIXED', problemCount = 1, mode = 'DUEL', durationSeconds = 900 } = body;
    const battleMode = mode === 'SQUAD' ? 'SQUAD' : 'DUEL';
    const requestedProblemCount = battleMode === 'DUEL' ? 1 : Math.max(1, Math.min(5, Number(problemCount) || 3));

    const payload = getSessionFromRequest(req);
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Sign in to create a battle room.' }, { status: 401 });
    }

    const userId = payload.userId;
    const finalHostName = payload.name;

    // Pick random problems based on difficulty
    let problemWhere: any = {};
    if (difficulty === 'EASY') problemWhere.difficulty = 'EASY';
    else if (difficulty === 'MEDIUM') problemWhere.difficulty = 'MEDIUM';
    else if (difficulty === 'HARD') problemWhere.difficulty = 'HARD';

    const availableProblems = await prisma.problem.findMany({
      where: problemWhere,
      select: { id: true },
      take: 100,
    });

    if (availableProblems.length === 0) {
      return NextResponse.json({ error: 'No problems found for selected difficulty' }, { status: 400 });
    }

    // Shuffle and pick problemCount
    const shuffled = availableProblems.sort(() => 0.5 - Math.random());
    const selectedProblemIds = shuffled.slice(0, Math.min(requestedProblemCount, availableProblems.length)).map(p => p.id);

    let roomCode = generateRoomCode();
    let existing = await prisma.customRoom.findUnique({ where: { code: roomCode } });
    while (existing) {
      roomCode = generateRoomCode();
      existing = await prisma.customRoom.findUnique({ where: { code: roomCode } });
    }

    const room = await prisma.customRoom.create({
      data: {
        code: roomCode,
        name: name || `${finalHostName}'s Battle Arena`,
        hostName: finalHostName,
        maxPlayers: 10,
        difficulty,
        problemCount: selectedProblemIds.length,
        status: 'WAITING',
        problemIds: JSON.stringify(selectedProblemIds),
        mode: battleMode,
        durationSeconds: battleMode === 'DUEL' ? 900 : Math.max(300, Math.min(3600, Number(durationSeconds) || 900)),
        participants: {
          create: {
            userId,
            userName: finalHostName,
            score: 0,
            solved: 0,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    return NextResponse.json({
      success: true,
      roomCode: room.code,
      participantUserId: userId,
      room,
    });
  } catch (error: any) {
    console.error('Error creating custom battle room:', error);
    return NextResponse.json({ error: error.message || 'Failed to create battle room' }, { status: 500 });
  }
}
