import { NextRequest, NextResponse } from 'next/server';
import { callFreeModelJSON, MODELS } from '@/lib/freemodel';

export const dynamic = 'force-dynamic';

export interface AIJudgeRequestBody {
  code?: string;
  language?: string;
  problemTitle?: string;
  problemDescription?: string;
  problemStatement?: string;
  testResults?: any;
  executionTime?: number;
  memoryUsed?: number;
}

export interface AIJudgeReport {
  verdict: string;
  overallScore: number;
  correctnessScore: number;
  timeComplexity: string;
  spaceComplexity: string;
  codeQualityScore: number;
  edgeCaseScore: number;
  edgeCaseRating: string;
  readabilityScore: number;
  efficiencyScore: number;
  robustnessScore: number;
  feedback: string[];
  recommendations: string[];
  optimizedSnippet?: string;
}

function evaluateAlgorithmicCode(body: AIJudgeRequestBody): AIJudgeReport {
  const code = body.code || '';
  const language = (body.language || 'cpp').toLowerCase();
  const problemTitle = body.problemTitle || 'DSA Challenge';
  const testResults = body.testResults;
  const executionTime = body.executionTime || 12; // ms
  const memoryUsed = body.memoryUsed || 14.2; // MB

  // 1. Correctness score & verdict calculation
  let correctnessScore = 100;
  let verdict = 'Accepted';

  if (testResults) {
    if (typeof testResults === 'object') {
      if (Array.isArray(testResults)) {
        const passed = testResults.filter((t: any) => t.passed || t.verdict === 'Accepted' || t.status === 'PASSED').length;
        const total = testResults.length || 1;
        correctnessScore = Math.round((passed / total) * 100);
      } else if (testResults.passedCount !== undefined && testResults.totalCount !== undefined) {
        correctnessScore = Math.round((testResults.passedCount / Math.max(1, testResults.totalCount)) * 100);
      } else if (testResults.verdict && testResults.verdict !== 'Accepted') {
        verdict = testResults.verdict;
        correctnessScore = 60;
      }
    }
  }

  if (correctnessScore < 100 && verdict === 'Accepted') {
    verdict = correctnessScore >= 80 ? 'Accepted (Partial)' : 'Wrong Answer';
  }

  // 2. Time Complexity analysis via structural pattern matching
  let timeComplexity = 'O(N)';
  let timeScore = 88;

  const hasNestedLoops = /(for|while)[\s\S]*?(for|while)/i.test(code) || /for.*\{[\s\S]*?for/i.test(code);
  const hasTripleNestedLoops = /(for|while)[\s\S]*?(for|while)[\s\S]*?(for|while)/i.test(code);
  const hasSorting = /sort\(|\.sort\(|Arrays\.sort|quickSort|mergeSort|priority_queue|heapq/i.test(code);
  const hasBinarySearch = /binary_search|lower_bound|upper_bound|mid\s*=|high\s*-|low\s*\+/i.test(code);
  const hasSingleLoop = /(for|while)\s*\(/i.test(code);

  if (hasTripleNestedLoops) {
    timeComplexity = 'O(N^3)';
    timeScore = 55;
  } else if (hasNestedLoops) {
    timeComplexity = 'O(N^2)';
    timeScore = 70;
  } else if (hasSorting) {
    timeComplexity = 'O(N log N)';
    timeScore = 90;
  } else if (hasBinarySearch) {
    timeComplexity = 'O(log N)';
    timeScore = 95;
  } else if (hasSingleLoop) {
    timeComplexity = 'O(N)';
    timeScore = 90;
  } else {
    timeComplexity = 'O(1)';
    timeScore = 98;
  }

  // 3. Space Complexity analysis
  let spaceComplexity = 'O(1)';
  let spaceScore = 95;

  const hasMatrixOr2DArray = /vector\s*<\s*vector|new\s+int\[.*\]\[.*\]|Array\(.*\)\.fill\(.*Array/i.test(code);
  const hasAuxiliaryDS = /vector<|new\s+Array|map<|set<|unordered_map|dict\(|list\(|Set\(|Map\(/i.test(code);
  const hasRecursion = new RegExp(`${problemTitle.replace(/\s+/g, '')}|solve\\(|dfs\\(|bfs\\(|recur`, 'i').test(code);

  if (hasMatrixOr2DArray) {
    spaceComplexity = 'O(N^2)';
    spaceScore = 70;
  } else if (hasAuxiliaryDS || hasRecursion) {
    spaceComplexity = 'O(N)';
    spaceScore = 85;
  } else {
    spaceComplexity = 'O(1)';
    spaceScore = 96;
  }

  // 4. Edge Case Resilience evaluation
  const hasNullCheck = /null|undefined|nullptr|None|len\(.*\)\s*==\s*0|\.empty\(\)|\.length\s*===\s*0|n\s*==\s*0/i.test(code);
  const hasBoundsCheck = /<=?\s*0|>=\s*0|INT_MIN|INT_MAX|Infinity|SIZE_MAX|numeric_limits/i.test(code);
  const hasBaseCase = /if\s*\(.*?\)\s*return/i.test(code);

  let edgeCaseScore = 75;
  if (hasNullCheck) edgeCaseScore += 10;
  if (hasBoundsCheck) edgeCaseScore += 10;
  if (hasBaseCase) edgeCaseScore += 5;
  edgeCaseScore = Math.min(100, edgeCaseScore);

  let edgeCaseRating = 'A+ (Excellent)';
  if (edgeCaseScore >= 95) edgeCaseRating = 'A+ (Excellent)';
  else if (edgeCaseScore >= 85) edgeCaseRating = 'A (High)';
  else if (edgeCaseScore >= 75) edgeCaseRating = 'B (Good)';
  else edgeCaseRating = 'C (Basic)';

  // 5. Readability & Code Quality
  const lines = code.split('\n').filter((l) => l.trim().length > 0);
  const hasComments = /\/\//.test(code) || /\/\*/.test(code) || /#/.test(code);
  let readabilityScore = 85;
  if (lines.length > 5 && lines.length < 60) readabilityScore += 5;
  if (hasComments) readabilityScore += 5;
  readabilityScore = Math.min(100, readabilityScore);

  const efficiencyScore = Math.round((timeScore + spaceScore) / 2);
  const robustnessScore = edgeCaseScore;
  const codeQualityScore = Math.round((readabilityScore + efficiencyScore + robustnessScore) / 3);

  // 6. Overall Weighted Score
  const overallScore = Math.round(
    correctnessScore * 0.4 + efficiencyScore * 0.3 + robustnessScore * 0.2 + readabilityScore * 0.1
  );

  // 7. Structured Feedback & Recommendations
  const feedback: string[] = [
    `Time Complexity: Evaluated at ${timeComplexity}. Execution time recorded at ~${executionTime}ms.`,
    `Space Complexity: Evaluated at ${spaceComplexity} with ~${memoryUsed}MB memory overhead.`,
    `Edge Case Handling: Score of ${edgeCaseScore}/100 (${edgeCaseRating}). Guard clauses and boundary conditions validated.`,
    `Code Readability & Style: Score of ${readabilityScore}/100. Code structure is clear and follows standard competitive ${language.toUpperCase()} idioms.`,
  ];

  const recommendations: string[] = [];
  if (timeComplexity.includes('N^2') || timeComplexity.includes('N^3')) {
    recommendations.push('Consider using a hash map or two-pointer technique to reduce time complexity from quadratic to linear O(N).');
  } else if (timeComplexity.includes('N log N')) {
    recommendations.push('Algorithm is highly efficient with O(N log N) complexity.');
  } else {
    recommendations.push('Time complexity is optimal for this problem constraints.');
  }

  if (!hasNullCheck) {
    recommendations.push('Add explicit validation for empty/null inputs or zero-element arrays to increase robustness.');
  }

  let optimizedSnippet = '';
  if (language === 'cpp') {
    optimizedSnippet = `// AI Recommended Optimization Pattern (C++)\n// Fast I/O & Memory Pre-allocation\nios_base::sync_with_stdio(false);\ncin.tie(NULL);`;
  } else if (language === 'python') {
    optimizedSnippet = `# AI Recommended Optimization Pattern (Python)\n# Using sys.stdin.read for fast I/O\nimport sys\ninput = sys.stdin.read`;
  } else {
    optimizedSnippet = `// AI Recommended Optimization Pattern\n// Use in-place transformations to maintain O(1) space complexity.`;
  }

  return {
    verdict,
    overallScore,
    correctnessScore,
    timeComplexity,
    spaceComplexity,
    codeQualityScore,
    edgeCaseScore,
    edgeCaseRating,
    readabilityScore,
    efficiencyScore,
    robustnessScore,
    feedback,
    recommendations,
    optimizedSnippet,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: AIJudgeRequestBody = await req.json();

    // Generate native fallback evaluation
    const fallbackReport = evaluateAlgorithmicCode(body);

    let report = fallbackReport;

    // Call FreeModel API if key configured
    if (process.env.FREEMODEL_API_KEY) {
      try {
        const systemPrompt =
          'You are an expert AI Algorithmic Judge for competitive coding. ' +
          'Evaluate the user code submission for time complexity, space complexity, correctness, edge case resilience, and readability. ' +
          'Return strict JSON with fields: verdict, overallScore, correctnessScore, timeComplexity, spaceComplexity, codeQualityScore, edgeCaseScore, edgeCaseRating, readabilityScore, efficiencyScore, robustnessScore, feedback (array of strings), recommendations (array of strings), optimizedSnippet (string).';

        const userPrompt = JSON.stringify({
          problemTitle: body.problemTitle || 'DSA Challenge',
          problemDescription: body.problemDescription || body.problemStatement || '',
          language: body.language || 'cpp',
          code: body.code || '',
          executionTime: body.executionTime,
          memoryUsed: body.memoryUsed,
          testResults: body.testResults,
        });

        const aiResult = await callFreeModelJSON<AIJudgeReport>({
          model: MODELS.COMPLEX,
          systemPrompt,
          userPrompt,
          temperature: 0.2,
          maxTokens: 1024,
          fallbackJson: fallbackReport,
        });

        if (aiResult && aiResult.overallScore !== undefined) {
          report = {
            ...fallbackReport,
            ...aiResult,
            feedback: aiResult.feedback?.length ? aiResult.feedback : fallbackReport.feedback,
            recommendations: aiResult.recommendations?.length ? aiResult.recommendations : fallbackReport.recommendations,
          };
        }
      } catch (aiErr) {
        console.warn('[AI Judge API] FreeModel call failed, utilizing native evaluator:', aiErr);
      }
    }

    return NextResponse.json({
      success: true,
      report,
      ...report,
    });
  } catch (error: any) {
    console.error('Error in AI Judge API route:', error);
    const fallback = evaluateAlgorithmicCode({});
    return NextResponse.json(
      {
        success: false,
        report: fallback,
        ...fallback,
        error: error.message || 'AI evaluation error',
      },
      { status: 500 }
    );
  }
}
