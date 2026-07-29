import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomCode, userName } = body;

    if (!roomCode) {
      return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
    }

    const cleanCode = roomCode.trim().toUpperCase();

    const room = await prisma.customRoom.findUnique({
      where: { code: cleanCode },
      include: { participants: true },
    });

    if (!room) {
      return NextResponse.json({ error: 'Battle room not found. Check the code and try again.' }, { status: 404 });
    }

    const cookieToken = req.cookies.get('codeforge_session')?.value;
    const authHeader = req.headers.get('Authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const payload = verifyToken(cookieToken || headerToken || '');

    const userId = payload?.userId || `guest_${Math.floor(1000 + Math.random() * 9000)}`;
    const finalUserName = userName || payload?.name || `Coder_${Math.floor(100 + Math.random() * 900)}`;

    // Check if user is already in the room
    const alreadyParticipant = room.participants.find(p => p.userId === userId);
    if (alreadyParticipant) {
      return NextResponse.json({ success: true, roomCode: room.code, room });
    }

    // Enforce 10 player max limit
    if (room.participants.length >= 10) {
      return NextResponse.json(
        { error: 'Room is full! Maximum limit of 10 friends has been reached.' },
        { status: 400 }
      );
    }

    // Add user as participant
    await prisma.roomParticipant.create({
      data: {
        roomId: room.id,
        userId,
        userName: finalUserName,
        score: 0,
        solved: 0,
      },
    });

    const updatedRoom = await prisma.customRoom.findUnique({
      where: { id: room.id },
      include: { participants: true },
    });

    return NextResponse.json({
      success: true,
      roomCode: room.code,
      room: updatedRoom,
    });
  } catch (error: any) {
    console.error('Error joining custom room:', error);
    return NextResponse.json({ error: error.message || 'Failed to join battle room' }, { status: 500 });
  }
}
