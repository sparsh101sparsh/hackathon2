import { NextRequest, NextResponse } from 'next/server';
import { callFreeModelJSON, MODELS } from '@/lib/freemodel';
import { getProblemKnowledge } from '@/lib/problemKnowledge';

export const dynamic = 'force-dynamic';

export interface HintResponse {
  hintLevel: 1 | 2 | 3;
  title: string;
  hint: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      problemTitle = 'DSA Problem',
      problemStatement = '',
      problemId,
      problemSlug,
      userCode = '',
      language = 'cpp',
      hintLevel = 1,
    } = body;

    const level = Number(hintLevel) as 1 | 2 | 3;
    if (![1, 2, 3].includes(level)) {
      return NextResponse.json({ error: 'hintLevel must be 1, 2, or 3' }, { status: 400 });
    }

    const knowledge = await getProblemKnowledge({
      problemId,
      problemSlug,
      problemTitle,
      fallbackStatement: problemStatement,
    });

    const levelDescriptions = {
      1: 'Level 1 - Intuition & High-Level Direction: Give a high-level conceptual nudge or mathematical intuition without revealing data structures or specific algorithms.',
      2: 'Level 2 - Algorithmic Approach & Data Structures: Suggest suitable data structures (e.g. Hash Map, Two Pointers, Stack, Binary Search) and outline the core strategy without giving away complete code.',
      3: 'Level 3 - Detailed Logic & Step-by-Step Pseudocode: Provide detailed logical breakdown or clean pseudocode without providing complete solution code in the target language.',
    };

    const systemPrompt = `You are a Socratic DSA Coach. Provide a progressive hint for the user working on a coding problem.
${levelDescriptions[level]}
IMPORTANT: DO NOT leak the full final solution code in the user's language. Encourage learning!
Use the canonical question reference below as the source of truth. Do not invent constraints or change the problem.

${knowledge.context}

Output MUST be a single raw JSON object matching schema:
{
  "hintLevel": ${level},
  "title": "Short title describing the hint",
  "hint": "Detailed hint text corresponding to level ${level}"
}`;

    const userPrompt = `Problem Title: ${knowledge.title}
Problem Statement: ${knowledge.context}
User Current Code (${language}):
${userCode ? userCode : '(No code written yet)'}

Provide Hint Level ${level}.`;

    const fallbackTitles = {
      1: 'High-Level Intuition',
      2: 'Core Algorithm & Data Structure',
      3: 'Detailed Step-by-Step Breakdown',
    };

    const fallbackHints = {
      1: `To solve "${knowledge.title}", think about what information you need at each step. Can you avoid re-evaluating subproblems or nested loops by tracking intermediate results?`,
      2: `For "${knowledge.title}", identify the invariant that lets you discard work after each step. Which data structure best preserves that invariant under the stated constraints?`,
      3: `Break "${knowledge.title}" into smaller decisions. Trace one sample from the canonical reference, name the state you maintain, and check how each update preserves correctness before writing code.`,
    };

    const fallbackJson: HintResponse = {
      hintLevel: level,
      title: fallbackTitles[level],
      hint: fallbackHints[level],
    };

    const responseData = await callFreeModelJSON<HintResponse>({
      model: MODELS.FAST,
      systemPrompt,
      userPrompt,
      temperature: 0.5,
      fallbackJson,
    });

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error in /api/ai/hints:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate hint' },
      { status: 500 }
    );
  }
}
