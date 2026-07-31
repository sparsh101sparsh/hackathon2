import { NextRequest, NextResponse } from 'next/server';
import { callFreeModelText, MODELS, FreeModelMessage } from '@/lib/freemodel';
import { getProblemKnowledge } from '@/lib/problemKnowledge';
import { getTeachingStyle, buildTeachingStylePrefix } from '@/lib/teachingStyles';
import { rateLimitResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const limitResponse = rateLimitResponse(request, 'ai:tutor', 30, 60 * 1000);
    if (limitResponse) return limitResponse;
    const body = await request.json();
    const {
      problemTitle = 'DSA Problem',
      problemStatement = '',
      problemId,
      problemSlug,
      userCode = '',
      language = 'cpp',
      messages = [],
      personality: personalityId,
    } = body;

    if (!Array.isArray(messages) || messages.length > 60) {
      return NextResponse.json({ error: 'messages must be an array with at most 60 entries' }, { status: 400 });
    }
    if (typeof userCode !== 'string' || userCode.length > 100_000) {
      return NextResponse.json({ error: 'userCode exceeds the 100KB limit' }, { status: 413 });
    }
    if (messages.some((message: unknown) => {
      if (!message || typeof message !== 'object') return true;
      const content = (message as { content?: unknown }).content;
      return typeof content !== 'string' || content.length > 10_000;
    })) {
      return NextResponse.json({ error: 'Each tutor message must contain at most 10,000 characters' }, { status: 413 });
    }

    const knowledge = await getProblemKnowledge({
      problemId,
      problemSlug,
      problemTitle,
      fallbackStatement: problemStatement,
    });

    const personality = getTeachingStyle(personalityId);
    const personalityPrefix = buildTeachingStylePrefix(personality);

    const systemInstruction = `${personalityPrefix}${personality.tutorSystemInstruction}

DSA Tutor Context:
- Problem: "${knowledge.title}", Language: "${language}".
- Use this canonical question reference as your source of truth and never invent a different problem:
${knowledge.context}`;

    // Construct full message list
    const formattedMessages: FreeModelMessage[] = [
      { role: 'system', content: systemInstruction },
    ];

    if (problemTitle || userCode) {
      formattedMessages.push({
        role: 'system',
        content: `Workspace Context:
Problem: ${knowledge.title}
Canonical Question Reference:
${knowledge.context}
Current User Code (${language}):
\`\`\`${language}
${userCode || '(Empty)'}
\`\`\``,
      });
    }

    if (Array.isArray(messages)) {
      for (const msg of messages) {
        if (msg.role && msg.content) {
          formattedMessages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          });
        }
      }
    }

    // Get last user query for fallback context
    const lastUserMsg = messages.length > 0 ? messages[messages.length - 1].content : '';
    let fallbackReply = `Great question! When tackling ${knowledge.title}, think about your current data structures and algorithm steps. `;
    if (lastUserMsg.toLowerCase().includes('error') || lastUserMsg.toLowerCase().includes('bug')) {
      fallbackReply += `Check your loop bounds, index lookups, and null/empty input checks. What happens when your input array has size 0 or 1?`;
    } else if (lastUserMsg.toLowerCase().includes('time') || lastUserMsg.toLowerCase().includes('complexity') || lastUserMsg.toLowerCase().includes('optimize')) {
      fallbackReply += `Can we trade space for time here? For instance, using a Hash Map or Frequency Array can drop nested iteration from O(N^2) down to O(N).`;
    } else {
      fallbackReply += `What step in your current code is taking the most operations? Try tracing it with a small sample input like [2, 7, 11, 15]!`;
    }

    const reply = await callFreeModelText({
      model: MODELS.FAST,
      messages: formattedMessages,
      temperature: 0.7,
      fallbackText: fallbackReply,
    });

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error('Error in /api/ai/tutor:', error);
    return NextResponse.json(
      { error: 'guided Tutor is temporarily unavailable. Please try again shortly.' },
      { status: 500 }
    );
  }
}
