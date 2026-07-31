import { callFreeModelText } from '../lib/freemodel';

const originalEnv = {
  free1: process.env.FREEMODEL_API_KEY,
  free2: process.env.FREEMODEL_API_KEY_2,
  free3: process.env.FREEMODEL_API_KEY_3,
  gemini1: process.env.GEMINI_API_KEY,
  gemini2: process.env.GEMINI_API_KEY_2,
};
const originalFetch = globalThis.fetch;
const requests: string[] = [];

async function main() {
try {
  process.env.FREEMODEL_API_KEY = 'free-primary-test';
  process.env.FREEMODEL_API_KEY_2 = 'free-secondary-test';
  process.env.FREEMODEL_API_KEY_3 = '';
  process.env.GEMINI_API_KEY = 'gemini-primary-test';
  process.env.GEMINI_API_KEY_2 = 'gemini-secondary-test';

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    requests.push(url);
    if (url.includes('freemodel.dev')) return new Response('unavailable', { status: 503 });
    const key = new URL(url).searchParams.get('key');
    if (key === 'gemini-primary-test') return new Response('unauthorized', { status: 401 });
    return Response.json({ candidates: [{ content: { parts: [{ text: 'gemini-secondary-success' }] } }] });
  }) as typeof fetch;

  const reply = await callFreeModelText({
    messages: [{ role: 'user', content: 'test fallback' }],
    timeoutMs: 5_000,
  });

  if (reply !== 'gemini-secondary-success') throw new Error(`Unexpected Gemini fallback reply: ${reply}`);
  if (requests.length !== 4 || !requests[2].includes('key=gemini-primary-test') || !requests[3].includes('key=gemini-secondary-test')) {
    throw new Error(`Unexpected provider order: ${requests.join(', ')}`);
  }
  console.log('Gemini failover verification passed: FreeModel keys -> Gemini keys in order.');
} finally {
  globalThis.fetch = originalFetch;
  process.env.FREEMODEL_API_KEY = originalEnv.free1;
  process.env.FREEMODEL_API_KEY_2 = originalEnv.free2;
  process.env.FREEMODEL_API_KEY_3 = originalEnv.free3;
  process.env.GEMINI_API_KEY = originalEnv.gemini1;
  process.env.GEMINI_API_KEY_2 = originalEnv.gemini2;
}
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
