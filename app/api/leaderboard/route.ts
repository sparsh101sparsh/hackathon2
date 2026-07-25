import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRatingTier, RatingTier } from '@/lib/rating';

export const dynamic = 'force-dynamic';

export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  email: string;
  avatar: string;
  rating: number;
  ratingTier: RatingTier;
  solved: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  accuracy: number;
  country: string;
  joinedAt: string;
}

export async function GET(req: NextRequest) {
  try {
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId: 'guest' },
    });

    const solvedEasy = userProgress?.solvedEasy ?? 12;
    const solvedMedium = userProgress?.solvedMedium ?? 8;
    const solvedHard = userProgress?.solvedHard ?? 3;
    const totalSolved = solvedEasy + solvedMedium + solvedHard;

    const fallbackUsers: LeaderboardUser[] = [
      {
        rank: 1,
        id: 'user-top-1',
        name: 'Gennady "Tourist" Korotkevich',
        email: 'tourist@codeforge.ai',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Touris',
        rating: 3250,
        ratingTier: getRatingTier(3250),
        solved: { easy: 180, medium: 240, hard: 195, total: 615 },
        accuracy: 96.8,
        country: 'Belarus 🇧🇾',
        joinedAt: '2025-01-15',
      },
      {
        rank: 2,
        id: 'user-top-2',
        name: 'Petr Mitrichev',
        email: 'petr@codeforge.ai',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Petr',
        rating: 2980,
        ratingTier: getRatingTier(2980),
        solved: { easy: 150, medium: 210, hard: 160, total: 520 },
        accuracy: 94.2,
        country: 'Russia 🇷🇺',
        joinedAt: '2025-02-01',
      },
      {
        rank: 3,
        id: 'user-top-3',
        name: 'Benq (Benjamin Qi)',
        email: 'benq@codeforge.ai',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Benq',
        rating: 2750,
        ratingTier: getRatingTier(2750),
        solved: { easy: 140, medium: 190, hard: 145, total: 475 },
        accuracy: 92.5,
        country: 'USA 🇺🇸',
        joinedAt: '2025-02-10',
      },
      {
        rank: 4,
        id: 'user-top-4',
        name: 'Um_nik',
        email: 'umnik@codeforge.ai',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Umnik',
        rating: 2540,
        ratingTier: getRatingTier(2540),
        solved: { easy: 130, medium: 175, hard: 120, total: 425 },
        accuracy: 91.0,
        country: 'Russia 🇷🇺',
        joinedAt: '2025-03-05',
      },
      {
        rank: 5,
        id: 'user-top-5',
        name: 'Admin Coder',
        email: 'admin@codeforge.ai',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        rating: 2100,
        ratingTier: getRatingTier(2100),
        solved: { easy: 25, medium: 20, hard: 7, total: 52 },
        accuracy: 88.5,
        country: 'India 🇮🇳',
        joinedAt: '2026-01-01',
      },
      {
        rank: 6,
        id: 'guest',
        name: 'Guest Coder (You)',
        email: 'guest@codeforge.ai',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        rating: 1550,
        ratingTier: getRatingTier(1550),
        solved: { easy: solvedEasy, medium: solvedMedium, hard: solvedHard, total: totalSolved },
        accuracy: 84.4,
        country: 'United States 🇺🇸',
        joinedAt: '2026-02-14',
      },
    ];

    return NextResponse.json({ leaderboard: fallbackUsers });
  } catch (error: any) {
    console.error('Error in /api/leaderboard:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
