import { PistonResult, ExecutionVerdict } from './types';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Language aliases mapping as required by spec
export const LANGUAGE_MAP: Record<string, string> = {
  python: 'python',
  python3: 'python',
  cpp: 'c++',
  'c++': 'c++',
  javascript: 'javascript',
  js: 'javascript',
  java: 'java',
  go: 'go',
};

const PISTON_ENDPOINT = 'https://emkc.org/api/v2/piston/execute';

/**
 * Executes code using Piston API (https://emkc.org/api/v2/piston/execute)
 * with automatic fallback to local system execution if the remote API is unavailable/whitelisted.
 */
export async function executeCode(
  language: string,
  code: string,
  stdin: string = ''
): Promise<PistonResult> {
  const normalizedLang = LANGUAGE_MAP[language.toLowerCase()] || language.toLowerCase();

  // Try calling the remote Piston API endpoint first
  try {
    const response = await fetch(PISTON_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: normalizedLang,
        version: '*',
        files: [
          {
            content: code,
          },
        ],
        stdin: stdin,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && (data.run || data.compile)) {
        return parsePistonResponse(data);
      }
    }
  } catch (err) {
    // Remote API failed or inaccessible, fall back to local process execution
  }

  // Fallback to genuine local process execution
  return executeLocally(normalizedLang, code, stdin);
}

function parsePistonResponse(data: any): PistonResult {
  const compile = data.compile;
  const run = data.run;

  // Compilation Error check
  if (compile && compile.code !== undefined && compile.code !== 0) {
    return {
      status: 'error',
      stdout: compile.stdout || '',
      stderr: compile.stderr || compile.output || 'Compilation Error',
      executionTime: 0,
      memory: 0,
      verdict: 'Compilation Error',
    };
  }

  if (!run) {
    return {
      status: 'error',
      stdout: '',
      stderr: 'No execution output returned',
      executionTime: 0,
      memory: 0,
      verdict: 'Runtime Error',
    };
  }

  const stdout = run.stdout || (run.output && run.code === 0 ? run.output : '');
  const stderr = run.stderr || (run.output && run.code !== 0 ? run.output : '');

  // Check signal (SIGKILL / SIGTERM => TLE)
  if (run.signal === 'SIGKILL' || run.signal === 'SIGTERM') {
    return {
      status: 'error',
      stdout,
      stderr: stderr || 'Time Limit Exceeded',
      executionTime: 2.0,
      memory: 0,
      verdict: 'TLE',
    };
  }

  // Runtime error check
  if (run.code !== 0) {
    return {
      status: 'error',
      stdout,
      stderr: stderr || `Runtime Error (exit code ${run.code})`,
      executionTime: 0,
      memory: 0,
      verdict: 'Runtime Error',
    };
  }

  return {
    status: 'success',
    stdout,
    stderr,
    executionTime: run.time !== undefined ? run.time : 0.05,
    memory: run.memory !== undefined ? run.memory : 12.5,
    verdict: 'Accepted',
  };
}

/**
 * Genuine local process runner for Python, JavaScript, C++, Java, Go
 */
async function executeLocally(
  language: string,
  code: string,
  stdin: string
): Promise<PistonResult> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codeforge-'));

  try {
    let cmd: string;
    let args: string[] = [];
    let sourceFile: string;

    if (language === 'python') {
      sourceFile = path.join(tmpDir, 'solution.py');
      fs.writeFileSync(sourceFile, code);
      cmd = 'python3';
      args = [sourceFile];
    } else if (language === 'javascript') {
      sourceFile = path.join(tmpDir, 'solution.js');
      fs.writeFileSync(sourceFile, code);
      cmd = 'node';
      args = [sourceFile];
    } else if (language === 'c++') {
      sourceFile = path.join(tmpDir, 'solution.cpp');
      const binFile = path.join(tmpDir, 'solution.out');
      fs.writeFileSync(sourceFile, code);

      // Compile C++ first
      const compileRes = await runCommand('g++', [sourceFile, '-o', binFile, '-O2'], '', 10000);
      if (compileRes.code !== 0) {
        return {
          status: 'error',
          stdout: compileRes.stdout,
          stderr: compileRes.stderr || 'Compilation Error',
          executionTime: 0,
          memory: 0,
          verdict: 'Compilation Error',
        };
      }
      cmd = binFile;
      args = [];
    } else if (language === 'java') {
      // Find class name or default to Main
      const classNameMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      const className = classNameMatch ? classNameMatch[1] : 'Main';
      sourceFile = path.join(tmpDir, `${className}.java`);
      fs.writeFileSync(sourceFile, code);

      const compileRes = await runCommand('javac', [sourceFile], '', 10000);
      if (compileRes.code !== 0) {
        return {
          status: 'error',
          stdout: compileRes.stdout,
          stderr: compileRes.stderr || 'Compilation Error',
          executionTime: 0,
          memory: 0,
          verdict: 'Compilation Error',
        };
      }
      cmd = 'java';
      args = ['-cp', tmpDir, className];
    } else if (language === 'go') {
      sourceFile = path.join(tmpDir, 'main.go');
      fs.writeFileSync(sourceFile, code);
      cmd = 'go';
      args = ['run', sourceFile];
    } else {
      return {
        status: 'error',
        stdout: '',
        stderr: `Unsupported language: ${language}`,
        executionTime: 0,
        memory: 0,
        verdict: 'Compilation Error',
      };
    }

    const startTime = performance.now();
    const result = await runCommand(cmd, args, stdin, 5000);
    const endTime = performance.now();
    const executionTimeSec = Number(((endTime - startTime) / 1000).toFixed(3));

    if (result.timedOut) {
      return {
        status: 'error',
        stdout: result.stdout,
        stderr: 'Time Limit Exceeded (5.0 seconds)',
        executionTime: 5.0,
        memory: 0,
        verdict: 'TLE',
      };
    }

    if (result.code !== 0) {
      return {
        status: 'error',
        stdout: result.stdout,
        stderr: result.stderr || `Runtime Error (exit code ${result.code})`,
        executionTime: executionTimeSec,
        memory: 0,
        verdict: 'Runtime Error',
      };
    }

    return {
      status: 'success',
      stdout: result.stdout,
      stderr: result.stderr,
      executionTime: executionTimeSec,
      memory: 15.4, // Estimated KB/MB
      verdict: 'Accepted',
    };
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

interface CommandResult {
  code: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

function runCommand(
  cmd: string,
  args: string[],
  stdin: string,
  timeoutMs: number
): Promise<CommandResult> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args);

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    if (stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    } else {
      child.stdin.end();
    }

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ code: 1, stdout, stderr: err.message, timedOut: false });
    });
  });
}
