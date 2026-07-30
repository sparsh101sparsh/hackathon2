import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const difficulty = searchParams.get('difficulty')?.toUpperCase();
    const topic = searchParams.get('topic');
    const company = searchParams.get('company');
    const search = searchParams.get('search')?.trim();
    const solved = searchParams.get('solved');
    const session = getSessionFromRequest(request);
    const userId = session?.userId || null;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));

    // Fetch user solved problem IDs if userId provided
    let solvedProblemIds = new Set<string>();
    if (userId) {
      const acceptedSubmissions = await prisma.submission.findMany({
        where: {
          userId,
          status: 'Accepted',
        },
        select: {
          problemId: true,
        },
      });
      solvedProblemIds = new Set(acceptedSubmissions.map((s) => s.problemId));
    }

    const whereClause: any = {};

    if (difficulty && ['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
      whereClause.difficulty = difficulty;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { statement: { contains: search } },
      ];
    }

    if (topic) {
      whereClause.topicTags = { contains: topic };
    }

    if (company) {
      whereClause.companyTags = { contains: company };
    }

    // Fetch all matching candidate problems
    const allMatching = await prisma.problem.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        statement: true,
        inputFormat: true,
        outputFormat: true,
        constraints: true,
        difficulty: true,
        topicTags: true,
        companyTags: true,
        timeLimit: true,
        memoryLimit: true,
        createdAt: true,
      },
    });

    // Filter by solved status if requested
    let filteredProblems = allMatching;
    if (solved !== null && solved !== undefined && userId) {
      if (solved === 'true') {
        filteredProblems = allMatching.filter((p) => solvedProblemIds.has(p.id));
      } else if (solved === 'false') {
        filteredProblems = allMatching.filter((p) => !solvedProblemIds.has(p.id));
      }
    }

    const total = filteredProblems.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = filteredProblems.slice((page - 1) * limit, page * limit);

    // Format output
    const formattedProblems = paginated.map((p) => {
      let parsedTopicTags: string[] = [];
      let parsedCompanyTags: string[] = [];

      try {
        parsedTopicTags = JSON.parse(p.topicTags);
      } catch {
        parsedTopicTags = [];
      }

      try {
        parsedCompanyTags = JSON.parse(p.companyTags);
      } catch {
        parsedCompanyTags = [];
      }

      return {
        ...p,
        topicTags: parsedTopicTags,
        companyTags: parsedCompanyTags,
        solved: userId ? solvedProblemIds.has(p.id) : false,
      };
    });

    return NextResponse.json({
      problems: formattedProblems,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error('Error fetching problems:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch problems' },
      { status: 500 }
    );
  }
}
