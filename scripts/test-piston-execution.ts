import { prisma } from '../lib/prisma';
import { executeCode } from '../lib/piston';

async function runVerification() {
  console.log('🚀 Starting Piston API & Code Execution Verification...');
  let hasFailures = false;

  try {
    // 1. Verify Piston API Execution Client directly (Python & JS)
    console.log('\n--- 1. Testing lib/piston.ts execution client ---');
    const pyCode = `import sys
input_data = sys.stdin.read().split()
if input_data:
    a, b = map(int, input_data[:2])
    print(a + b)
`;

    const pyRes = await executeCode('python', pyCode, '5 7');
    console.log('Python Execution Result:', pyRes);
    if (pyRes.verdict === 'Accepted' && pyRes.stdout.trim() === '12') {
      console.log('✅ Python execution: PASSED');
    } else {
      console.error('❌ Python execution: FAILED', pyRes);
      hasFailures = true;
    }

    const jsCode = `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (input.length >= 2) {
  const a = parseInt(input[0], 10);
  const b = parseInt(input[1], 10);
  console.log(a + b);
}
`;

    const jsRes = await executeCode('javascript', jsCode, '10 25');
    console.log('JS Execution Result:', jsRes);
    if (jsRes.verdict === 'Accepted' && jsRes.stdout.trim() === '35') {
      console.log('✅ JavaScript execution: PASSED');
    } else {
      console.error('❌ JavaScript execution: FAILED', jsRes);
      hasFailures = true;
    }

    // 2. Fetch "Add Two Numbers" problem from DB
    console.log('\n--- 2. Fetching Add Two Numbers problem from DB ---');
    const problem = await prisma.problem.findUnique({
      where: { slug: 'add-two-numbers' },
      include: { testCases: true, codeTemplates: true },
    });

    if (!problem) {
      console.error('❌ Problem add-two-numbers not found in DB!');
      process.exit(1);
    }

    console.log(`Found problem: "${problem.title}" (${problem.id})`);
    console.log(`Test cases count: ${problem.testCases.length}`);

    // 3. Test API Execute logic (Sample Test Cases)
    console.log('\n--- 3. Testing /api/execute logic for Add Two Numbers ---');
    const pythonAddTwoCode = `import sys

def solve():
    raw = sys.stdin.read()
    lines = raw.strip().split('\\n')
    if not lines or len(lines) < 2:
        l1 = list(map(int, raw.split())) if raw.strip() else []
        l2 = []
    else:
        l1 = list(map(int, lines[0].split())) if lines[0].strip() else []
        l2 = list(map(int, lines[1].split())) if lines[1].strip() else []
    
    carry = 0
    res = []
    i, j = 0, 0
    while i < len(l1) or j < len(l2) or carry:
        v1 = l1[i] if i < len(l1) else 0
        v2 = l2[j] if j < len(l2) else 0
        total = v1 + v2 + carry
        carry = total // 10
        res.append(str(total % 10))
        i += 1
        j += 1
    
    print(' '.join(res))

solve()
`;

    const sampleTestCases = problem.testCases.filter((tc) => tc.isSample);
    let samplePassed = 0;
    for (const tc of sampleTestCases) {
      const res = await executeCode('python', pythonAddTwoCode, tc.input);
      const actual = res.stdout.trim().replace(/\s+/g, ' ');
      const expected = tc.expectedOutput.trim().replace(/\s+/g, ' ');
      if (actual === expected) {
        samplePassed++;
      } else {
        console.log(`Sample Case mismatch. Got: "${actual}", Expected: "${expected}"`);
      }
    }
    console.log(`Sample cases passed: ${samplePassed}/${sampleTestCases.length}`);
    if (samplePassed === sampleTestCases.length && sampleTestCases.length > 0) {
      console.log('✅ /api/execute sample test execution: PASSED');
    } else {
      console.error('❌ /api/execute sample test execution: FAILED');
      hasFailures = true;
    }

    // 4. Test API Submissions logic (All Hidden & Sample Test Cases)
    console.log('\n--- 4. Testing /api/submissions logic for Add Two Numbers ---');
    let allPassed = true;
    for (const tc of problem.testCases) {
      const res = await executeCode('python', pythonAddTwoCode, tc.input);
      const actual = res.stdout.trim().replace(/\s+/g, ' ');
      const expected = tc.expectedOutput.trim().replace(/\s+/g, ' ');
      if (actual !== expected) {
        console.error(`Test case failed! Input: "${tc.input.replace(/\n/g, '\\n')}", Got: "${actual}", Expected: "${expected}"`);
        allPassed = false;
      }
    }

    if (allPassed) {
      console.log('✅ Full submission test case execution: PASSED (All test cases passed)');

      // Record a test submission in DB
      const user = await prisma.user.findFirst();
      if (user) {
        const sub = await prisma.submission.create({
          data: {
            userId: user.id,
            problemId: problem.id,
            code: pythonAddTwoCode,
            language: 'python',
            status: 'Accepted',
            executionTime: 0.048,
            memory: 15.1,
          },
        });
        console.log(`✅ Saved submission record to DB with ID: ${sub.id}`);
      }
    } else {
      console.error('❌ Full submission test case execution: FAILED');
      hasFailures = true;
    }

    if (hasFailures) {
      console.error('\n❌ Verification finished with errors!');
      process.exit(1);
    } else {
      console.log('\n🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
    }
  } catch (error) {
    console.error('❌ Verification script encountered error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
