import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeCode, isSupportedLanguage } from '@/lib/piston';
import { ExecutionVerdict, TestCaseResult } from '@/lib/types';
import { normalizeOutput } from '@/lib/output';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const requestLimit = checkRateLimit(request, 'code-execution', 30, 60 * 1000);
    if (!requestLimit.allowed) {
      return NextResponse.json(
        { error: 'Execution rate limit reached. Please try again shortly.', retryAfter: requestLimit.retryAfter },
        { status: 429, headers: { 'Retry-After': String(requestLimit.retryAfter) } },
      );
    }
    const body = await request.json();
    const { problemId, language, code, customInput } = body;

    if (typeof language !== 'string' || typeof code !== 'string' || !language.trim() || !code.trim()) {
      return NextResponse.json(
        { error: 'Language and code are required' },
        { status: 400 }
      );
    }
    if (problemId !== undefined && problemId !== null && typeof problemId !== 'string') {
      return NextResponse.json({ error: 'problemId must be a string' }, { status: 400 });
    }
    if (customInput !== undefined && customInput !== null && typeof customInput !== 'string') {
      return NextResponse.json({ error: 'customInput must be a string' }, { status: 400 });
    }
    if (!isSupportedLanguage(language)) {
      return NextResponse.json(
        { error: 'Unsupported language. Choose Python, C++, JavaScript, Java, or Go.' },
        { status: 400 },
      );
    }
    if (language.length > 32 || code.length > 100_000) {
      return NextResponse.json({ error: 'Language or code exceeds the allowed size' }, { status: 413 });
    }
    if (typeof customInput === 'string' && customInput.length > 50_000) {
      return NextResponse.json({ error: 'Custom input exceeds the 50KB limit' }, { status: 413 });
    }

    const problem = problemId
      ? await prisma.problem.findUnique({
          where: { id: problemId },
          include: { testCases: { where: { isSample: true } } },
        })
      : null;

    if (problemId && !problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // Scenario 1: Custom input execution
    if (customInput !== undefined && customInput !== null) {
      const result = await executeCode(language, code, customInput, problem?.slug);
      return NextResponse.json({
        verdict: result.verdict,
        stdout: result.stdout,
        stderr: result.stderr,
        executionTime: result.executionTime,
        memory: result.memory,
        testResults: [
          {
            passed: result.verdict === 'Accepted',
            input: customInput,
            expectedOutput: 'N/A (Custom Run)',
            actualOutput: result.stdout,
            error: result.stderr,
            executionTime: result.executionTime,
            memory: result.memory,
            verdict: result.verdict,
          },
        ],
      });
    }

    // Scenario 2: Sample test cases execution for a given problem
    if (problemId) {
      const selectedProblem = problem;
      if (!selectedProblem) {
        return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
      }
      const sampleTestCases = selectedProblem.testCases;
      if (!sampleTestCases || sampleTestCases.length === 0) {
        // Fallback if no sample test cases exist
        const result = await executeCode(language, code, '', selectedProblem.slug);
        return NextResponse.json({
          verdict: result.verdict,
          stdout: result.stdout,
          stderr: result.stderr,
          executionTime: result.executionTime,
          memory: result.memory,
          testResults: [],
        });
      }

      let overallVerdict: ExecutionVerdict = 'Accepted';
      let totalExecutionTime = 0;
      let maxMemory = 0;
      const testResults: TestCaseResult[] = [];
      let firstStdout = '';
      let firstStderr = '';

      for (const tc of sampleTestCases) {
        const execResult = await executeCode(language, code, tc.input, selectedProblem.slug);
        totalExecutionTime += execResult.executionTime;
        maxMemory = Math.max(maxMemory, execResult.memory);

        if (!firstStdout && execResult.stdout) firstStdout = execResult.stdout;
        if (!firstStderr && execResult.stderr) firstStderr = execResult.stderr;

        let tcPassed = false;
        let tcVerdict: ExecutionVerdict = execResult.verdict;

        if (execResult.verdict === 'Compilation Error') {
          overallVerdict = 'Compilation Error';
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
        } else if (execResult.verdict === 'Runtime Error') {
          overallVerdict = 'Runtime Error';
          tcPassed = false;
        } else if (execResult.verdict === 'TLE') {
          overallVerdict = 'TLE';
          tcPassed = false;
        } else {
          // Compare outputs stripping trailing whitespace/newlines
          const normActual = normalizeOutput(execResult.stdout);
          const normExpected = normalizeOutput(tc.expectedOutput);

          if (normActual === normExpected) {
            tcPassed = true;
            tcVerdict = 'Accepted';
          } else {
            tcPassed = false;
            tcVerdict = 'Wrong Answer';
            if (overallVerdict === 'Accepted') {
              overallVerdict = 'Wrong Answer';
            }
          }
        }

        testResults.push({
          testCaseId: tc.id,
          passed: tcPassed,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: execResult.stdout,
          error: execResult.stderr,
          executionTime: execResult.executionTime,
          memory: execResult.memory,
          verdict: tcVerdict,
        });
      }

      const avgTime = Number((totalExecutionTime / sampleTestCases.length).toFixed(3));

      return NextResponse.json({
        verdict: overallVerdict,
        stdout: firstStdout,
        stderr: firstStderr,
        executionTime: avgTime,
        memory: maxMemory,
        testResults,
      });
    }

    // Default raw code execution if no problemId or customInput
    const result = await executeCode(language, code, '');
    return NextResponse.json({
      verdict: result.verdict,
      stdout: result.stdout,
      stderr: result.stderr,
      executionTime: result.executionTime,
      memory: result.memory,
      testResults: [],
    });
  } catch (error: unknown) {
    console.error('Error executing code:', error);
    return NextResponse.json(
      { error: 'Execution error' },
      { status: 500 }
    );
  }
}
