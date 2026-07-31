import fs from 'node:fs';

const visualizerPath = 'components/problems/ProblemVisualizer.tsx';
const scenePath = 'components/problems/VisualizerScene.tsx';
const visualizer = fs.readFileSync(visualizerPath, 'utf8');
const scene = fs.readFileSync(scenePath, 'utf8');

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

console.log('Visualizer layout verification: full-width scene and stable render height are preserved.');
