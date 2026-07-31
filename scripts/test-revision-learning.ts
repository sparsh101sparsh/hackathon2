import { buildRevisionLearning, snapshotForRevision } from '../lib/revisionLearning';
import { ExecutionVerdict } from '../lib/types';

const failedCase = {
  input: '[1, 2, 3]',
  expectedOutput: '6',
  actualOutput: '5',
  error: 'assertion mismatch',
};

const verdicts: ExecutionVerdict[] = [
  'Compilation Error',
  'Runtime Error',
  'Wrong Answer',
  'TLE',
  'MLE',
];

for (const verdict of verdicts) {
  const learning = buildRevisionLearning(verdict, '["Arrays & Hashing"]', failedCase);
  if (learning.failureType !== verdict || learning.pattern !== 'Arrays & Hashing' || !learning.keyTakeaway || !learning.error) {
    throw new Error(`Revision learning did not produce a complete card for ${verdict}.`);
  }
}

const snapshot = snapshotForRevision(failedCase);
if (snapshot.lastFailedInput !== failedCase.input || snapshot.lastExpectedOutput !== failedCase.expectedOutput || snapshot.lastActualOutput !== failedCase.actualOutput || snapshot.lastError !== failedCase.error) {
  throw new Error('Revision failure snapshot did not preserve the failing case details.');
}

console.log(`Revision learning verification: ${verdicts.length} failure classes and failing-case snapshot passed.`);
