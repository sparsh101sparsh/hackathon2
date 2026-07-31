import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [
  'components/navbar/Navbar.tsx',
  'components/footer/Footer.tsx',
  'app/dashboard/page.tsx',
  'components/dashboard/TeachingStyleSelector.tsx',
  'components/dashboard/WeeklyInsights.tsx',
  'app/problems/page.tsx',
  'app/problems/[id]/page.tsx',
  'app/login/page.tsx',
  'app/register/page.tsx',
  'app/mock-interview/page.tsx',
  'components/editor/EditorWorkspace.tsx',
  'components/guidance/ProgressiveHints.tsx',
  'components/guidance/TutorDrawer.tsx',
  'components/landing/HeroSection.tsx',
  'components/landing/CoreFeaturesGrid.tsx',
  'app/leaderboard/page.tsx',
  'components/dashboard/BadgesGrid.tsx',
  'components/dashboard/RatingHistoryChart.tsx',
];

const forbidden = [
  /bg-gradient-to-(r|br|tr)/,
  /from-(cyan|purple|indigo)-/,
  /(?:text|bg)-(cyan|purple|indigo)-/,
];

const failures: string[] = [];
for (const relative of files) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(source)) failures.push(`${relative}: ${pattern}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Shared surface contract: ${files.length} files passed.`);
