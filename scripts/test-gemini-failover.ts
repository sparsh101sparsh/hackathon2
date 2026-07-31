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
    const key = new URL(url).searchParams.get('key');
    if (url.includes('generativelanguage.googleapis.com')) {
      return Response.json({ candidates: [{ content: { parts: [{ text: 'gemini-primary-success' }] } }] });
    }
    return new Response('unexpected FreeModel call', { status: 500 });
  }) as typeof fetch;

  let reply = await callFreeModelText({
    messages: [{ role: 'user', content: 'test fallback' }],
    timeoutMs: 5_000,
  });

  if (reply !== 'gemini-primary-success' || requests.length !== 1 || !requests[0].includes('key=gemini-primary-test')) {
    throw new Error(`Gemini should be primary, got ${reply} after ${requests.join(', ')}`);
  }

  requests.length = 0;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    requests.push(url);
    if (url.includes('generativelanguage.googleapis.com')) return new Response('Gemini unavailable', { status: 503 });
    return Response.json({ choices: [{ message: { content: 'freemodel-secondary-success' } }] });
  }) as typeof fetch;
  reply = await callFreeModelText({ messages: [{ role: 'user', content: 'test fallback' }], timeoutMs: 5_000 });
  if (reply !== 'freemodel-secondary-success' || requests.length !== 3 || !requests[0].includes('key=gemini-primary-test') || !requests[1].includes('key=gemini-secondary-test') || !requests[2].includes('freemodel.dev')) {
    throw new Error(`FreeModel fallback order was incorrect: ${reply} after ${requests.join(', ')}`);
  }
  console.log('Provider order verification passed: Gemini primary -> FreeModel fallback.');
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
