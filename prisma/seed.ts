import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { problemsPart1 } from './seedData/problemsPart1';
import { problemsPart2 } from './seedData/problemsPart2';
import { problemsPart3 } from './seedData/problemsPart3';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CodeForge AI database seeding...');

  // 1. Clean existing records in correct order
  console.log('🧹 Cleaning existing data...');
  await prisma.userRating.deleteMany({});
  await prisma.userProgress.deleteMany({});
  await prisma.contestParticipant.deleteMany({});
  await prisma.contestProblem.deleteMany({});
  await prisma.contest.deleteMany({});
  await prisma.companyProblem.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.testCase.deleteMany({});
  await prisma.codeTemplate.deleteMany({});
  await prisma.problem.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Users
  console.log('👤 Seeding Users...');
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const userPasswordHash = bcrypt.hashSync('user123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@codeforge.ai',
      password: adminPasswordHash,
      name: 'Admin User',
      role: 'ADMIN',
      rating: 2100,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      userProgress: {
        create: {
          solvedEasy: 25,
          solvedMedium: 20,
          solvedHard: 7,
          streak: 15,
          lastActiveDate: new Date(),
        },
      },
    },
  });

  const sampleUser = await prisma.user.create({
    data: {
      email: 'user@codeforge.ai',
      password: userPasswordHash,
      name: 'Alex Programmer',
      role: 'REGISTERED',
      rating: 1500,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      userProgress: {
        create: {
          solvedEasy: 10,
          solvedMedium: 5,
          solvedHard: 1,
          streak: 3,
          lastActiveDate: new Date(),
        },
      },
    },
  });

  console.log(`✅ Created Admin: ${admin.email} and User: ${sampleUser.email}`);

  // 3. Seed Companies
  console.log('🏢 Seeding Companies...');
  const companyDataList = [
    { name: 'Google', logo: '/companies/google.png', description: 'Search, Cloud, AI & Tech Giant' },
    { name: 'Amazon', logo: '/companies/amazon.png', description: 'E-Commerce & Cloud Infrastructure' },
    { name: 'Microsoft', logo: '/companies/microsoft.png', description: 'Software, OS, Azure & Gaming' },
    { name: 'Meta', logo: '/companies/meta.png', description: 'Social Networks & Metaverse' },
    { name: 'Apple', logo: '/companies/apple.png', description: 'Consumer Electronics & Ecosystem' },
    { name: 'Netflix', logo: '/companies/netflix.png', description: 'Streaming Media & Content' },
    { name: 'Uber', logo: '/companies/uber.png', description: 'Ridesharing & Logistics' },
    { name: 'Flipkart', logo: '/companies/flipkart.png', description: 'Leading E-Commerce Platform' },
  ];

  const companyMap = new Map<string, string>();
  for (const comp of companyDataList) {
    const createdComp = await prisma.company.create({
      data: {
        name: comp.name,
        logo: comp.logo,
        description: comp.description,
        problemCount: 0,
      },
    });
    companyMap.set(comp.name, createdComp.id);
  }

  // 4. Seed Problems with Test Cases & Templates
  console.log('🧩 Seeding 52 Real DSA Problems...');
  const allProblems = [...problemsPart1, ...problemsPart2, ...problemsPart3];
  console.log(`Total problem objects to seed: ${allProblems.length}`);

  let totalTestCasesCreated = 0;
  let totalTemplatesCreated = 0;
  const createdProblemIds: { id: string; slug: string; difficulty: string }[] = [];

  for (const prob of allProblems) {
    const createdProblem = await prisma.problem.create({
      data: {
        title: prob.title,
        slug: prob.slug,
        statement: prob.statement,
        inputFormat: prob.inputFormat,
        outputFormat: prob.outputFormat,
        constraints: prob.constraints,
        difficulty: prob.difficulty,
        topicTags: JSON.stringify(prob.topicTags),
        companyTags: JSON.stringify(prob.companyTags),
        editorial: prob.editorial,
        timeLimit: prob.timeLimit ?? 1.0,
        memoryLimit: prob.memoryLimit ?? 256,
      },
    });

    createdProblemIds.push({
      id: createdProblem.id,
      slug: createdProblem.slug,
      difficulty: createdProblem.difficulty,
    });

    // Seed test cases
    for (const tc of prob.testCases) {
      await prisma.testCase.create({
        data: {
          problemId: createdProblem.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isSample: tc.isSample,
          explanation: tc.explanation || null,
        },
      });
      totalTestCasesCreated++;
    }

    // Seed code templates
    const templates = [
      { language: 'python', code: prob.codeTemplates.python },
      { language: 'cpp', code: prob.codeTemplates.cpp },
      { language: 'javascript', code: prob.codeTemplates.javascript },
    ];

    for (const tmpl of templates) {
      await prisma.codeTemplate.create({
        data: {
          problemId: createdProblem.id,
          language: tmpl.language,
          code: tmpl.code,
        },
      });
      totalTemplatesCreated++;
    }

    // Link Company Problems
    for (const compName of prob.companyTags) {
      const companyId = companyMap.get(compName);
      if (companyId) {
        // Random realistic frequency between 60 and 99
        const frequency = Math.floor(Math.random() * 40) + 60;
        await prisma.companyProblem.create({
          data: {
            companyId,
            problemId: createdProblem.id,
            frequency,
          },
        });
      }
    }
  }

  // Update company problem counts
  for (const [compName, compId] of companyMap.entries()) {
    const count = await prisma.companyProblem.count({ where: { companyId: compId } });
    await prisma.company.update({
      where: { id: compId },
      data: { problemCount: count },
    });
  }

  // 5. Seed 1 Active / Upcoming Rated Contest
  console.log('🏆 Seeding Rated Contest...');
  const now = new Date();
  const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now
  const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // +2 hours

  const contest = await prisma.contest.create({
    data: {
      title: 'CodeForge Weekly Contest 1',
      description: 'Test your speed and problem-solving skills in our inaugural rated contest! Solve 4 DSA challenges.',
      startTime,
      endTime,
      isRated: true,
      status: 'UPCOMING',
    },
  });

  // Pick 4 problems for the contest: Easy, Medium, Medium, Hard
  const contestProblemSlugs = [
    'two-sum',
    'search-in-rotated-sorted-array',
    'trapping-rain-water',
    'edit-distance',
  ];

  const points = [100, 250, 500, 1000];

  for (let i = 0; i < contestProblemSlugs.length; i++) {
    const slug = contestProblemSlugs[i];
    const prob = createdProblemIds.find((p) => p.slug === slug);
    if (prob) {
      await prisma.contestProblem.create({
        data: {
          contestId: contest.id,
          problemId: prob.id,
          points: points[i],
          order: i + 1,
        },
      });
    }
  }

  console.log('🎉 Seeding completed successfully!');
  console.log(`-----------------------------------`);
  console.log(`Users seeded: 2`);
  console.log(`Companies seeded: ${companyDataList.length}`);
  console.log(`Problems seeded: ${allProblems.length}`);
  console.log(`Test cases seeded: ${totalTestCasesCreated}`);
  console.log(`Code templates seeded: ${totalTemplatesCreated}`);
  console.log(`Contests seeded: 1 ("${contest.title}")`);
  console.log(`-----------------------------------`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
