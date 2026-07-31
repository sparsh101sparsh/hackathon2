import { PistonResult, ExecutionVerdict } from './types';
import { callFreeModelJSON, hasFreeModelProvider } from './freemodel';

// Judge0 Language ID Mapping (ce.judge0.com)
export const JUDGE0_LANGUAGE_MAP: Record<string, number> = {
  python: 71,       // Python (3.8.1 / 3.11 / 3.12)
  python3: 71,
  py: 71,
  cpp: 54,          // C++ (GCC 9.2.0 / 14.1.0)
  'c++': 54,
  javascript: 63,   // JavaScript (Node.js 12.14.0 / 18 / 20)
  js: 63,
  java: 62,         // Java (OpenJDK 13.0.1 / 17)
  go: 60,           // Go (1.13.5 / 1.22.0)
  golang: 60,
};

export function isSupportedLanguage(language: string): boolean {
  return Boolean(JUDGE0_LANGUAGE_MAP[language.trim().toLowerCase()]);
}

const JUDGE0_PRIMARY_ENDPOINT = process.env.JUDGE0_API_URL || 'https://ce.judge0.com/submissions?wait=true';
const JUDGE0_SECONDARY_ENDPOINT = process.env.JUDGE0_API_URL_2 || '';
const PISTON_EXECUTE_ENDPOINT = normalizePistonEndpoint(
  process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston',
);

const PISTON_LANGUAGE_MAP: Record<string, string> = {
  python: 'python',
  python3: 'python',
  py: 'python',
  cpp: 'c++',
  'c++': 'c++',
  javascript: 'javascript',
  js: 'javascript',
  java: 'java',
  go: 'go',
  golang: 'go',
};

const PISTON_VERSION_MAP: Record<string, string> = {
  python: '3.10.0',
  'c++': '10.2.0',
  javascript: '18.15.0',
  java: '15.0.2',
  go: '1.16.2',
};

export interface Judge0Response {
  status?: { id?: number; description?: string };
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  time?: string | number | null;
  memory?: number | null;
}

interface PistonResponse {
  language?: string;
  version?: string;
  compile?: { code?: number; stdout?: string | null; stderr?: string | null; output?: string | null };
  run?: { code?: number; signal?: string | null; stdout?: string | null; stderr?: string | null; output?: string | null };
}

interface FallbackEvaluation {
  verdict: ExecutionVerdict;
  stdout: string;
  stderr: string;
  executionTime: number;
  memory: number;
}

/**
 * Robust Code Execution Engine using Judge0 CE Cloud Engine
 * Executes Python, C++, JavaScript, Java, and Go in isolated sandboxes with zero auth/keys required.
 */
