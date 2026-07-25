import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { getRatingTier } from '@/lib/rating';

export const dynamic = 'force-dynamic';

export interface DashboardStatsResponse {
  user: {
    name: string;
    email: string;
    avatar: string;
    rating: number;
    ratingTier: ReturnType<typeof getRatingTier>;
    streak: number;
  };
  solved: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
    totalEasy: number;
    totalMedium: number;
    totalHard: number;
  };
  accuracy: number;
  avgTime: {
    easy: string;
    medium: string;
    hard: string;
  };
  topicMastery: Array<{
    topic: string;
    solved: number;
    total: number;
    percentage: number;
  }>;
  ratingHistory: Array<{
    date: string;
    rating: number;
    delta: number;
    contestTitle: string;
  }>;
  activityMatrix: Array<{
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
  }>;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';
    unlocked: boolean;
    unlockedAt?: string;
    progress?: number;
  }>;
}

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    const userId = authUser?.id;

    // Fetch user details from DB if authenticated
    let dbUser = userId
      ? await prisma.user.findUnique({
          where: { id: userId },
          include: {
            userProgress: true,
            userRatings: {
              include: { contest: true },
              orderBy: { timestamp: 'asc' },
            },
            submissions: {
              include: { problem: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        })
      : null;

    // Fallback user if not found in DB
    if (!dbUser && userId) {
      dbUser = await prisma.user.findFirst({
        include: {
          userProgress: true,
          userRatings: {
            include: { contest: true },
            orderBy: { timestamp: 'asc' },
          },
          submissions: {
            include: { problem: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }

    // Get total counts of problems in system by difficulty
    const [totalEasy, totalMedium, totalHard] = await Promise.all([
      prisma.problem.count({ where: { difficulty: 'EASY' } }),
      prisma.problem.count({ where: { difficulty: 'MEDIUM' } }),
      prisma.problem.count({ where: { difficulty: 'HARD' } }),
    ]);

    const sysTotalEasy = Math.max(15, totalEasy);
    const sysTotalMedium = Math.max(25, totalMedium);
    const sysTotalHard = Math.max(12, totalHard);

    let solvedEasy = dbUser?.userProgress?.solvedEasy ?? 12;
    let solvedMedium = dbUser?.userProgress?.solvedMedium ?? 8;
    let solvedHard = dbUser?.userProgress?.solvedHard ?? 3;
    let streak = dbUser?.userProgress?.streak ?? 7;
    let currentRating = dbUser?.rating ?? 1550;

    // If dbUser has submissions, compute exact metrics
    let totalSubmissions = dbUser?.submissions.length ?? 45;
    let acceptedSubmissions = dbUser?.submissions.filter((s) => s.status === 'Accepted').length ?? 38;
    let accuracy = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 1000) / 10 : 84.4;

    // Calculate solved by difficulty from actual accepted submissions if present
    if (dbUser?.submissions && dbUser.submissions.length > 0) {
      const acceptedProblemIds = new Set<string>();
      let e = 0, m = 0, h = 0;
      dbUser.submissions.forEach((sub) => {
        if (sub.status === 'Accepted' && sub.problemId && !acceptedProblemIds.has(sub.problemId)) {
          acceptedProblemIds.add(sub.problemId);
          if (sub.problem.difficulty === 'EASY') e++;
          else if (sub.problem.difficulty === 'MEDIUM') m++;
          else if (sub.problem.difficulty === 'HARD') h++;
        }
      });
      if (acceptedProblemIds.size > 0) {
        solvedEasy = e;
        solvedMedium = m;
        solvedHard = h;
      }
    }

    const totalSolved = solvedEasy + solvedMedium + solvedHard;

    // 1. Topic Mastery
    const topicMasteryList = [
      { topic: 'Arrays & Hashing', solved: Math.min(15, Math.floor(solvedEasy * 0.8 + 5)), total: 20, percentage: 85 },
      { topic: 'Two Pointers', solved: Math.min(10, Math.floor(solvedMedium * 0.6 + 4)), total: 12, percentage: 75 },
      { topic: 'Sliding Window', solved: Math.min(8, Math.floor(solvedMedium * 0.5 + 3)), total: 10, percentage: 70 },
      { topic: 'Trees & Graphs', solved: Math.min(15, Math.floor(solvedMedium * 0.7 + solvedHard * 0.5 + 2)), total: 18, percentage: 65 },
      { topic: 'Dynamic Programming', solved: Math.min(12, Math.floor(solvedHard * 0.8 + 3)), total: 15, percentage: 60 },
      { topic: 'Stack & Queue', solved: Math.min(10, Math.floor(solvedEasy * 0.5 + 4)), total: 10, percentage: 90 },
    ];

    // 2. Rating History
    let ratingHistory = dbUser?.userRatings?.map((ur) => ({
      date: new Date(ur.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rating: ur.rating,
      delta: ur.delta,
      contestTitle: ur.contest?.title || 'Rated Contest',
    })) ?? [];

    if (ratingHistory.length === 0) {
      // Default rating timeline for demo & initial users
      ratingHistory = [
        { date: 'Jan 10', rating: 1200, delta: 0, contestTitle: 'Starter Contest 1' },
        { date: 'Feb 02', rating: 1280, delta: 80, contestTitle: 'Weekly Contest 12' },
        { date: 'Mar 15', rating: 1390, delta: 110, contestTitle: 'Biweekly Contest 4' },
        { date: 'Apr 20', rating: 1450, delta: 60, contestTitle: 'Weekly Contest 18' },
        { date: 'May 11', rating: 1520, delta: 70, contestTitle: 'CodeForge Grand Prix' },
        { date: 'Jun 28', rating: 1550, delta: 30, contestTitle: 'Weekly Contest 25' },
      ];
    }

    // 3. Activity Matrix (52 weeks = 364 days)
    const today = new Date();
    const activityMatrix: Array<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }> = [];
    const submissionMap = new Map<string, number>();

    if (dbUser?.submissions) {
      dbUser.submissions.forEach((sub) => {
        const dateStr = new Date(sub.createdAt).toISOString().split('T')[0];
        submissionMap.set(dateStr, (submissionMap.get(dateStr) || 0) + 1);
      });
    }

    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      let count = submissionMap.get(dateStr) || 0;

      // Seed deterministic realistic commits for mock filling if empty
      if (submissionMap.size === 0) {
        const dayOfWeek = d.getDay();
        const pseudoRand = (d.getDate() * 3 + d.getMonth() * 7 + i) % 10;
        if (pseudoRand > 5) {
          count = (pseudoRand % 4) + 1;
        }
      }

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count >= 7) level = 4;
      else if (count >= 4) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      activityMatrix.push({ date: dateStr, count, level });
    }

    // 4. Badges Criteria Status
    const badges = [
      {
        id: 'bronze-coder',
        name: 'Bronze Solver',
        description: 'Solve 10 Easy Problems',
        icon: '🥉',
        tier: 'Bronze' as const,
        unlocked: totalSolved >= 10,
        unlockedAt: totalSolved >= 10 ? '2026-02-10' : undefined,
        progress: Math.min(100, Math.round((totalSolved / 10) * 100)),
      },
      {
        id: 'silver-master',
        name: 'Silver Knight',
        description: 'Achieve 1200+ Contest Rating',
        icon: '🥈',
        tier: 'Silver' as const,
        unlocked: currentRating >= 1200,
        unlockedAt: currentRating >= 1200 ? '2026-03-01' : undefined,
        progress: Math.min(100, Math.round((currentRating / 1200) * 100)),
      },
      {
        id: 'gold-grinder',
        name: 'Gold Strategist',
        description: 'Solve 25+ Problems & 7-Day Streak',
        icon: '🥇',
        tier: 'Gold' as const,
        unlocked: totalSolved >= 25 && streak >= 7,
        unlockedAt: totalSolved >= 25 && streak >= 7 ? '2026-04-15' : undefined,
        progress: Math.min(100, Math.round((totalSolved / 25) * 100)),
      },
      {
        id: 'platinum-wizard',
        name: 'Platinum Architect',
        description: 'Achieve 1600+ Rating & Solve 10 Mediums',
        icon: '💎',
        tier: 'Platinum' as const,
        unlocked: currentRating >= 1600 && solvedMedium >= 10,
        unlockedAt: undefined,
        progress: Math.min(100, Math.round((currentRating / 1600) * 100)),
      },
      {
        id: 'diamond-titan',
        name: 'Diamond Titan',
        description: 'Reach 1900+ Rating in Rated Contests',
        icon: '👑',
        tier: 'Diamond' as const,
        unlocked: currentRating >= 1900,
        unlockedAt: undefined,
        progress: Math.min(100, Math.round((currentRating / 1900) * 100)),
      },
      {
        id: 'grandmaster-legend',
        name: 'Master Overlord',
        description: 'Reach Master (2400+) Rating Status',
        icon: '⚡',
        tier: 'Master' as const,
        unlocked: currentRating >= 2400,
        unlockedAt: undefined,
        progress: Math.min(100, Math.round((currentRating / 2400) * 100)),
      },
    ];

    const responseData: DashboardStatsResponse = {
      user: {
        name: dbUser?.name || 'Alex Programmer',
        email: dbUser?.email || 'user@codeforge.ai',
        avatar: dbUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        rating: currentRating,
        ratingTier: getRatingTier(currentRating),
        streak,
      },
      solved: {
        easy: solvedEasy,
        medium: solvedMedium,
        hard: solvedHard,
        total: totalSolved,
        totalEasy: sysTotalEasy,
        totalMedium: sysTotalMedium,
        totalHard: sysTotalHard,
      },
      accuracy,
      avgTime: {
        easy: '11 min',
        medium: '24 min',
        hard: '42 min',
      },
      topicMastery: topicMasteryList,
      ratingHistory,
      activityMatrix,
      badges,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error in /api/dashboard/stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
