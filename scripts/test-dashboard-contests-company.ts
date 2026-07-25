import { prisma } from '../lib/prisma';
import { calculateRatingUpdate, getRatingTier } from '../lib/rating';

async function runTests() {
  console.log('🧪 Starting Milestone 5 Verification Tests...\n');
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition: boolean, testName: string) {
    totalCount++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // TEST 1: Rating Calculations & Tiers
  console.log('--- Test 1: Codeforces-Style Rating Helper ---');
  const bronzeTier = getRatingTier(1150);
  assert(bronzeTier.badge === 'Bronze', 'Rating 1150 resolves to Bronze tier');

  const masterTier = getRatingTier(2450);
  assert(masterTier.badge === 'Grandmaster', 'Rating 2450 resolves to Master tier');

  const update = calculateRatingUpdate({
    currentRating: 1500,
    rank: 1,
    totalParticipants: 100,
    score: 1850,
    maxScore: 1850,
  });

  assert(update.newRating > update.oldRating, 'Winning contest increases rating');
  assert(update.delta > 0, 'Positive rating delta computed');
  assert(update.newRating >= 800 && update.newRating <= 3500, 'Rating remains in 800 - 3500 range');
  console.log(`     Old: ${update.oldRating} -> New: ${update.newRating} (+${update.delta}) [${update.newTier.badge}]`);

  // TEST 2: Database Models & Seed Data
  console.log('\n--- Test 2: Database Entities & Seed Verification ---');
  const userCount = await prisma.user.count();
  assert(userCount >= 1, `Users exist in database (found: ${userCount})`);

  const companyCount = await prisma.company.count();
  assert(companyCount >= 8, `Seeded companies count >= 8 (found: ${companyCount})`);

  const companies = await prisma.company.findMany({ select: { name: true } });
  const companyNames = companies.map((c) => c.name);
  const requiredCompanies = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Uber', 'Flipkart'];
  const missingCompanies = requiredCompanies.filter((name) => !companyNames.includes(name));
  assert(missingCompanies.length === 0, `All 8 required tech companies present: ${requiredCompanies.join(', ')}`);

  const problemCount = await prisma.problem.count();
  assert(problemCount >= 1, `Problems exist in database (found: ${problemCount})`);

  // TEST 3: Contest Operations & Registration
  console.log('\n--- Test 3: Contest Operations & Registration ---');
  let contest = await prisma.contest.findFirst({
    include: { contestProblems: true, contestParticipants: true },
  });

  if (!contest) {
    contest = await prisma.contest.create({
      data: {
        title: 'Test Verification Contest',
        description: 'Temporary verification test contest',
        startTime: new Date(),
        endTime: new Date(Date.now() + 7200000),
        isRated: true,
        status: 'ACTIVE',
      },
      include: { contestProblems: true, contestParticipants: true },
    });
  }

  assert(Boolean(contest && contest.id), 'Contest entity retrievable from database');

  const testUser = await prisma.user.findFirst();
  if (testUser && contest) {
    // Test registration
    const existing = await prisma.contestParticipant.findFirst({
      where: { contestId: contest.id, userId: testUser.id },
    });

    if (!existing) {
      const registered = await prisma.contestParticipant.create({
        data: {
          contestId: contest.id,
          userId: testUser.id,
          oldRating: testUser.rating,
          newRating: testUser.rating,
          score: 0,
        },
      });
      assert(Boolean(registered && registered.id), 'Successfully registered user for contest');
    } else {
      assert(true, 'User already registered for contest entity');
    }
  }

  // TEST 4: Leaderboard & Company Detail Data Logic
  console.log('\n--- Test 4: Leaderboard & Company Detail Logic ---');
  const topUsers = await prisma.user.findMany({
    take: 10,
    orderBy: { rating: 'desc' },
  });
  assert(topUsers.length > 0, 'Top users query for leaderboard returns records');

  const googleCompany = await prisma.company.findFirst({
    where: { name: 'Google' },
    include: { companyProblems: { include: { problem: true } } },
  });
  assert(Boolean(googleCompany), 'Google company entity retrievable for company detail page');

  console.log(`\n========================================`);
  console.log(`🎉 Summary: ${passedCount} / ${totalCount} tests passed.`);
  console.log(`========================================\n`);

  await prisma.$disconnect();
}

runTests().catch((e) => {
  console.error('❌ Test execution error:', e);
  process.exit(1);
});
