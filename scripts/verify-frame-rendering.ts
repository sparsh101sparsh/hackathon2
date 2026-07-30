import fs from 'node:fs';
import { buildVisualizerFrames, LessonFrame } from '../components/problems/ProblemVisualizer';
import { problemVisualizerScenarios } from '../components/problems/problemVisualizerScenarios';
import { getVisualizerLesson } from '../components/problems/visualizerLessons';

interface VisualizerEntry {
  problemId: string;
  pattern: string;
  lessonPath: string;
  hasVisualizer: boolean;
}

const runtimeErrors: string[] = [];
const schemaErrors: string[] = [];
const qualityWarnings: string[] = [];

console.log('================================================================');
console.log(' INDEPENDENT VERIFICATION SCRIPT: FRAME RENDERING DATA GENERATION');
console.log('================================================================');

// 1. Load data
const scenarioSlugs = Object.keys(problemVisualizerScenarios);
const rawConfig = fs.readFileSync('public/data/visualizers.json', 'utf8');
const jsonEntries = Object.values(JSON.parse(rawConfig)) as VisualizerEntry[];

console.log(`\n[1/3] Inventory Verification:`);
console.log(` - problemVisualizerScenarios.ts contains ${scenarioSlugs.length} problem scenarios.`);
console.log(` - public/data/visualizers.json contains ${jsonEntries.length} mapped visualizer entries.`);

if (scenarioSlugs.length !== 75 || jsonEntries.length !== 75) {
  schemaErrors.push(`Expected exactly 75 scenarios and 75 mapped visualizers.`);
}

// 2. Test runtime frame rendering execution for all 75 problems
console.log(`\n[2/3] Runtime Frame Rendering Execution Test:`);

let totalFramesCount = 0;

for (const entry of jsonEntries) {
  const profile = getVisualizerLesson(entry.lessonPath, entry.pattern);
  const scenario = problemVisualizerScenarios[profile.slug];

  if (!scenario) {
    runtimeErrors.push(`Problem ${entry.problemId} (${profile.slug}): Missing scenario in problemVisualizerScenarios.`);
    continue;
  }

  // Check phase & comment quality
  if (new Set(scenario.phases).size !== 4) {
    qualityWarnings.push(`Problem ${entry.problemId} (${profile.slug}): Non-unique phases [${scenario.phases.join(', ')}]`);
  }
  if (new Set(scenario.comments).size !== 4) {
    qualityWarnings.push(`Problem ${entry.problemId} (${profile.slug}): Non-unique comments`);
  }

  try {
    // Invoke buildVisualizerFrames, which invokes buildScenarioFrames internally
    const frames = buildVisualizerFrames(entry.pattern, entry.lessonPath, entry.lessonPath);
    totalFramesCount += frames.length;

    if (frames.length !== 4) {
      schemaErrors.push(`Problem ${entry.problemId} (${profile.slug}): Expected 4 frames, produced ${frames.length}.`);
    }

    frames.forEach((frame: LessonFrame, stepIdx: number) => {
      if (!frame.visualType) {
        schemaErrors.push(`Problem ${entry.problemId} step ${stepIdx}: Missing visualType.`);
      }
      if (typeof frame.codeLine !== 'number' || frame.codeLine < 1 || frame.codeLine > profile.code.length) {
        schemaErrors.push(`Problem ${entry.problemId} step ${stepIdx}: Invalid codeLine ${frame.codeLine} (code len: ${profile.code.length}).`);
      }
      if (!frame.commentary || typeof frame.commentary !== 'string') {
        schemaErrors.push(`Problem ${entry.problemId} step ${stepIdx}: Missing or invalid commentary.`);
      }

      // Check frame payload for visualType
      switch (frame.visualType) {
        case 'array':
          if (!Array.isArray(frame.values)) schemaErrors.push(`Problem ${entry.problemId} step ${stepIdx}: Array frame missing values.`);
          break;
        case 'matrix':
          if (!Array.isArray(frame.matrix)) schemaErrors.push(`Problem ${entry.problemId} step ${stepIdx}: Matrix frame missing matrix.`);
          break;
        case 'stack':
          if (!Array.isArray(frame.stack)) schemaErrors.push(`Problem ${entry.problemId} step ${stepIdx}: Stack frame missing stack.`);
          break;
        case 'nodes':
          if (!Array.isArray(frame.nodes)) schemaErrors.push(`Problem ${entry.problemId} step ${stepIdx}: Nodes frame missing nodes.`);
          break;
        case 'graph':
          if (!Array.isArray(frame.nodes) || !Array.isArray(frame.edges)) schemaErrors.push(`Problem ${entry.problemId} step ${stepIdx}: Graph frame missing nodes/edges.`);
          break;
        case 'bars':
          if (!Array.isArray(frame.bars)) schemaErrors.push(`Problem ${entry.problemId} step ${stepIdx}: Bars frame missing bars.`);
          break;
        case 'bits':
          if (typeof frame.bits !== 'string') schemaErrors.push(`Problem ${entry.problemId} step ${stepIdx}: Bits frame missing bits.`);
          break;
      }
    });

  } catch (err: any) {
    runtimeErrors.push(`Problem ${entry.problemId} (${profile.slug}): THREW RUNTIME EXCEPTION: ${err.message || err}`);
  }
}

console.log(` - Generated and validated ${totalFramesCount} frames across 75 problems.`);
console.log(` - Runtime exceptions caught: ${runtimeErrors.length}`);
console.log(` - Schema / Data structure errors: ${schemaErrors.length}`);
console.log(` - Quality warnings (e.g. duplicate phase names): ${qualityWarnings.length}`);

if (qualityWarnings.length > 0) {
  console.log('\nQuality Warnings:');
  qualityWarnings.forEach((w) => console.log(` [WARN] ${w}`));
}

// 3. Final verdict
console.log('\n[3/3] Final Verdict:');
if (runtimeErrors.length > 0 || schemaErrors.length > 0) {
  console.error('VERIFICATION FAILED!');
  runtimeErrors.forEach((e) => console.error(` [RUNTIME ERROR] ${e}`));
  schemaErrors.forEach((e) => console.error(` [SCHEMA ERROR] ${e}`));
  process.exit(1);
} else {
  console.log('SUCCESS: All 75 problem scenarios execute frame rendering without throwing runtime errors!');
}
