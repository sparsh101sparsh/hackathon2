import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRatingTier } from '@/lib/rating';

export const dynamic = 'force-dynamic';

async function loadProfile(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, createdAt: true },
  });
  if (!user && id !== 'guest') return null;
  const displayUser = user || { id: 'guest', name: 'Guest Coder', createdAt: new Date(0) };

  const [progress, submissions, totalSubmissionCount, acceptedSubmissionCount, accepted] = await prisma.$transaction([
    prisma.userProgress.findUnique({ where: { userId: id }, select: { streak: true, lastActiveDate: true } }),
    prisma.submission.findMany({
      where: { userId: id },
      select: { status: true, problemId: true, createdAt: true, problem: { select: { difficulty: true, title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.submission.count({ where: { userId: id } }),
    prisma.submission.count({ where: { userId: id, status: 'Accepted' } }),
    prisma.submission.findMany({
      where: { userId: id, status: 'Accepted' },
      distinct: ['problemId'],
      select: { problemId: true, problem: { select: { difficulty: true } } },
    }),
  ]);

  const accuracy = totalSubmissionCount ? Math.round((acceptedSubmissionCount / totalSubmissionCount) * 1000) / 10 : 0;
  const solved = { easy: 0, medium: 0, hard: 0, total: accepted.length };
  accepted.forEach(({ problem }) => {
    if (problem.difficulty === 'EASY') solved.easy += 1;
    if (problem.difficulty === 'MEDIUM') solved.medium += 1;
    if (problem.difficulty === 'HARD') solved.hard += 1;
  });

  const ratingHistory = await prisma.userRating.findMany({
    where: { userId: id },
    select: { rating: true, delta: true, timestamp: true },
    orderBy: { timestamp: 'desc' },
    take: 20,
  });
  const rating = ratingHistory[0]?.rating || 0;

  return {
    id: displayUser.id,
    name: displayUser.name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayUser.name)}`,
    joinedAt: (user?.createdAt || progress?.lastActiveDate || new Date()).toISOString().split('T')[0],
    rating,
    ratingTier: getRatingTier(rating),
    solved,
    accuracy,
    streak: progress?.streak || 0,
    lastActiveDate: progress?.lastActiveDate?.toISOString() || null,
    consistency: Math.min(100, Math.round((progress?.streak || 0) * 10 + Math.min(accepted.length, 40))),
    ratingHistory,
    recentSubmissions: submissions.slice(0, 10).map((item) => ({
      status: item.status,
      createdAt: item.createdAt,
      problem: item.problem,
    })),
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id || id.length > 64) return NextResponse.json({ error: 'Invalid profile id' }, { status: 400 });
    const profile = await loadProfile(id);
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const compareId = new URL(request.url).searchParams.get('compare');
    const compare = compareId && compareId !== id && compareId.length <= 64 ? await loadProfile(compareId) : null;
    return NextResponse.json({ profile, compare });
  } catch (error: unknown) {
    console.error('Error fetching public profile:', error);
    return NextResponse.json({ error: 'Unable to load this profile right now.' }, { status: 500 });
  }
}
