import assert from 'node:assert/strict';
import { executeCode } from '@/lib/piston';

const sameTreeFunction = `#include <vector>
bool isSameTree(std::vector<int>& p, std::vector<int>& q) {
    if (p.size() != q.size()) return false;
    for (size_t i = 0; i < p.size(); i++) {
        if (p[i] != q[i]) return false;
    }
    return true;
}`;

async function main() {
  const result = await executeCode('cpp', sameTreeFunction, '1 2 3\n1 2 3\n', 'same-tree');

  assert.equal(result.verdict, 'Accepted', `${result.verdict}: ${result.stderr}`);
  assert.equal(result.stdout, 'true', `unexpected output: ${result.stdout}`);
  console.log('Function-style C++ execution passed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
