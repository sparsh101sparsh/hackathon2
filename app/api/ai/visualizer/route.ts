import { NextRequest, NextResponse } from 'next/server';
import { callFreeModelText } from '@/lib/freemodel';
import { buildPersonalityPrefix } from '@/lib/aiPersonalities';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { problemTitle, currentFrame, step, messages, personality } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const userMessage = messages[messages.length - 1].content;

    const systemPrompt = `You are an expert Data Structures & Algorithms visualizer guide.
${buildPersonalityPrefix(personality)}

The user is currently watching an animated algorithm visualizer for the problem "${problemTitle}".
They are on Step ${step + 1}.

Here is the EXACT state of the visualizer on the screen right now (in JSON format):
${JSON.stringify(currentFrame, null, 2)}

The official commentary for this step is: "${currentFrame?.commentary}"

The user has just asked a question about this step. Look at the array values, matrix layout, active highlighted indices, and pointers to explain exactly what is happening in a very concise, helpful, and technically accurate way.
Answer directly, matching your configured personality. Keep it to 2-3 short paragraphs max.`;

    const aiResponse = await callFreeModelText({
      systemPrompt,
      userPrompt: userMessage
    });

    return NextResponse.json({ reply: aiResponse });
  } catch (error) {
    console.error('Visualizer AI Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
