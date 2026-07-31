import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get('codeforge_session')?.value;
    const authHeader = req.headers.get('Authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const payload = verifyToken(cookieToken || headerToken || '');

    const targetUserId = payload?.userId || 'guest';

    const cards = await prisma.revisionCard.findMany({
      where: { userId: targetUserId },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            topicTags: true,
            editorial: true,
            statement: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();
    const dueCards = cards.filter((c) => new Date(c.dueDate) <= now);
    const masteredCount = cards.filter((c) => c.repetitions >= 3).length;

    return NextResponse.json({
      cards,
      dueCards,
      stats: {
        totalCards: cards.length,
        dueTodayCount: dueCards.length,
        masteredCount,
        learnedMistakeCount: cards.filter((c) => c.failureCount > 0).length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error fetching revision cards:', error);
    return NextResponse.json({ error: 'Failed to fetch revision flashcards' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get('codeforge_session')?.value;
    const authHeader = req.headers.get('Authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const payload = verifyToken(cookieToken || headerToken || '');
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Sign in to review flashcards.' }, { status: 401 });
    }
    const body = await req.json();
    const { cardId, quality } = body; // quality: 'HARD' | 'GOOD' | 'EASY'

    if (!cardId || !quality) {
      return NextResponse.json({ error: 'cardId and quality are required' }, { status: 400 });
    }

    const card = await prisma.revisionCard.findUnique({
      where: { id: cardId },
    });

    if (!card || card.userId !== payload.userId) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    if (!['HARD', 'GOOD', 'EASY'].includes(quality)) {
      return NextResponse.json({ error: 'quality must be HARD, GOOD, or EASY' }, { status: 400 });
    }

    let nextInterval = card.interval;
    let nextRepetitions = card.repetitions + 1;

    if (quality === 'HARD') {
      nextInterval = 1;
    } else if (quality === 'GOOD') {
      nextInterval = Math.max(2, Math.round(card.interval * 2));
    } else if (quality === 'EASY') {
      nextInterval = Math.max(3, Math.round(card.interval * 3.5));
    }

    const nextDueDate = new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000);

    const updatedCard = await prisma.revisionCard.update({
      where: { id: cardId },
      data: {
        interval: nextInterval,
        repetitions: nextRepetitions,
        dueDate: nextDueDate,
        lastReviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      card: updatedCard,
      nextDueDate,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error updating revision card:', error);
    return NextResponse.json({ error: 'Failed to update revision flashcard' }, { status: 500 });
  }
}
