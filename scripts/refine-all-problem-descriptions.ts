import { prisma } from '../lib/prisma';

/**
 * Generate specific, readable Input Format descriptions based on problem metadata.
 */
function deriveInputFormat(title: string, statement: string, topicTags: string[], sampleInput?: string): string {
  const lowerTitle = title.toLowerCase();
  const lowerStmt = statement.toLowerCase();

  if (sampleInput && sampleInput.trim().length > 0 && !sampleInput.includes('Salary table')) {
    // Extract parameter names from sample input if available e.g. "nums = [1,2,3], k = 2"
    const paramsMatch = sampleInput.match(/([a-zA-Z0-9_]+)\s*=/g);
    if (paramsMatch && paramsMatch.length > 0) {
      const cleanParams = paramsMatch.map((p) => p.replace('=', '').trim()).join(', ');
      return `Function arguments containing parameter(s): \`${cleanParams}\`.`;
    }
  }

  if (lowerTitle.includes('sum') || lowerTitle.includes('array') || lowerTitle.includes('subsets') || lowerTitle.includes('permutation') || lowerStmt.includes('array')) {
    return 'An integer array `nums` and optional target integer parameters.';
  }
  if (lowerTitle.includes('string') || lowerTitle.includes('palindrome') || lowerTitle.includes('word') || lowerTitle.includes('anagram') || lowerStmt.includes('string')) {
    return 'Input string `s` (and optional target string `t` or dictionary `wordDict`).';
  }
  if (lowerTitle.includes('tree') || lowerTitle.includes('bst') || lowerTitle.includes('inorder') || lowerTitle.includes('preorder')) {
    return 'Root pointer of a Binary Tree `root`.';
  }
  if (lowerTitle.includes('list') || lowerTitle.includes('node') || lowerTitle.includes('linked')) {
    return 'Head node pointer of a Singly Linked List `head`.';
  }
  if (lowerTitle.includes('matrix') || lowerTitle.includes('board') || lowerTitle.includes('grid')) {
    return '2D grid matrix of numbers/characters `matrix[m][n]`.';
  }
  if (lowerTitle.includes('graph') || lowerTitle.includes('course') || lowerTitle.includes('island')) {
    return 'Graph adjacency list or 2D grid matrix `grid`.';
  }

  return `Function parameters for problem: ${title}.`;
}

/**
 * Generate specific, readable Output Format descriptions based on problem metadata.
 */
function deriveOutputFormat(title: string, statement: string, topicTags: string[], sampleOutput?: string): string {
  const lowerTitle = title.toLowerCase();
  const lowerStmt = statement.toLowerCase();

  if (sampleOutput && sampleOutput.trim().length > 0) {
    if (sampleOutput === 'true' || sampleOutput === 'false') {
      return 'Return boolean `true` if the condition is satisfied; otherwise `false`.';
    }
    if (/^-?\d+$/.test(sampleOutput.trim())) {
      return 'Return a single integer representing the calculated value.';
    }
    if (/^-?\d+\.\d+$/.test(sampleOutput.trim())) {
      return 'Return a double/float number accurate within 10^-5 precision.';
    }
    if (sampleOutput.startsWith('[') && sampleOutput.endsWith(']')) {
      if (sampleOutput.includes('[[')) {
        return 'Return a 2D array / list of lists containing the resulting elements.';
      }
      return 'Return an array / list containing the result elements.';
    }
  }

  if (lowerStmt.includes('return true') || lowerStmt.includes('return false') || lowerTitle.includes('is ') || lowerTitle.includes('can ') || lowerTitle.includes('valid')) {
    return 'Return boolean `true` if the condition is satisfied; otherwise `false`.';
  }
  if (lowerStmt.includes('return the number') || lowerTitle.includes('count') || lowerTitle.includes('length') || lowerTitle.includes('max') || lowerTitle.includes('min')) {
    return 'Return an integer representing the requested value or maximum/minimum count.';
  }
  if (lowerTitle.includes('list') || lowerTitle.includes('reverse') || lowerTitle.includes('merge')) {
    return 'Return the head node pointer of the modified Linked List.';
  }

  return 'Return the calculated result value matching problem output specifications.';
}

/**
 * Clean up markdown statement text to make it crisp and beautiful.
 */
function cleanStatementMarkdown(statement: string): string {
  let cleaned = statement
    .replace(/```\s*\n\s*\*\*Input:\*\*/g, '**Input:**')
    .replace(/```\s*\n\s*\*\*Output:\*\*/g, '**Output:**')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned;
}

async function refineAllProblems() {
  console.log('🚀 Starting comprehensive problem description refinement across all 620 problems...');

  const problems = await prisma.problem.findMany({
    include: {
      testCases: true,
    },
  });

  console.log(`Loaded ${problems.length} problems from database.`);

  let updatedCount = 0;

  for (const p of problems) {
    const topicTagsArr = JSON.parse(p.topicTags || '[]');
    const sampleTC = p.testCases.find((t) => t.isSample) || p.testCases[0];

    const needsInputFormatUpdate =
      !p.inputFormat ||
      p.inputFormat.includes('Input provided according to problem parameters') ||
      p.inputFormat.trim().length === 0;

    const needsOutputFormatUpdate =
      !p.outputFormat ||
      p.outputFormat.includes('Expected output according to problem specifications') ||
      p.outputFormat.trim().length === 0;

    const cleanedStatement = cleanStatementMarkdown(p.statement);

    const newInputFormat = needsInputFormatUpdate
      ? deriveInputFormat(p.title, p.statement, topicTagsArr, sampleTC?.input)
      : p.inputFormat;

    const newOutputFormat = needsOutputFormatUpdate
      ? deriveOutputFormat(p.title, p.statement, topicTagsArr, sampleTC?.expectedOutput)
      : p.outputFormat;

    if (
      needsInputFormatUpdate ||
      needsOutputFormatUpdate ||
      cleanedStatement !== p.statement
    ) {
      await prisma.problem.update({
        where: { id: p.id },
        data: {
          statement: cleanedStatement,
          inputFormat: newInputFormat,
          outputFormat: newOutputFormat,
        },
      });
      updatedCount++;
    }
  }

  console.log(`✅ Successfully refined ${updatedCount} problem descriptions and formats!`);

  // Verify boilerplate count in DB
  const boilerplateInputCount = await prisma.problem.count({
    where: { inputFormat: { contains: 'Input provided according to problem parameters' } },
  });
  const boilerplateOutputCount = await prisma.problem.count({
    where: { outputFormat: { contains: 'Expected output according to problem specifications' } },
  });

  console.log(`📊 DB Verification: Boilerplate input formats remaining = ${boilerplateInputCount}`);
  console.log(`📊 DB Verification: Boilerplate output formats remaining = ${boilerplateOutputCount}`);
}

refineAllProblems()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
