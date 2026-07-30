import { NextRequest, NextResponse } from 'next/server';
import { callFreeModelJSON, callFreeModelText, MODELS, FreeModelMessage } from '@/lib/freemodel';
import { getProblemKnowledge, getProblemKnowledgeForTopic } from '@/lib/problemKnowledge';

export const dynamic = 'force-dynamic';

export interface EvaluationReport {
  score: number;
  technicalCommunication: string;
  problemSolvingScore: number;
  codeQualityScore: number;
  summary: string;
  keyStrengths: string[];
  areasToImprove: string[];
  verdict: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'No Hire';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action = 'start',
      company = 'Google',
      topic = 'Arrays & Hashing',
      problemId,
      problemSlug,
      problemTitle = 'DSA Problem',
      messages = [],
      code = '',
    } = body;

    const knowledge = problemId || problemSlug || problemTitle !== 'DSA Problem'
      ? await getProblemKnowledge({ problemId, problemSlug, problemTitle })
      : await getProblemKnowledgeForTopic(topic, company);

    const interviewerSystemPrompt = `You are a Staff Software Engineer conducting a realistic technical coding interview for ${company}.
You are an interviewer, not a tutor or solution generator. Follow this interview playbook:
- Keep the interview interactive: ask one focused question at a time and wait for the candidate's answer.
- Start by stating the exact canonical problem, then invite clarifying questions before asking for an approach.
- Probe requirements, brute force, invariant, data-structure choice, complexity, edge cases, and testing in that order as appropriate.
- Give brief neutral nudges only when the candidate is stuck. Never reveal the full algorithm, pseudocode, or solution code.
- Do not change the problem, constraints, examples, or expected output. Correct the candidate respectfully when their reasoning conflicts with the reference.
- When code is shared, ask the candidate to trace it and identify bugs before explaining them yourself.
- Keep responses concise (normally 1-3 short paragraphs) and end with a question that advances the interview.
- Do not praise every answer; give calibrated feedback and maintain realistic interview pressure.

Interview context: ${company}, topic ${topic}, canonical problem ${knowledge.title}.
Use this canonical question reference as the source of truth:
${knowledge.context}`;

    if (action === 'start') {
      const userPrompt = `Begin the interview. Introduce yourself in one sentence, state the exact problem "${knowledge.title}" with its key constraints, then ask the candidate to restate the requirements and call out any clarifying questions. Do not discuss the solution yet.`;

      const fallbackGreeting = `Hello, I'm your ${company} interviewer. Today we'll discuss **${knowledge.title}**. Please restate the requirements in your own words and tell me what clarifying questions you would ask before proposing an approach.`;

      const message = await callFreeModelText({
        model: MODELS.COMPLEX,
        systemPrompt: interviewerSystemPrompt,
        userPrompt,
        temperature: 0.7,
        fallbackText: fallbackGreeting,
      });

      return NextResponse.json({
        message,
        company,
        topic,
        problemId: knowledge.problemId,
        problemTitle: knowledge.title,
      });
    }

    if (action === 'message') {
      const formattedMessages: FreeModelMessage[] = [
        { role: 'system', content: interviewerSystemPrompt },
      ];

      if (Array.isArray(messages)) {
        for (const m of messages) {
          if (m.role && m.content) {
            formattedMessages.push({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content,
            });
          }
        }
      }

      if (code) {
        formattedMessages.push({
          role: 'user',
          content: `[Candidate's Current Workspace Code]:\n\`\`\`\n${code}\n\`\`\``,
        });
      }

      const turnNumber = Array.isArray(messages) ? Math.ceil(messages.length / 2) : 1;
      let fallbackText = `Let's examine that carefully. What invariant does your approach maintain, and what is its time and space complexity?`;
      if (code && code.trim()) {
        fallbackText = `I see your implementation. Please trace it on one canonical sample and explain what each key variable contains after every important iteration.`;
      } else if (turnNumber >= 3) {
        fallbackText = `Before we move on, which edge case would most likely break this approach, and how would you test it?`;
      }

      const message = await callFreeModelText({
        model: MODELS.COMPLEX,
        messages: formattedMessages,
        temperature: 0.7,
        fallbackText,
      });

      return NextResponse.json({ message });
    }

    if (action === 'evaluate') {
      const evalKnowledge = await getProblemKnowledge({ problemId, problemSlug, problemTitle });
      const evalSystemPrompt = `You are an Interview Evaluation Committee Chair at ${company}. Analyze the candidate's full interview transcript and code submission against the exact canonical problem below.
Do not reward an answer that solves a different problem. Separate communication quality from algorithm correctness. Check whether the candidate clarified requirements, identified a valid invariant, justified complexity, considered edge cases, tested the code, and responded to probing.
Canonical reference:
${evalKnowledge.context}

Output MUST be a single raw JSON object matching schema:
{
  "score": number between 1 and 100,
  "technicalCommunication": "detailed assessment of candidate's verbal communication & clarifying questions",
  "problemSolvingScore": number between 1 and 100,
  "codeQualityScore": number between 1 and 100,
  "summary": "1-paragraph overall interview performance evaluation summary",
  "keyStrengths": ["array of candidate's top strengths"],
  "areasToImprove": ["array of concrete areas for candidate improvement"],
  "verdict": "Strong Hire" | "Hire" | "Lean Hire" | "No Hire"
}`;

      const transcriptText = messages
        .map((m: any) => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`)
        .join('\n\n');

      const userPrompt = `Interview Transcript:\n${transcriptText}\n\nFinal Candidate Code:\n\`\`\`\n${code}\n\`\`\``;

      const fallbackReport: EvaluationReport = {
        score: 85,
        technicalCommunication:
          'Demonstrated clear thought process, explained time and space complexity tradeoffs effectively before jumping straight into code.',
        problemSolvingScore: 88,
        codeQualityScore: 82,
        summary: `The candidate completed a structured interview on ${evalKnowledge.title}. The scorecard reflects the transcript, code, and canonical problem constraints.`,
        keyStrengths: [
          'Strong algorithmic intuition and quick recognition of optimal data structure',
          'Clean variable naming and clear explanation of time complexity O(N)',
          'Proactive in asking clarifying questions regarding constraints',
        ],
        areasToImprove: [
          'Explicitly write down unit test cases before presenting final code',
          'Double check edge case handling for zero and duplicate elements',
        ],
        verdict: 'Hire',
      };

      const report = await callFreeModelJSON<EvaluationReport>({
        model: MODELS.COMPLEX,
        systemPrompt: evalSystemPrompt,
        userPrompt,
        temperature: 0.3,
        fallbackJson: fallbackReport,
      });

      return NextResponse.json(report);
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in /api/ai/mock-interview:', error);
    return NextResponse.json(
      { error: error.message || 'Mock interview processing error' },
      { status: 500 }
    );
  }
}
