import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRatingTier, RatingTier } from '@/lib/rating';

export const dynamic = 'force-dynamic';

export interface ScoreboardParticipant {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  rating: number;
  ratingTier: RatingTier;
  totalScore: number;
  penaltyTime: number; // in minutes
  problemScores: Record<string, { points: number; timeMinutes: number; attempts: number }>;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: contestId } = params;

    let dbParticipants = await prisma.contestParticipant.findMany({
      where: { contestId },
      include: {
        user: true,
      },
      orderBy: [
        { score: 'desc' },
        { finishTime: 'asc' },
      ],
    });

    const fallbackLeaderboard: ScoreboardParticipant[] = [
      {
        rank: 1,
        userId: 'p-1',
        name: 'Gennady "Tourist" Korotkevich',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Touris',
        rating: 3250,
        ratingTier: getRatingTier(3250),
        totalScore: 1850,
        penaltyTime: 42,
        problemScores: {
          p1: { points: 100, timeMinutes: 8, attempts: 1 },
          p2: { points: 250, timeMinutes: 18, attempts: 1 },
          p3: { points: 500, timeMinutes: 34, attempts: 1 },
          p4: { points: 1000, timeMinutes: 52, attempts: 1 },
        },
      },
      {
        rank: 2,
        userId: 'p-2',
        name: 'Petr Mitrichev',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Petr',
        rating: 2980,
        ratingTier: getRatingTier(2980),
        totalScore: 1850,
        penaltyTime: 58,
        problemScores: {
          p1: { points: 100, timeMinutes: 6, attempts: 1 },
          p2: { points: 250, timeMinutes: 22, attempts: 1 },
          p3: { points: 500, timeMinutes: 40, attempts: 2 },
          p4: { points: 1000, timeMinutes: 64, attempts: 1 },
        },
      },
      {
        rank: 3,
        userId: 'p-3',
        name: 'Benq (Benjamin Qi)',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Benq',
        rating: 2750,
        ratingTier: getRatingTier(2750),
        totalScore: 850,
        penaltyTime: 36,
        problemScores: {
          p1: { points: 100, timeMinutes: 10, attempts: 1 },
          p2: { points: 250, timeMinutes: 26, attempts: 1 },
          p3: { points: 500, timeMinutes: 46, attempts: 1 },
          p4: { points: 0, timeMinutes: 0, attempts: 3 },
        },
      },
      {
        rank: 4,
        userId: 'p-4',
        name: 'Alex Programmer (You)',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        rating: 1550,
        ratingTier: getRatingTier(1550),
        totalScore: 350,
        penaltyTime: 48,
        problemScores: {
          p1: { points: 100, timeMinutes: 14, attempts: 1 },
          p2: { points: 250, timeMinutes: 34, attempts: 2 },
          p3: { points: 0, timeMinutes: 0, attempts: 1 },
          p4: { points: 0, timeMinutes: 0, attempts: 0 },
        },
      },
      {
        rank: 5,
        userId: 'p-5',
        name: 'Admin User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        rating: 2100,
        ratingTier: getRatingTier(2100),
        totalScore: 350,
        penaltyTime: 62,
        problemScores: {
          p1: { points: 100, timeMinutes: 12, attempts: 1 },
          p2: { points: 250, timeMinutes: 50, attempts: 2 },
          p3: { points: 0, timeMinutes: 0, attempts: 2 },
          p4: { points: 0, timeMinutes: 0, attempts: 0 },
        },
      },
    ];

    let leaderboard: ScoreboardParticipant[] = [];

    if (dbParticipants.length > 0) {
      leaderboard = dbParticipants.map((p, idx) => ({
        rank: idx + 1,
        userId: p.userId,
        name: p.user.name,
        avatar: p.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.user.name)}`,
        rating: p.user.rating,
        ratingTier: getRatingTier(p.user.rating),
        totalScore: p.score,
        penaltyTime: p.finishTime ? Math.floor((new Date(p.finishTime).getTime() - new Date().getTime()) / 60000) : 45,
        problemScores: {
          p1: { points: Math.min(100, p.score), timeMinutes: 15, attempts: 1 },
          p2: { points: p.score >= 350 ? 250 : 0, timeMinutes: 35, attempts: 1 },
        },
      }));
    }

    if (leaderboard.length < 5) {
      const existingUserIds = new Set(leaderboard.map((l) => l.userId));
      const remaining = fallbackLeaderboard.filter((f) => !existingUserIds.has(f.userId));
      leaderboard = [...leaderboard, ...remaining];
      leaderboard.sort((a, b) => b.totalScore - a.totalScore || a.penaltyTime - b.penaltyTime);
      leaderboard = leaderboard.map((item, idx) => ({ ...item, rank: idx + 1 }));
    }

    return NextResponse.json({ leaderboard });
  } catch (error: any) {
    console.error('Error in /api/contests/[id]/leaderboard:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contest leaderboard' },
      { status: 500 }
    );
  }
}
