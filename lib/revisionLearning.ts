import { ExecutionVerdict } from '@/lib/types';

export interface FailureSnapshot {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  error?: string;
}

export interface RevisionLearning {
  failureType: ExecutionVerdict;
  pattern: string;
  keyTakeaway: string;
  error: string | null;
}

function compact(value: string | undefined, max = 500): string | null {
  if (!value) return null;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, max) : null;
}

export function buildRevisionLearning(
  verdict: ExecutionVerdict,
  topicTags: string,
  failedTestCase: FailureSnapshot | null,
): RevisionLearning {
  let parsedTopics: string[] = [];
  try {
    parsedTopics = JSON.parse(topicTags || '[]');
  } catch {
    parsedTopics = [];
  }

  const keyTakeawayByVerdict: Partial<Record<ExecutionVerdict, string>> = {
    'Compilation Error': 'Read the compiler error first. Check syntax, imports, types, and the required function signature before changing the algorithm.',
    'Runtime Error': 'Trace the failing input and guard empty, null, and boundary states before indexing, dereferencing, or dividing.',
    TLE: 'Re-check the complexity of the approach. Look for repeated work that can be replaced by a hash map, two pointers, sorting, or a tighter invariant.',
    'Time Limit Exceeded': 'Re-check the complexity of the approach. Look for repeated work that can be replaced by a hash map, two pointers, sorting, or a tighter invariant.',
    'Wrong Answer': 'Compare expected and actual output on the first failing case, then re-check the invariant, output format, and edge cases.',
    MLE: 'Re-check the memory footprint and whether the full input or duplicated structures can be streamed, reused, or compressed.',
    'Memory Limit Exceeded': 'Re-check the memory footprint and whether the full input or duplicated structures can be streamed, reused, or compressed.',
  };

  return {
    failureType: verdict,
    pattern: parsedTopics[0] || 'General DSA',
    keyTakeaway: keyTakeawayByVerdict[verdict] || 'Use the failing test case to isolate the broken assumption, then re-solve the problem from its core invariant.',
    error: compact(failedTestCase?.error),
  };
}

export function snapshotForRevision(failedTestCase: FailureSnapshot | null) {
  return {
    lastError: compact(failedTestCase?.error),
    lastFailedInput: compact(failedTestCase?.input, 1000),
    lastExpectedOutput: compact(failedTestCase?.expectedOutput, 1000),
    lastActualOutput: compact(failedTestCase?.actualOutput, 1000),
  };
}
