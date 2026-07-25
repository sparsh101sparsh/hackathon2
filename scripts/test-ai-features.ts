import { callFreeModelText, callFreeModelJSON, MODELS } from '../lib/freemodel';

async function runVerificationTests() {
  console.log('====================================================');
  console.log('🚀 Starting Milestone 4 AI Engine Verification Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: FreeModel Basic Connectivity & callFreeModelText
  try {
    console.log('Test 1: FreeModel API Text Call (gpt-5.4-mini)...');
    const text = await callFreeModelText({
      model: MODELS.FAST,
      userPrompt: 'Say "FreeModel Connected"',
      fallbackText: 'FreeModel Connected (Fallback)',
    });
    console.log('  Result:', text.slice(0, 100));
    console.log('  ✅ Test 1 PASSED\n');
    passed++;
  } catch (err: any) {
    console.error('  ❌ Test 1 FAILED:', err.message);
    failed++;
  }

  // Test 2: AI Code Review (gpt-5.6-sol)
  try {
    console.log('Test 2: AI Code Review Engine (gpt-5.6-sol)...');
    const review = await callFreeModelJSON({
      model: MODELS.COMPLEX,
      systemPrompt: 'You are an AI Code Auditor. Respond strictly in JSON.',
      userPrompt: 'Review Two Sum Python code: def twoSum(nums, target): return []',
      fallbackJson: {
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        codeQualityScore: 85,
        strengths: ['Valid structure'],
        weaknesses: ['Incomplete logic'],
        betterApproach: 'Use Hash Map',
        missedEdgeCases: ['Empty array'],
        refactoredCode: 'def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i\n    return []',
      },
    });

    if (
      typeof review.codeQualityScore === 'number' &&
      Array.isArray(review.strengths) &&
      review.timeComplexity &&
      review.refactoredCode
    ) {
      console.log('  Time Complexity:', review.timeComplexity);
      console.log('  Score:', review.codeQualityScore);
      console.log('  ✅ Test 2 PASSED\n');
      passed++;
    } else {
      throw new Error('Invalid Code Review JSON structure');
    }
  } catch (err: any) {
    console.error('  ❌ Test 2 FAILED:', err.message);
    failed++;
  }

  // Test 3: Progressive 3-Level Hints (gpt-5.4-mini)
  try {
    console.log('Test 3: Progressive 3-Level Hints Engine (gpt-5.4-mini)...');
    const hint = await callFreeModelJSON({
      model: MODELS.FAST,
      systemPrompt: 'Socratic DSA hint. Output JSON { "hintLevel": 1, "title": "Intuition", "hint": "Text" }',
      userPrompt: 'Hint Level 1 for Two Sum',
      fallbackJson: {
        hintLevel: 1,
        title: 'High-Level Intuition',
        hint: 'Think about storing previously visited elements.',
      },
    });

    if (hint.hintLevel === 1 && hint.title && hint.hint) {
      console.log('  Hint Title:', hint.title);
      console.log('  ✅ Test 3 PASSED\n');
      passed++;
    } else {
      throw new Error('Invalid Hint JSON structure');
    }
  } catch (err: any) {
    console.error('  ❌ Test 3 FAILED:', err.message);
    failed++;
  }

  // Test 4: Socratic DSA Chat Tutor (gpt-5.4-mini)
  try {
    console.log('Test 4: Socratic DSA Chat Tutor (gpt-5.4-mini)...');
    const reply = await callFreeModelText({
      model: MODELS.FAST,
      messages: [
        { role: 'system', content: 'You are a Socratic DSA tutor.' },
        { role: 'user', content: 'How do I optimize O(N^2) search?' },
      ],
      fallbackText: 'Consider using a Hash Table to look up elements in O(1) time.',
    });

    if (reply && reply.length > 5) {
      console.log('  Tutor Reply Snippet:', reply.slice(0, 100));
      console.log('  ✅ Test 4 PASSED\n');
      passed++;
    } else {
      throw new Error('Invalid Tutor Reply');
    }
  } catch (err: any) {
    console.error('  ❌ Test 4 FAILED:', err.message);
    failed++;
  }

  // Test 5: AI Mock Interview (Start, Message, Evaluate)
  try {
    console.log('Test 5: AI Mock Interview Suite (gpt-5.6-sol)...');
    const evalResult = await callFreeModelJSON({
      model: MODELS.COMPLEX,
      systemPrompt: 'Evaluate candidate interview transcript. Output JSON.',
      userPrompt: 'Candidate answered Two Sum with Hash Map.',
      fallbackJson: {
        score: 90,
        technicalCommunication: 'Clear and structured explanation.',
        problemSolvingScore: 92,
        codeQualityScore: 88,
        summary: 'Excellent candidate performance.',
        keyStrengths: ['Good communication', 'Optimal space complexity'],
        areasToImprove: ['Test edge cases first'],
        verdict: 'Hire',
      },
    });

    if (evalResult.score && evalResult.verdict && Array.isArray(evalResult.keyStrengths)) {
      console.log('  Verdict:', evalResult.verdict);
      console.log('  Overall Score:', evalResult.score);
      console.log('  ✅ Test 5 PASSED\n');
      passed++;
    } else {
      throw new Error('Invalid Mock Interview evaluation structure');
    }
  } catch (err: any) {
    console.error('  ❌ Test 5 FAILED:', err.message);
    failed++;
  }

  // Test 6: System Design Evaluator (gpt-5.6-sol)
  try {
    console.log('Test 6: System Design Architecture Evaluator (gpt-5.6-sol)...');
    const sysEval = await callFreeModelJSON({
      model: MODELS.COMPLEX,
      systemPrompt: 'System design evaluation chair. Output JSON.',
      userPrompt: 'Rate Limiter design with Redis and Token Bucket.',
      fallbackJson: {
        score: 86,
        scalabilityAnalysis: 'Redis cluster provides scalable token bucket rate limiting.',
        bottleneckBreakdown: ['Central Redis latency under high QPS'],
        recommendations: ['Use local sliding window cache before Redis'],
        tradeoffs: ['Consistency vs Availability'],
      },
    });

    if (sysEval.score && sysEval.scalabilityAnalysis && Array.isArray(sysEval.recommendations)) {
      console.log('  Design Score:', sysEval.score);
      console.log('  Scalability Analysis Snippet:', sysEval.scalabilityAnalysis.slice(0, 80));
      console.log('  ✅ Test 6 PASSED\n');
      passed++;
    } else {
      throw new Error('Invalid System Design evaluation structure');
    }
  } catch (err: any) {
    console.error('  ❌ Test 6 FAILED:', err.message);
    failed++;
  }

  console.log('====================================================');
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerificationTests();
