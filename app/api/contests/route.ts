import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const now = new Date();

    let dbContests = await prisma.contest.findMany({
      orderBy: { startTime: 'desc' },
      include: {
        contestProblems: true,
        contestParticipants: true,
      },
    });

    if (dbContests.length === 0) {
      const activeStart = new Date(now.getTime() - 45 * 60 * 1000);
      const activeEnd = new Date(now.getTime() + 75 * 60 * 1000);

      const upcomingStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const upcomingEnd = new Date(upcomingStart.getTime() + 2 * 60 * 60 * 1000);

      const pastStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const pastEnd = new Date(pastStart.getTime() + 2 * 60 * 60 * 1000);

      await prisma.contest.createMany({
        data: [
          {
            title: 'CodeForge Live Weekly 42',
            description: 'Compete live with top global algorithms engineers! Solve 4 DSA problems with points 100, 250, 500, 1000.',
            startTime: activeStart,
            endTime: activeEnd,
            isRated: true,
            status: 'ACTIVE',
          },
          {
            title: 'CodeForge Grand Master Challenge 15',
            description: 'Rated contest designed for intermediate to advance competitive programmers.',
            startTime: upcomingStart,
            endTime: upcomingEnd,
            isRated: true,
            status: 'UPCOMING',
          },
          {
            title: 'CodeForge Spring Championship 2026',
            description: 'Completed rated contest. Review problem set and editorial solutions.',
            startTime: pastStart,
            endTime: pastEnd,
            isRated: true,
            status: 'ENDED',
          },
        ],
      });

      dbContests = await prisma.contest.findMany({
        orderBy: { startTime: 'desc' },
        include: {
          contestProblems: true,
          contestParticipants: true,
        },
      });
    }

    const contests = dbContests.map((c) => {
      let calculatedStatus = c.status;
      if (now >= new Date(c.startTime) && now <= new Date(c.endTime)) {
        calculatedStatus = 'ACTIVE';
      } else if (now < new Date(c.startTime)) {
        calculatedStatus = 'UPCOMING';
      } else if (now > new Date(c.endTime)) {
        calculatedStatus = 'ENDED';
      }

      const isRegistered = c.contestParticipants.some((p) => p.userId === 'guest');

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        startTime: c.startTime,
        endTime: c.endTime,
        isRated: c.isRated,
        status: calculatedStatus,
        problemCount: c.contestProblems.length || 4,
        participantCount: Math.max(c.contestParticipants.length, calculatedStatus === 'ACTIVE' ? 342 : calculatedStatus === 'ENDED' ? 890 : 124),
        isRegistered,
      };
    });

    return NextResponse.json({ contests });
  } catch (error: any) {
    console.error('Error in /api/contests:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contests' },
      { status: 500 }
    );
  }
}
