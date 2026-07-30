import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const body = await req.json();
    const {
      roomName = 'Battle Arena',
      mode = 'DUEL',
      status = 'IN_PROGRESS',
      participants = [],
      activeProblemTitle = 'DSA Challenge',
      event = 'GENERAL',
    } = body;

    const leader = participants[0] || { userName: 'Coder 1', score: 0, solved: 0 };
    const chaser = participants[1] || { userName: 'Coder 2', score: 0, solved: 0 };

    let commentaryText = '';

    // Generate dynamic commentary based on events
    if (event === 'START_BATTLE') {
      commentaryText = `🔥 THE BATTLE HAS BEGUN! ${leader.userName} and ${chaser.userName || 'their opponent'} clash on "${activeProblemTitle}"! Who will claim the first AC?`;
    } else if (event === 'SCORE_POINTS' || leader.score > 0) {
      if (leader.solved > chaser.solved) {
        commentaryText = `⚡ UNSTOPPABLE! ${leader.userName} just passed all test cases for "${activeProblemTitle}" and surges to #${1} with ${leader.score} pts!`;
      } else {
        commentaryText = `🎯 SENSATIONAL! ${leader.userName} locks in ${leader.score} pts! The competition is heating up!`;
      }
    } else if (event === 'SUBMIT_ATTEMPT') {
      commentaryText = `👀 SUBMISSION INCOMING! A coder just submitted code for "${activeProblemTitle}". Testing all test cases...`;
    } else {
      const HYPE_TEMPLATES = [
        `🎙️ AI COMMENTATOR: ${leader.userName} leads with ${leader.score} pts on "${activeProblemTitle}"! High-intensity competitive coding in progress!`,
        `🧠 ANALYST DESK: Clean code structure observed! Optimal time complexity will be key to winning this ${mode} battle.`,
        `⚔️ MATCH UPDATE: ${participants.length} coders battling live in ${roomName}. First to submit gets maximum speed points!`,
        `⚡ SPEED RATING: ${leader.userName} is currently coding at peak velocity! Can the opponent pull off a clutch comeback?`,
      ];
      commentaryText = HYPE_TEMPLATES[Math.floor(Math.random() * HYPE_TEMPLATES.length)];
    }

    // Try calling FreeModel AI for extra flavor if available
    const freeModelKey = process.env.FREEMODEL_API_KEY;
    const freeModelUrl = process.env.FREEMODEL_BASE_URL || 'https://api.freemodel.dev/v1';

    if (freeModelKey) {
      try {
        const aiRes = await fetch(`${freeModelUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${freeModelKey}`,
          },
          body: JSON.stringify({
            model: 'freemodel',
            messages: [
              {
                role: 'system',
                content:
                  'You are a high-energy, witty esports commentator for a competitive coding platform (like Codeforces / LeetCode battles). Write 1 punchy, exciting commentary sentence (max 25 words). Include emojis.',
              },
              {
                role: 'user',
                content: `Match: ${roomName}. Leader: ${leader.userName} (${leader.score} pts, ${leader.solved} solved). Opponent: ${chaser.userName} (${chaser.score} pts). Problem: ${activeProblemTitle}. Event: ${event}.`,
              },
            ],
            temperature: 0.8,
            max_tokens: 60,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const aiContent = aiData.choices?.[0]?.message?.content;
          if (aiContent && aiContent.trim().length > 10) {
            commentaryText = `🎙️ AI COMMENTATOR: ${aiContent.trim().replace(/^"|"$/g, '')}`;
          }
        }
      } catch (err) {
        // Fall back to template commentary if AI request fails or times out
      }
    }

    return NextResponse.json({
      success: true,
      commentary: {
        id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        text: commentaryText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: event === 'SCORE_POINTS' ? 'hype' : event === 'START_BATTLE' ? 'lead_change' : 'analysis',
      },
    });
  } catch (error: any) {
    console.error('Error generating AI commentary:', error);
    return NextResponse.json({ error: 'Failed to generate commentary' }, { status: 500 });
  }
}
