import fs from 'node:fs';

const visualizerPath = 'components/problems/ProblemVisualizer.tsx';
const scenePath = 'components/problems/VisualizerScene.tsx';
const libraryPath = 'app/visualizer/page.tsx';
const visualizer = fs.readFileSync(visualizerPath, 'utf8');
const scene = fs.readFileSync(scenePath, 'utf8');
const library = fs.readFileSync(libraryPath, 'utf8');
const tutor = fs.readFileSync('components/problems/VisualizerTutor.tsx', 'utf8');
const visualizerRoute = fs.readFileSync('app/api/ai/visualizer/route.ts', 'utf8');

const requiredVisualizerMarkers = [
  'className="px-5 sm:px-8 flex-1 space-y-5"',
  'min-h-[380px] sm:min-h-[460px]',
  'grid lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,.85fr)]',
];

for (const marker of requiredVisualizerMarkers) {
  if (!visualizer.includes(marker)) {
    throw new Error(`Visualizer layout contract missing: ${marker}`);
  }
}

if (visualizer.includes('xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.75fr)]')) {
  throw new Error('Visualizer scene must not share its primary row with the support panels.');
}

if (!scene.includes('min-h-[360px]')) {
  throw new Error('Visualizer scene must retain a stable minimum render height.');
}

if (!library.includes('titleFromPath(selected.lessonPath)')) {
  throw new Error('Visualizer workspace links must fall back to the canonical lesson slug.');
}

if (!tutor.includes('new AbortController()') || !tutor.includes('15_000')) {
  throw new Error('Visualizer tutor must bound client-side provider requests.');
}

if (!visualizerRoute.includes('timeoutMs: 12_000') || !visualizerRoute.includes('fallbackText:')) {
  throw new Error('Visualizer API must provide bounded provider fallback behavior.');
}

console.log('Visualizer layout verification: full-width scene and stable render height are preserved.');
