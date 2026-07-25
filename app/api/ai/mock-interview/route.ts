import { NextRequest, NextResponse } from 'next/server';
import { callFreeModelJSON, callFreeModelText, MODELS, FreeModelMessage } from '@/lib/freemodel';

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
      messages = [],
      code = '',
    } = body;

    const interviewerSystemPrompt = `You are a Staff Software Engineer conducting a realistic technical coding interview for ${company} focused on ${topic}.
Maintain a professional, encouraging yet thorough tone. Ask clarifying questions, evaluate candidate's thought process, time/space complexity explanations, and code.`;

    if (action === 'start') {
      const userPrompt = `Start the technical interview for a Senior Software Engineer candidate interviewing at ${company} focusing on ${topic}. Introduce yourself, state the problem clearly, provide input/output constraints, and invite the candidate to share their initial thoughts.`;

      const fallbackGreeting = `Hello! I'm your Senior Tech Lead interviewer at ${company}. Today we'll be working on a classic ${topic} problem.

**Problem**: Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

**Constraints**:
- Each input would have exactly one solution.
- You may not use the same element twice.
- Expected Time Complexity: O(N).

Before you start coding, could you walk me through your initial intuition and proposed approach?`;

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
        problemTitle: `Two Sum (${company} Tech Interview)`,
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

      const lastCandidateMsg = messages.length > 0 ? messages[messages.length - 1].content : '';
      let fallbackText = `That's a solid explanation. How does your algorithm handle edge cases such as empty input arrays, negative target values, or duplicates?`;
      if (code && code.trim()) {
        fallbackText = `I see your implementation. Let's trace your code with \`nums = [3, 2, 4]\` and \`target = 6\`. Can you explain what values your data structure holds at each iteration?`;
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
      const evalSystemPrompt = `You are an Interview Evaluation Committee Chair at ${company}. Analyze the candidate's full interview transcript and code submission.
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
        summary: `The candidate successfully arrived at an optimal O(N) Hash Map solution during the ${company} mock interview. Communicated trade-offs effectively and addressed interviewer follow-ups.`,
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
