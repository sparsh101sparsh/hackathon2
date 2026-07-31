import { NextRequest } from 'next/server';
import { POST as hintsHandler } from '../app/api/ai/hints/route';

async function run() {
  const oversizedRequest = new NextRequest('http://localhost:3000/api/ai/hints', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      problemTitle: 'A'.repeat(301),
      userCode: 'pass',
      hintLevel: 1,
    }),
  });

  const response = await hintsHandler(oversizedRequest);
  if (response.status !== 413) {
    throw new Error(`Expected oversized hints request to return 413, got ${response.status}`);
  }

  console.log('Input boundary verification: oversized hint payload rejected before model lookup.');
}

run().catch((error) => {
  console.error('Input boundary verification failed:', error);
  process.exit(1);
});
