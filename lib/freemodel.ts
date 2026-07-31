export const FREEMODEL_BASE_URL = process.env.FREEMODEL_BASE_URL || 'https://api.freemodel.dev/v1';
export const FREEMODEL_API_KEY = process.env.FREEMODEL_API_KEY || '';

function getFreeModelApiKeys(): string[] {
  return [
    process.env.FREEMODEL_API_KEY,
    process.env.FREEMODEL_API_KEY_2,
    process.env.FREEMODEL_API_KEY_3,
  ].filter((key, index, keys): key is string => Boolean(key?.trim()) && keys.indexOf(key) === index);
}

export function hasFreeModelProvider(): boolean {
  return getFreeModelApiKeys().length > 0;
}

export const MODELS = {
  FAST: process.env.FREEMODEL_FAST_MODEL || '',
  COMPLEX: process.env.FREEMODEL_COMPLEX_MODEL || '',
} as const;

export interface FreeModelMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface FreeModelOptions {
  model?: string;
  messages?: FreeModelMessage[];
  systemInstruction?: string;
  userInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  fallbackText?: string;
  fallbackJson?: unknown;
}

/**
 * Call FreeModel API returning raw text response.
 */
export async function callFreeModelText(options: FreeModelOptions): Promise<string> {
  const model = options.model || MODELS.FAST;
  const temperature = options.temperature ?? 0.7;
  const max_tokens = options.maxTokens ?? 2048;

  const fallbackString =
    options.fallbackText !== undefined
      ? options.fallbackText
      : options.fallbackJson !== undefined
      ? JSON.stringify(options.fallbackJson)
      : undefined;

  let messages: FreeModelMessage[] = [];
  if (options.messages && options.messages.length > 0) {
    messages = [...options.messages];
    if (options.systemInstruction && !messages.some((m) => m.role === 'system')) {
      messages.unshift({ role: 'system', content: options.systemInstruction });
    }
  } else {
    if (options.systemInstruction) {
      messages.push({ role: 'system', content: options.systemInstruction });
    }
    if (options.userInstruction) {
      messages.push({ role: 'user', content: options.userInstruction });
    }
  }

  const apiKeys = getFreeModelApiKeys();
  if (apiKeys.length === 0) {
    if (fallbackString !== undefined) return fallbackString;
    throw new Error('FREEMODEL_API_KEY is not configured');
  }

  let lastError: Error | null = null;
  const requestDeadline = options.timeoutMs === undefined
    ? null
    : Date.now() + Math.max(1, options.timeoutMs);

  for (const [index, apiKey] of apiKeys.entries()) {
    try {
      const remainingTimeout = requestDeadline === null
        ? 5000
        : requestDeadline - Date.now();
      if (remainingTimeout <= 0) {
        lastError = new Error('FreeModel provider request timed out.');
        break;
      }

      const response = await fetch(`${FREEMODEL_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(remainingTimeout),
        body: JSON.stringify({
          ...(model ? { model } : {}),
          messages,
          temperature,
          max_tokens,
        }),
      });

      if (!response.ok) {
        const errText = (await response.text()).slice(0, 500);
        lastError = new Error(`FreeModel API request failed with status ${response.status}: ${errText}`);
        console.warn(`[FreeModel API Error ${response.status}] provider ${index + 1}/${apiKeys.length}; trying next provider.`);
        continue;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || '';
      if (content) return content;

      lastError = new Error('FreeModel API returned an empty response.');
      console.warn(`[FreeModel API Empty Response] provider ${index + 1}/${apiKeys.length}; trying next provider.`);
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error('FreeModel provider request failed.');
      console.warn(`[FreeModel API Unavailable] provider ${index + 1}/${apiKeys.length}; trying next provider.`);
    }
  }

  if (fallbackString !== undefined) {
    return fallbackString;
  }
  throw lastError || new Error('All configured FreeModel providers failed.');
}

/**
 * Call FreeModel API returning parsed JSON object.
 */
export async function callFreeModelJSON<T = unknown>(options: FreeModelOptions): Promise<T> {
  const text = await callFreeModelText(options);

  try {
    let clean = text.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }
    return JSON.parse(clean) as T;
  } catch (parseError: unknown) {
    const message = parseError instanceof Error ? parseError.message : String(parseError);
    console.error('[FreeModel JSON Parse Error]:', parseError, 'Raw response text:', text);
    if (options.fallbackJson !== undefined) {
      return options.fallbackJson as T;
    }
    throw new Error(`Failed to parse FreeModel JSON response: ${message}`);
  }
}

/**
 * Alias export for callFreeModel
 */
export const callFreeModel = callFreeModelText;
