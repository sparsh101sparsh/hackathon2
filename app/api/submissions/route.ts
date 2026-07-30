import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeCode } from '@/lib/piston';
import { ExecutionVerdict, TestCaseResult } from '@/lib/types';
import { getSessionFromRequest } from '@/lib/auth';
import { buildRevisionLearning, snapshotForRevision } from '@/lib/revisionLearning';

export const dynamic = 'force-dynamic';

function normalizeOutput(str: string): string {
  return str.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problemId, language, code } = body;

    if (!problemId || !language || !code) {
      return NextResponse.json(
        { error: 'problemId, language, and code are required' },
        { status: 400 }
      );
    }

    const session = getSessionFromRequest(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Sign in to submit code and save progress.' }, { status: 401 });
    }
    const activeUserId = session.userId;

    // Fetch problem and all test cases
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { testCases: true },
    });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const testCases = problem.testCases;
    if (testCases.length === 0) {
      return NextResponse.json(
        { error: 'Problem has no test cases configured' },
        { status: 400 }
      );
    }

    let overallVerdict: ExecutionVerdict = 'Accepted';
    let totalTime = 0;
    let maxMemory = 0;
    let passedCount = 0;
    let failedTestCaseInfo: {
      input: string;
      expectedOutput: string;
      actualOutput: string;
      error?: string;
    } | null = null;

    const testResults: TestCaseResult[] = [];

    for (const tc of testCases) {
      const execResult = await executeCode(language, code, tc.input);
      totalTime += execResult.executionTime;
      maxMemory = Math.max(maxMemory, execResult.memory);

      if (execResult.verdict === 'Compilation Error') {
        overallVerdict = 'Compilation Error';
        failedTestCaseInfo = {
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: execResult.stdout,
          error: execResult.stderr,
        };
        testResults.push({
          testCaseId: tc.id,
          passed: false,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: execResult.stdout,
          error: execResult.stderr,
          executionTime: execResult.executionTime,
          memory: execResult.memory,
          verdict: 'Compilation Error',
        });
        break;
      }

      if (execResult.verdict === 'Runtime Error') {
        if (overallVerdict === 'Accepted') overallVerdict = 'Runtime Error';
        if (!failedTestCaseInfo) {
          failedTestCaseInfo = {
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: execResult.stdout,
            error: execResult.stderr,
          };
        }
        testResults.push({
          testCaseId: tc.id,
          passed: false,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: execResult.stdout,
          error: execResult.stderr,
          executionTime: execResult.executionTime,
          memory: execResult.memory,
          verdict: 'Runtime Error',
        });
        continue;
      }

      if (execResult.verdict === 'TLE') {
        if (overallVerdict === 'Accepted') overallVerdict = 'TLE';
        if (!failedTestCaseInfo) {
          failedTestCaseInfo = {
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: execResult.stdout,
            error: 'Time Limit Exceeded',
          };
        }
        testResults.push({
          testCaseId: tc.id,
          passed: false,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: execResult.stdout,
          error: 'Time Limit Exceeded',
          executionTime: execResult.executionTime,
          memory: execResult.memory,
          verdict: 'TLE',
        });
        continue;
      }

      // Check string output matching
      const normActual = normalizeOutput(execResult.stdout);
      const normExpected = normalizeOutput(tc.expectedOutput);

      if (normActual === normExpected) {
        passedCount++;
        testResults.push({
          testCaseId: tc.id,
          passed: true,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: execResult.stdout,
          executionTime: execResult.executionTime,
          memory: execResult.memory,
          verdict: 'Accepted',
        });
      } else {
        if (overallVerdict === 'Accepted') {
          overallVerdict = 'Wrong Answer';
        }
        if (!failedTestCaseInfo) {
          failedTestCaseInfo = {
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: execResult.stdout,
          };
        }
        testResults.push({
          testCaseId: tc.id,
          passed: false,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: execResult.stdout,
          executionTime: execResult.executionTime,
          memory: execResult.memory,
          verdict: 'Wrong Answer',
        });
      }
    }

    const avgExecutionTime = Number((totalTime / testCases.length).toFixed(3));

    // Save submission to database
    const submission = await prisma.submission.create({
      data: {
        userId: activeUserId,
        problemId,
        code,
        language,
        status: overallVerdict,
        executionTime: avgExecutionTime,
        memory: maxMemory,
        failedTestCase: failedTestCaseInfo ? JSON.stringify(failedTestCaseInfo) : null,
      },
    });

    // Update user progress if Accepted
    if (overallVerdict === 'Accepted') {
      try {
        const difficulty = problem.difficulty;
        const existingProgress = await prisma.userProgress.findUnique({
          where: { userId: activeUserId },
        });

        if (existingProgress) {
          const updateData: any = { lastActiveDate: new Date() };
          if (difficulty === 'EASY') updateData.solvedEasy = existingProgress.solvedEasy + 1;
          if (difficulty === 'MEDIUM') updateData.solvedMedium = existingProgress.solvedMedium + 1;
          if (difficulty === 'HARD') updateData.solvedHard = existingProgress.solvedHard + 1;

          await prisma.userProgress.update({
            where: { userId: activeUserId },
            data: updateData,
          });
        } else {
          await prisma.userProgress.create({
            data: {
              userId: activeUserId,
              solvedEasy: difficulty === 'EASY' ? 1 : 0,
              solvedMedium: difficulty === 'MEDIUM' ? 1 : 0,
              solvedHard: difficulty === 'HARD' ? 1 : 0,
              streak: 1,
              lastActiveDate: new Date(),
            },
          });
        }
      } catch (progressError) {
        console.error('Error updating user progress:', progressError);
      }

      // Keep successful problems in the deck while preserving any learned failure history.
      try {
        let parsedTopics = [];
        try { parsedTopics = JSON.parse(problem.topicTags || '[]'); } catch {}
        const pattern = parsedTopics[0] || 'General DSA';

        const nextDueDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day initial revision interval

        await prisma.revisionCard.upsert({
          where: {
            userId_problemId: {
              userId: activeUserId,
              problemId: problem.id,
            },
          },
          create: {
            userId: activeUserId,
            problemId: problem.id,
            pattern,
            keyTakeaway: `Mastered ${problem.title}. Review optimal approach and edge cases.`,
            dueDate: nextDueDate,
          },
          update: {
            dueDate: nextDueDate,
            keyTakeaway: `Mastered ${problem.title}. Review the learned edge cases and optimal approach.`,
          },
        });
      } catch (revError) {
        console.error('Error creating revision flashcard:', revError);
      }
    }

    let learning: {
      failureCount: number;
      failureType: ExecutionVerdict;
      pattern: string;
    } | null = null;

    if (overallVerdict !== 'Accepted' && failedTestCaseInfo) {
      try {
        const revision = buildRevisionLearning(overallVerdict, problem.topicTags, failedTestCaseInfo);
        const snapshot = snapshotForRevision(failedTestCaseInfo);
        const existingCard = await prisma.revisionCard.findUnique({
          where: { userId_problemId: { userId: activeUserId, problemId: problem.id } },
          select: { failureCount: true },
        });
        const failureCount = (existingCard?.failureCount || 0) + 1;

        await prisma.revisionCard.upsert({
          where: {
            userId_problemId: {
              userId: activeUserId,
              problemId: problem.id,
            },
          },
          create: {
            userId: activeUserId,
            problemId: problem.id,
            pattern: revision.pattern,
            keyTakeaway: revision.keyTakeaway,
            interval: 1,
            repetitions: 0,
            dueDate: new Date(),
            failureCount,
            lastFailureType: revision.failureType,
            ...snapshot,
            learnedAt: new Date(),
          },
          update: {
            pattern: revision.pattern,
            keyTakeaway: revision.keyTakeaway,
            interval: 1,
            repetitions: 0,
            dueDate: new Date(),
            failureCount,
            lastFailureType: revision.failureType,
            ...snapshot,
            learnedAt: new Date(),
          },
        });

        learning = {
          failureCount,
          failureType: revision.failureType,
          pattern: revision.pattern,
        };
      } catch (revError) {
        console.error('Error learning from failed submission:', revError);
      }
    }

    return NextResponse.json({
      id: submission.id,
      verdict: overallVerdict,
      passedCount,
      totalCount: testCases.length,
      executionTime: avgExecutionTime,
      memory: maxMemory,
      failedTestCase: failedTestCaseInfo,
      learning,
      testResults,
      createdAt: submission.createdAt,
    });
  } catch (error: any) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { error: error.message || 'Submission processing error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');
    const session = getSessionFromRequest(request);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));

    const whereClause: any = {};
    if (problemId) whereClause.problemId = problemId;
    whereClause.userId = session?.userId || 'guest';

    const total = await prisma.submission.count({ where: whereClause });
    const submissions = await prisma.submission.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      submissions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
