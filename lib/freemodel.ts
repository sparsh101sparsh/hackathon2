export const FREEMODEL_BASE_URL = 'https://api.freemodel.dev/v1';
export const FREEMODEL_API_KEY =
  process.env.FREEMODEL_API_KEY || 'fe_oa_dc17ddf6369f2dfdf01271ff59ac9a67ed9f9be511b7580a';

export const MODELS = {
  FAST: 'gpt-5.4-mini',
  COMPLEX: 'gpt-5.6-sol',
} as const;

export interface FreeModelMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface FreeModelOptions {
  model?: string;
  messages?: FreeModelMessage[];
  systemPrompt?: string;
  userPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  fallbackText?: string;
  fallbackJson?: any;
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
    if (options.systemPrompt && !messages.some((m) => m.role === 'system')) {
      messages.unshift({ role: 'system', content: options.systemPrompt });
    }
  } else {
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    if (options.userPrompt) {
      messages.push({ role: 'user', content: options.userPrompt });
    }
  }

  try {
    const response = await fetch(`${FREEMODEL_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${FREEMODEL_API_KEY}`,
      },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[FreeModel API Error ${response.status}]: ${errText}`);
      if (fallbackString !== undefined) {
        return fallbackString;
      }
      throw new Error(`FreeModel API request failed with status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    if (!content && fallbackString !== undefined) {
      return fallbackString;
    }
    return content;
  } catch (error: any) {
    console.warn('[FreeModel Client Notice]: Network/API connection unavailable, utilizing fallback handling.');
    if (fallbackString !== undefined) {
      return fallbackString;
    }
    throw error;
  }
}

/**
 * Call FreeModel API returning parsed JSON object.
 */
export async function callFreeModelJSON<T = any>(options: FreeModelOptions): Promise<T> {
  const text = await callFreeModelText(options);

  try {
    let clean = text.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }
    return JSON.parse(clean) as T;
  } catch (parseError: any) {
    console.error('[FreeModel JSON Parse Error]:', parseError, 'Raw response text:', text);
    if (options.fallbackJson !== undefined) {
      return options.fallbackJson as T;
    }
    throw new Error(`Failed to parse FreeModel JSON response: ${parseError.message}`);
  }
}
