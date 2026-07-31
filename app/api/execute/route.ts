import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeCode } from '@/lib/piston';
import { ExecutionVerdict, TestCaseResult } from '@/lib/types';

function normalizeOutput(str: string): string {
  return str.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problemId, language, code, customInput } = body;

    if (!language || !code) {
      return NextResponse.json(
        { error: 'Language and code are required' },
        { status: 400 }
      );
    }

    // Scenario 1: Custom input execution
    if (customInput !== undefined && customInput !== null) {
      const result = await executeCode(language, code, customInput);
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
      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        include: {
          testCases: {
            where: { isSample: true },
          },
        },
      });

      if (!problem) {
        return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
      }

      const sampleTestCases = problem.testCases;
      if (!sampleTestCases || sampleTestCases.length === 0) {
        // Fallback if no sample test cases exist
        const result = await executeCode(language, code, '');
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
        const execResult = await executeCode(language, code, tc.input);
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
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error executing code:', error);
    return NextResponse.json(
      { error: message || 'Execution error' },
      { status: 500 }
    );
  }
}