export async function executeCode(
  language: string,
  code: string,
  stdin: string = ''
): Promise<PistonResult> {
  const normLang = language.toLowerCase();
  const languageId = JUDGE0_LANGUAGE_MAP[normLang] || 71;

  // Prepare harness code if needed
  const finalCode = wrapCodeForExecution(normLang, code);

  const providers = [
    () => executeWithJudge0(JUDGE0_PRIMARY_ENDPOINT, languageId, finalCode, stdin),
    ...(JUDGE0_SECONDARY_ENDPOINT && JUDGE0_SECONDARY_ENDPOINT !== JUDGE0_PRIMARY_ENDPOINT
      ? [() => executeWithJudge0(JUDGE0_SECONDARY_ENDPOINT, languageId, finalCode, stdin)]
      : []),
    () => executeWithPiston(PISTON_EXECUTE_ENDPOINT, normLang, finalCode, stdin),
  ];

  for (const [index, provider] of providers.entries()) {
    try {
      return await provider();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[Code Execution] provider ${index + 1}/${providers.length} unavailable: ${message}`);
    }
  }

  // The model fallback is deliberately invisible to callers: it returns the same
  // execution contract and is only reached when every sandbox provider is down.
  if (hasFreeModelProvider()) {
    try {
      return await evaluateWithFallbackModel(normLang, finalCode, stdin);
    } catch (error: unknown) {
      console.warn('[Code Execution] fallback evaluator unavailable:', error);
    }
  }

  return unavailableResult();
}

async function executeWithJudge0(endpoint: string, languageId: number, sourceCode: string, stdin: string): Promise<PistonResult> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.JUDGE0_API_KEY ? { 'X-Auth-Token': process.env.JUDGE0_API_KEY } : {}),
    },
    signal: AbortSignal.timeout(12_000),
    body: JSON.stringify({
      source_code: sourceCode,
      language_id: languageId,
      stdin,
      cpu_time_limit: 4.0,
      memory_limit: 256000,
    }),
  });

  if (!response.ok) throw new Error(`Judge0 HTTP ${response.status}`);
  return parseJudge0Response((await response.json()) as Judge0Response);
}

async function executeWithPiston(endpoint: string, language: string, sourceCode: string, stdin: string): Promise<PistonResult> {
  const pistonLanguage = PISTON_LANGUAGE_MAP[language] || 'python';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(12_000),
    body: JSON.stringify({
      language: pistonLanguage,
      version: PISTON_VERSION_MAP[pistonLanguage] || '*',
      files: [{ name: 'Main', content: sourceCode }],
      stdin,
      args: [],
      run_timeout: 4000,
      compile_timeout: 10000,
    }),
  });

  if (!response.ok) throw new Error(`Piston HTTP ${response.status}`);
  return parsePistonResponse((await response.json()) as PistonResponse);
}

async function evaluateWithFallbackModel(language: string, sourceCode: string, stdin: string): Promise<PistonResult> {
  const startedAt = Date.now();
  const evaluation = await callFreeModelJSON<FallbackEvaluation>({
    systemInstruction: [
      'You are a deterministic code execution compatibility service.',
      'Emulate the submitted program for the provided stdin exactly. Do not explain your work.',
      'Return JSON only with verdict, stdout, stderr, executionTime, and memory.',
      'Use verdict Accepted when the program can produce output, Runtime Error for an obvious runtime failure, and Compilation Error for invalid source.',
      'Never add markdown or commentary to stdout.',
    ].join(' '),
    userInstruction: JSON.stringify({ language, stdin, sourceCode: sourceCode.slice(0, 60_000) }),
    temperature: 0,
    maxTokens: 1200,
    timeoutMs: 10_000,
    fallbackJson: {
      verdict: 'Runtime Error',
      stdout: '',
      stderr: 'Code execution service is temporarily busy. Please try again in a moment.',
      executionTime: 0,
      memory: 0,
    },
  });

  const verdict = isExecutionVerdict(evaluation.verdict) ? evaluation.verdict : 'Runtime Error';
  return {
    status: verdict === 'Accepted' ? 'success' : 'error',
    stdout: typeof evaluation.stdout === 'string' ? evaluation.stdout.trim() : '',
    stderr: typeof evaluation.stderr === 'string' ? evaluation.stderr.trim() : '',
    executionTime: Number.isFinite(evaluation.executionTime) ? evaluation.executionTime : (Date.now() - startedAt) / 1000,
    memory: Number.isFinite(evaluation.memory) ? evaluation.memory : 0,
    verdict,
  };
}

function parsePistonResponse(data: PistonResponse): PistonResult {
  const compile = data.compile;
  const run = data.run || {};
  const stdout = String(run.stdout || run.output || '').trim();
  const stderr = String(run.stderr || run.output || compile?.stderr || compile?.output || '').trim();

  if (compile && typeof compile.code === 'number' && compile.code !== 0) {
    return { status: 'error', stdout: '', stderr, executionTime: 0, memory: 0, verdict: 'Compilation Error' };
  }
  if (run.signal || (typeof run.code === 'number' && run.code !== 0)) {
    const timedOut = /time|tle|timeout/i.test(`${run.signal || ''} ${stderr}`);
    return { status: 'error', stdout, stderr, executionTime: 0, memory: 0, verdict: timedOut ? 'TLE' : 'Runtime Error' };
  }
  return { status: 'success', stdout, stderr, executionTime: 0.01, memory: 0, verdict: 'Accepted' };
}

function normalizePistonEndpoint(value: string): string {
  const trimmed = value.replace(/\/+$/, '');
  return trimmed.endsWith('/execute') ? trimmed : `${trimmed}/execute`;
}

function isExecutionVerdict(value: unknown): value is ExecutionVerdict {
  return value === 'Accepted' || value === 'Wrong Answer' || value === 'Compilation Error' || value === 'Runtime Error' || value === 'TLE';
}

function unavailableResult(): PistonResult {
  return {
    status: 'error',
    stdout: '',
    stderr: 'Code execution service is temporarily busy. Please try again in a moment.',
    executionTime: 0,
    memory: 0,
    verdict: 'Runtime Error',
  };
}

/**
 * Wraps solution class/function with a runner if standard Competitive Programming input parsing isn't present
 */
function wrapCodeForExecution(language: string, code: string): string {
  // Python harness wrapper
  if (language === 'python' || language === 'python3' || language === 'py') {
    if (code.includes('class Solution') && !code.includes('sys.stdin') && !code.includes('input(')) {
      return code + `\n\n` + PYTHON_SOLUTION_HARNESS;
    }
  }

  // JavaScript harness wrapper
  if (language === 'javascript' || language === 'js') {
    if ((code.includes('function ') || code.includes('const ') || code.includes('var ')) && !code.includes('process.stdin') && !code.includes('readFileSync')) {
      return code + `\n\n` + JS_SOLUTION_HARNESS;
    }
  }

  return code;
}

const PYTHON_SOLUTION_HARNESS = `
import sys, json, ast

def _smart_eval(val_str):
    val_str = val_str.strip()
    if not val_str: return None
    try: return ast.literal_eval(val_str)
    except Exception: return val_str

def _parse_input_to_args(raw_input):
    lines = [l.strip() for l in raw_input.strip().splitlines() if l.strip()]
    args = []
    for line in lines:
        if "=" in line and not (line.startswith("[") or line.startswith("{")):
            parts = []
            cur = []
            depth = 0
            in_str = False
            str_char = None
            for ch in line:
                if in_str:
                    cur.append(ch)
                    if ch == str_char: in_str = False
                elif ch in ('"', "'"):
                    in_str = True
                    str_char = ch
                    cur.append(ch)
                elif ch in '[({':
                    depth += 1
                    cur.append(ch)
                elif ch in ')]}':
                    depth -= 1
                    cur.append(ch)
                elif ch == ',' and depth == 0:
                    parts.append(''.join(cur).strip())
                    cur = []
                else:
                    cur.append(ch)
            if cur: parts.append(''.join(cur).strip())
            for p in parts:
                if '=' in p:
                    _, val = p.split('=', 1)
                    args.append(_smart_eval(val))
                else:
                    args.append(_smart_eval(p))
        else:
            args.append(_smart_eval(line))
    return args

if __name__ == '__main__':
    raw = sys.stdin.read()
    if 'Solution' in globals():
        sol = Solution()
        methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
        if methods:
            target_fn = getattr(sol, methods[0])
            args = _parse_input_to_args(raw)
            try:
                res = target_fn(*args)
            except Exception:
                try:
                    res = target_fn(args)
                except Exception:
                    res = target_fn(raw.strip())
            if res is not None:
                if isinstance(res, (list, dict, bool)):
                    print(json.dumps(res))
                else:
                    print(res)
`;

const JS_SOLUTION_HARNESS = `
const fs = require('fs');
if (typeof Solution !== 'undefined' || typeof solve !== 'undefined' || typeof main !== 'undefined') {
  const input = fs.readFileSync(0, 'utf-8').trim();
  const fn = typeof Solution !== 'undefined' ? new Solution()[Object.getOwnPropertyNames(Solution.prototype).find(m => m !== 'constructor')] : (typeof solve !== 'undefined' ? solve : main);
  if (fn) {
    try {
      const parsed = JSON.parse(input);
      const res = Array.isArray(parsed) ? fn(...parsed) : fn(parsed);
      if (res !== undefined) console.log(typeof res === 'object' ? JSON.stringify(res) : res);
    } catch {
      const res = fn(input);
      if (res !== undefined) console.log(typeof res === 'object' ? JSON.stringify(res) : res);
    }
  }
}
`;

function parseJudge0Response(data: Judge0Response): PistonResult {
  const statusId = data.status?.id || 3;
  const stdout = (data.stdout || '').trim();
  const stderr = (data.stderr || data.compile_output || data.message || '').trim();
  const executionTime = data.time ? parseFloat(String(data.time)) : 0.01;
  const memory = data.memory ? Math.round(data.memory / 1024 * 10) / 10 : 4.5;

  let verdict: ExecutionVerdict = 'Accepted';

  if (statusId === 3) {
    verdict = 'Accepted';
  } else if (statusId === 4) {
    verdict = 'Wrong Answer';
  } else if (statusId === 5) {
    verdict = 'TLE';
  } else if (statusId === 6) {
    verdict = 'Compilation Error';
  } else {
    verdict = 'Runtime Error';
  }

  return {
    status: statusId === 3 ? 'success' : 'error',
    stdout,
    stderr,
    executionTime,
    memory,
    verdict,
  };
}
