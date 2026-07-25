import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const [totalUsers, totalProblems, totalSubmissions, totalContests] =
      await Promise.all([
        prisma.user.count(),
        prisma.problem.count(),
        prisma.submission.count(),
        prisma.contest.count(),
      ]);

    return NextResponse.json({
      totalUsers,
      totalProblems,
      totalSubmissions,
      totalContests,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
