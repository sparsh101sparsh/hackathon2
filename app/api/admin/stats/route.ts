import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const [totalProblems, totalSubmissions, totalContests] =
      await Promise.all([
        prisma.problem.count(),
        prisma.submission.count(),
        prisma.contest.count(),
      ]);

    return NextResponse.json({
      totalUsers: 1,
      totalProblems,
      totalSubmissions,
      totalContests,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: message || 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
