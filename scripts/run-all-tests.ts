import { execSync } from 'child_process';
import path from 'path';

const testFiles = [
  'verify-db.ts',
  'test-piston-execution.ts',
  'test-auth-and-admin.ts',
  'test-ai-features.ts',
  'test-dashboard-contests-company.ts',
];

async function runMasterTestSuite() {
  console.log('===========================================================');
  console.log('🚀 CodeForge AI - Master E2E Verification Test Suite');
  console.log('===========================================================\n');

  let passedCount = 0;
  let totalCount = testFiles.length;
  const startTime = Date.now();

  for (let i = 0; i < testFiles.length; i++) {
    const file = testFiles[i];
    const scriptPath = path.join(__dirname, file);
    console.log(`\n-----------------------------------------------------------`);
    console.log(`[${i + 1}/${totalCount}] Running Test Suite: ${file}`);
    console.log(`-----------------------------------------------------------`);

    try {
      execSync(`npx tsx ${scriptPath}`, {
        stdio: 'inherit',
        env: { ...process.env },
      });
      console.log(`\n✅ ${file} passed successfully!`);
      passedCount++;
    } catch (error: any) {
      console.error(`\n❌ ${file} failed with exit code: ${error.status}`);
      process.exit(1);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n===========================================================');
  console.log(`🎉 MASTER TEST SUITE RESULT: 100% PASS RATE (${passedCount}/${totalCount} suites)`);
  console.log(`⏱️ Total Execution Time: ${duration}s`);
  console.log('===========================================================\n');
}

runMasterTestSuite();
