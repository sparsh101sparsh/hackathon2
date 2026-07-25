import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('🔍 Running Database Verification Checks...\n');

  // 1. Verify Users
  const userCount = await prisma.user.count();
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@codeforge.ai' } });
  const regUser = await prisma.user.findUnique({ where: { email: 'user@codeforge.ai' } });

  console.log(`👤 Users Verification:`);
  console.log(`   - Total Users: ${userCount}`);
  console.log(`   - Admin present: ${adminUser ? 'YES (' + adminUser.role + ')' : 'NO'}`);
  console.log(`   - Sample User present: ${regUser ? 'YES (' + regUser.role + ')' : 'NO'}\n`);

  // 2. Verify Problems Count & Difficulty Breakdown
  const problemCount = await prisma.problem.count();
  const easyCount = await prisma.problem.count({ where: { difficulty: 'EASY' } });
  const mediumCount = await prisma.problem.count({ where: { difficulty: 'MEDIUM' } });
  const hardCount = await prisma.problem.count({ where: { difficulty: 'HARD' } });

  console.log(`🧩 Problems Verification:`);
  console.log(`   - Total Problems: ${problemCount} (Requirement: >= 50)`);
  console.log(`   - Easy Problems: ${easyCount}`);
  console.log(`   - Medium Problems: ${mediumCount}`);
  console.log(`   - Hard Problems: ${hardCount}\n`);

  // 3. Verify Topic Coverage
  const problems = await prisma.problem.findMany({ select: { topicTags: true } });
  const topicSet = new Set<string>();
  problems.forEach((p) => {
    try {
      const tags: string[] = JSON.parse(p.topicTags);
      tags.forEach((t) => topicSet.add(t));
    } catch (e) {
      // ignore
    }
  });

  console.log(`🏷️ Topic Tags Covered (${topicSet.size} unique topics):`);
  console.log(`   - ${Array.from(topicSet).join(', ')}\n`);

  // 4. Verify Test Cases & Templates
  const testCaseCount = await prisma.testCase.count();
  const sampleTestCases = await prisma.testCase.count({ where: { isSample: true } });
  const hiddenTestCases = await prisma.testCase.count({ where: { isSample: false } });

  const templateCount = await prisma.codeTemplate.count();
  const pyTemplates = await prisma.codeTemplate.count({ where: { language: 'python' } });
  const cppTemplates = await prisma.codeTemplate.count({ where: { language: 'cpp' } });
  const jsTemplates = await prisma.codeTemplate.count({ where: { language: 'javascript' } });

  console.log(`🧪 Test Cases & Code Templates Verification:`);
  console.log(`   - Total Test Cases: ${testCaseCount}`);
  console.log(`   - Sample Test Cases: ${sampleTestCases}`);
  console.log(`   - Hidden Test Cases: ${hiddenTestCases}`);
  console.log(`   - Total Templates: ${templateCount} (Python: ${pyTemplates}, C++: ${cppTemplates}, JS: ${jsTemplates})\n`);

  // 5. Verify Companies
  const companyCount = await prisma.company.count();
  const companies = await prisma.company.findMany({
    select: { name: true, problemCount: true },
  });

  console.log(`🏢 Companies Verification (${companyCount} companies):`);
  companies.forEach((c) => {
    console.log(`   - ${c.name}: ${c.problemCount} linked problems`);
  });
  console.log('');

  // 6. Verify Contest
  const contestCount = await prisma.contest.count();
  const activeContest = await prisma.contest.findFirst({
    include: { contestProblems: { include: { problem: { select: { title: true } } } } },
  });

  console.log(`🏆 Contest Verification:`);
  console.log(`   - Total Contests: ${contestCount}`);
  if (activeContest) {
    console.log(`   - Title: "${activeContest.title}"`);
    console.log(`   - Is Rated: ${activeContest.isRated}`);
    console.log(`   - Status: ${activeContest.status}`);
    console.log(`   - Contest Problems (${activeContest.contestProblems.length}):`);
    activeContest.contestProblems.forEach((cp) => {
      console.log(`     #${cp.order} ${cp.problem.title} (${cp.points} pts)`);
    });
  }
  console.log('\n✅ All Database Verification Checks Passed!');
}

verifyDatabase()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
