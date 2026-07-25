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
    // 1. Fetch user progress records from DB
    const allProgress = await prisma.userProgress.findMany({});
    
    // 2. Fetch all submissions to compute real statistics per user
    const allSubmissions = await prisma.submission.findMany({
      include: { problem: true },
    });

    // Group submissions by userId
    const userSubMap = new Map<string, typeof allSubmissions>();
    allSubmissions.forEach((sub) => {
      const uid = sub.userId || 'guest';
      if (!userSubMap.has(uid)) {
        userSubMap.set(uid, []);
      }
      userSubMap.get(uid)!.push(sub);
    });

    const leaderboard: LeaderboardUser[] = [];

    // If we have userProgress records or submission records, aggregate real stats
    const userIds = new Set<string>([
      ...allProgress.map((p) => p.userId || 'guest'),
      ...Array.from(userSubMap.keys()),
    ]);

    userIds.forEach((userId) => {
      const userSubs = userSubMap.get(userId) || [];
      const totalSubmissions = userSubs.length;
      const acceptedSubs = userSubs.filter((s) => s.status === 'Accepted');
      
      const solvedEasySet = new Set<string>();
      const solvedMediumSet = new Set<string>();
      const solvedHardSet = new Set<string>();

      acceptedSubs.forEach((sub) => {
        if (sub.problem) {
          if (sub.problem.difficulty === 'EASY') solvedEasySet.add(sub.problemId);
          else if (sub.problem.difficulty === 'MEDIUM') solvedEasySet.add(sub.problemId);
          else if (sub.problem.difficulty === 'HARD') solvedHardSet.add(sub.problemId);
        }
      });

      const easyCount = solvedEasySet.size;
      const medCount = solvedMediumSet.size;
      const hardCount = solvedHardSet.size;
      const totalCount = easyCount + medCount + hardCount;

      // Only include users who have made submissions or recorded progress
      if (totalSubmissions > 0 || totalCount > 0) {
        const accuracy = totalSubmissions > 0
          ? Math.round((acceptedSubs.length / totalSubmissions) * 1000) / 10
          : 0;

        const progressRec = allProgress.find((p) => (p.userId || 'guest') === userId);
        const rating = 1500; // Baseline rating

        leaderboard.push({
          rank: 0, // Will set below
          id: userId,
          name: userId === 'guest' ? 'Guest Coder' : `Coder (${userId.slice(0, 6)})`,
          email: `${userId}@codeforge.ai`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          rating,
          ratingTier: getRatingTier(rating),
          solved: {
            easy: easyCount,
            medium: medCount,
            hard: hardCount,
            total: totalCount,
          },
          accuracy,
          country: 'Global 🌐',
          joinedAt: progressRec?.lastActiveDate
            ? new Date(progressRec.lastActiveDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        });
      }
    });

    // Sort leaderboard by total solved desc, then accuracy desc
    leaderboard.sort((a, b) => b.solved.total - a.solved.total || b.accuracy - a.accuracy);

    // Assign rank
    leaderboard.forEach((user, idx) => {
      user.rank = idx + 1;
    });

    return NextResponse.json({ leaderboard });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
