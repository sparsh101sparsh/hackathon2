import { PistonResult, ExecutionVerdict } from './types';

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

const JUDGE0_PRIMARY_ENDPOINT = 'https://ce.judge0.com/submissions?wait=true';

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

  try {
    const response = await fetch(JUDGE0_PRIMARY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_code: finalCode,
        language_id: languageId,
        stdin: stdin,
        cpu_time_limit: 4.0,
        memory_limit: 256000,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return parseJudge0Response(data);
    }
  } catch (err: any) {
    console.error('[Judge Engine] Primary endpoint error:', err.message);
  }

  // Graceful fallback response if execution service is temporarily down
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

function parseJudge0Response(data: any): PistonResult {
  const statusId = data.status?.id || 3;
  const stdout = (data.stdout || '').trim();
  const stderr = (data.stderr || data.compile_output || data.message || '').trim();
  const executionTime = data.time ? parseFloat(data.time) : 0.01;
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
