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

    // 3. Fetch all user ratings from DB
    const allUserRatings = await prisma.userRating.findMany({
      orderBy: { timestamp: 'desc' },
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

    // Map latest rating per user
    const userRatingMap = new Map<string, number>();
    allUserRatings.forEach((ur) => {
      const uid = ur.userId || 'guest';
      if (!userRatingMap.has(uid)) {
        userRatingMap.set(uid, ur.rating);
      }
    });

    const userIds = new Set<string>([
      ...allProgress.map((p) => p.userId || 'guest'),
      ...Array.from(userSubMap.keys()),
    ]);

    // Fetch DB Users for real names and emails
    const dbUsers = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: { id: true, name: true, email: true },
    });
    const dbUserMap = new Map(dbUsers.map((u) => [u.id, u]));

    const leaderboard: LeaderboardUser[] = [];

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
          else if (sub.problem.difficulty === 'MEDIUM') solvedMediumSet.add(sub.problemId);
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
        const rating = userRatingMap.get(userId) || 0; // Default 0 for unrated users
        const dbUser = dbUserMap.get(userId);

        leaderboard.push({
          rank: 0,
          id: userId,
          name: dbUser?.name || (userId === 'guest' ? 'Guest Coder' : `Coder (${userId.slice(0, 6)})`),
          email: dbUser?.email || `${userId}@codeforge.ai`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbUser?.name || userId}`,
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

    // Sort leaderboard by rating desc, then total solved desc
    leaderboard.sort((a, b) => b.rating - a.rating || b.solved.total - a.solved.total || b.accuracy - a.accuracy);

    // Assign rank
    leaderboard.forEach((user, idx) => {
      user.rank = idx + 1;
    });

    return NextResponse.json({ leaderboard });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: message || 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
