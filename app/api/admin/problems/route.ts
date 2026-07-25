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

    const problems = await prisma.problem.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        testCases: true,
        codeTemplates: true,
        _count: {
          select: { submissions: true },
        },
      },
    });

    const formattedProblems = problems.map((p) => ({
      ...p,
      topicTags: safeParseJsonArray(p.topicTags),
      companyTags: safeParseJsonArray(p.companyTags),
    }));

    return NextResponse.json(formattedProblems);
  } catch (error: any) {
    console.error('Error fetching admin problems:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch admin problems' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      slug: customSlug,
      statement,
      inputFormat,
      outputFormat,
      constraints,
      difficulty,
      topicTags = [],
      companyTags = [],
      editorial = '',
      timeLimit = 1.0,
      memoryLimit = 256,
      sampleTestCases = [],
      hiddenTestCases = [],
      codeTemplates = [],
    } = body;

    if (!title || !statement || !inputFormat || !outputFormat || !constraints || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required problem fields (title, statement, inputFormat, outputFormat, constraints, difficulty)' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug = (customSlug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists
    const existingProblem = await prisma.problem.findUnique({ where: { slug } });
    if (existingProblem) {
      return NextResponse.json(
        { error: `Problem with slug "${slug}" already exists.` },
        { status: 400 }
      );
    }

    // Prepare JSON arrays for tags
    const topicTagsJson = Array.isArray(topicTags)
      ? JSON.stringify(topicTags)
      : typeof topicTags === 'string' && topicTags.startsWith('[')
      ? topicTags
      : JSON.stringify([topicTags].filter(Boolean));

    const companyTagsJson = Array.isArray(companyTags)
      ? JSON.stringify(companyTags)
      : typeof companyTags === 'string' && companyTags.startsWith('[')
      ? companyTags
      : JSON.stringify([companyTags].filter(Boolean));

    // Combine sample and hidden test cases
    const allTestCases = [
      ...sampleTestCases.map((tc: any) => ({
        input: tc.input || '',
        expectedOutput: tc.expectedOutput || '',
        isSample: true,
        explanation: tc.explanation || null,
      })),
      ...hiddenTestCases.map((tc: any) => ({
        input: tc.input || '',
        expectedOutput: tc.expectedOutput || '',
        isSample: false,
        explanation: tc.explanation || null,
      })),
    ];

    // Format code templates
    const templatesData = Array.isArray(codeTemplates)
      ? codeTemplates.map((t: any) => ({
          language: t.language.toLowerCase(),
          code: t.code,
        }))
      : [];

    // Create problem in database
    const createdProblem = await prisma.problem.create({
      data: {
        title,
        slug,
        statement,
        inputFormat,
        outputFormat,
        constraints,
        difficulty: difficulty.toUpperCase(),
        topicTags: topicTagsJson,
        companyTags: companyTagsJson,
        editorial: editorial || '',
        timeLimit: parseFloat(String(timeLimit)) || 1.0,
        memoryLimit: parseInt(String(memoryLimit), 10) || 256,
        testCases: {
          create: allTestCases,
        },
        codeTemplates: {
          create: templatesData,
        },
      },
      include: {
        testCases: true,
        codeTemplates: true,
      },
    });

    return NextResponse.json(
      {
        ...createdProblem,
        topicTags: safeParseJsonArray(createdProblem.topicTags),
        companyTags: safeParseJsonArray(createdProblem.companyTags),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating problem:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create problem' },
      { status: 500 }
    );
  }
}

function safeParseJsonArray(str: string): string[] {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}
