import { NextRequest, NextResponse } from 'next/server';
import { callFreeModel, MODELS } from '@/lib/freemodel';

export const dynamic = 'force-dynamic';

export interface BattleParticipant {
  id?: string;
  userId?: string;
  name?: string;
  userName?: string;
  score?: number;
  scores?: number;
  solved?: number;
  timeSpent?: number;
  progress?: string;
}

export interface CommentatorRequestBody {
  roomCode?: string;
  roomName?: string;
  eventType?: 'JOIN' | 'SUBMIT' | 'LEAD_SWAP' | 'FAST_SUBMISSION' | 'HIGH_SCORE' | 'TICK' | 'TYPING_PROGRESS' | 'RUN_CODE' | 'SAMPLE_PASSED' | 'SAMPLE_FAILED' | 'SUBMIT_FAILED' | string;
  event?: string;
  participants?: BattleParticipant[];
  problemTitle?: string;
  activeProblemTitle?: string;
  language?: string;
  codeSnippet?: string;
  linesOfCode?: number;
  executionResult?: {
    verdict?: string;
    stdout?: string;
    stderr?: string;
    failedTestCase?: string;
  };
  mode?: string;
  status?: string;
  userName?: string;
}

function generateNativeFallback(
  eventType: string,
  leaderName: string,
  leaderScore: number,
  chaserName: string,
  problemTitle: string,
  roomCode: string,
  participantCount: number,
  linesOfCode: number = 0,
  executionResult?: any
): { text: string; hypeLevel: 'high' | 'medium' | 'low' } {
  const norm = (eventType || 'TICK').toUpperCase();

  if (norm === 'TYPING_PROGRESS') {
    const options = [
      `✍️ PLAY-BY-PLAY: ${leaderName} is making rapid progress on "${problemTitle}"! Already written ${linesOfCode} lines of code and building the core logic!`,
      `🧠 CODE ANALYST: ${leaderName} has completed over half of their solution (${linesOfCode} lines)! The algorithm structure is taking shape!`,
      `⚡ SPEED TYPING: ${leaderName} is flying through the implementation in ${roomCode}! ${linesOfCode} lines locked in so far!`,
    ];
    return { text: options[Math.floor(Math.random() * options.length)], hypeLevel: 'medium' };
  }

  if (norm === 'RUN_CODE') {
    const options = [
      `🧪 TEST EXECUTION: ${leaderName} just ran sample test cases on "${problemTitle}"! Awaiting execution output...`,
      `👀 TESTING LOGIC: ${leaderName} is testing their logic live against sample inputs!`,
    ];
    return { text: options[Math.floor(Math.random() * options.length)], hypeLevel: 'medium' };
  }

  if (norm === 'SAMPLE_PASSED') {
    const options = [
      `✅ SAMPLE PASSED! ${leaderName} passed sample test cases on "${problemTitle}"! They're getting super close to full submission!`,
      `🎯 TARGET ACQUIRED! ${leaderName}'s sample test execution succeeded! Preparing for final submission!`,
    ];
    return { text: options[Math.floor(Math.random() * options.length)], hypeLevel: 'high' };
  }

  if (norm === 'SAMPLE_FAILED' || norm === 'RUN_FAILED') {
    const verdict = executionResult?.verdict || 'Runtime Error';
    const options = [
      `❌ DEBUG ALERT! ${leaderName} hit a ${verdict} during sample tests! Debugging boundary conditions now...`,
      `🛠️ TROUBLESHOOTING: ${leaderName}'s test execution failed (${verdict})! Analyzing test case inputs to patch the bug...`,
    ];
    return { text: options[Math.floor(Math.random() * options.length)], hypeLevel: 'medium' };
  }

  if (norm === 'SUBMIT_FAILED') {
    const verdict = executionResult?.verdict || 'Wrong Answer';
    const options = [
      `🚨 CRITICAL BUG! ${leaderName} submitted for "${problemTitle}" but hit ${verdict}! Huge window of opportunity for ${chaserName || 'opponents'}!`,
      `⚠️ TEST CASE FAILED! ${leaderName}'s submission was rejected (${verdict}). Back to the drawing board!`,
    ];
    return { text: options[Math.floor(Math.random() * options.length)], hypeLevel: 'high' };
  }

  if (norm === 'JOIN') {
    const options = [
      `🎙️ A new challenger enters the arena! Room ${roomCode} now has ${participantCount} coders locked in for battle!`,
      `⚔️ ARENA LOCK-IN! The competitive atmosphere spikes in ${roomCode} as coders prepare to tackle "${problemTitle}"!`,
      `🔥 CHALLENGER APPROACHING! New player joins the lobby. Who will take early dominance on "${problemTitle}"?`,
    ];
    return { text: options[Math.floor(Math.random() * options.length)], hypeLevel: 'medium' };
  }

  if (norm === 'LEAD_SWAP') {
    const options = [
      `🔥 LEAD SWAP ALERT! ${leaderName} surges into 1st place with ${leaderScore} pts, dethroning ${chaserName || 'the competition'} on "${problemTitle}"!`,
      `💥 BOOM! ${leaderName} pulls off an incredible takeover! Now commanding 1st place with ${leaderScore} points!`,
      `⚡ HIGH VOLTAGE OVERTAKE! ${leaderName} snatches the lead! The arena goes wild!`,
    ];
    return { text: options[Math.floor(Math.random() * options.length)], hypeLevel: 'high' };
  }

  if (norm === 'FAST_SUBMISSION' || norm === 'SPEED_RUN') {
    const options = [
      `🏎️ LIGHTNING SPEED! ${leaderName} smashes out an accepted submission on "${problemTitle}" in record speed!`,
      `⚡ SPEED RUNNER IN THE HOUSE! ${leaderName} locked in an optimal solution before the clock even warmed up!`,
      `🚀 BLISTERING PACE! ${leaderName} submits with lightning velocity! Maximum speed bonus unlocked!`,
    ];
    return { text: options[Math.floor(Math.random() * options.length)], hypeLevel: 'high' };
  }

  if (norm === 'HIGH_SCORE') {
    const options = [
      `👑 ARENA HIGH SCORE! ${leaderName} shatters the score barrier with a towering ${leaderScore} pts!`,
      `🏆 RECORD BREAKER! ${leaderName} sets a new high score peak on "${problemTitle}"! Unstoppable force!`,
      `💎 MASTERCLASS! ${leaderName} locks in ${leaderScore} points with brilliant algorithmic precision!`,
    ];
    return { text: options[Math.floor(Math.random() * options.length)], hypeLevel: 'high' };
  }

  if (norm === 'SUBMIT' || norm === 'SCORE_POINTS' || norm === 'SUBMIT_ACCEPTED') {
    const options = [
      `🎯 ACCEPTED! ${leaderName} submits a working solution for "${problemTitle}" and claims ${leaderScore} pts!`,
      `⚡ ALL TEST CASES PASSED! ${leaderName} puts points on the board with clean execution on "${problemTitle}"!`,
      `👀 SUBMISSION LOCKED! ${leaderName} delivers a successful solution to the judge!`,
    ];
    return { text: options[Math.floor(Math.random() * options.length)], hypeLevel: 'medium' };
  }

  // Default / TICK / PERIODIC_UPDATE
  const options = [
    `🎙️ SHOUTCASTER DESK: ${leaderName || 'Coders'} holding top position with ${leaderScore} pts on "${problemTitle}". Clock ticking down!`,
    `🧠 ANALYST DESK: Clean time complexity will decide this battle. Room ${roomCode} is in high gear!`,
    `⚡ ARENA UPDATE: ${participantCount} coders battling live for "${problemTitle}". Every millisecond matters!`,
    `⚔️ INTENSE SHOWDOWN: The algorithm duel in ${roomCode} reaches peak tension! Who will make the next clutch move?`,
  ];
  return { text: options[Math.floor(Math.random() * options.length)], hypeLevel: 'low' };
}

export async function POST(req: NextRequest) {
  try {
    const body: CommentatorRequestBody = await req.json();
    const roomCode = body.roomCode || body.roomName || 'ARENA-1';
    const eventType = (body.eventType || body.event || 'TICK').toUpperCase();
    const participants = body.participants || [];
    const problemTitle = body.problemTitle || body.activeProblemTitle || 'DSA Challenge';
    const language = body.language || 'cpp';
    const codeSnippet = body.codeSnippet || '';
    const linesOfCode = body.linesOfCode || (codeSnippet ? codeSnippet.split('\n').length : 0);
    const executionResult = body.executionResult;
    const actorName = body.userName || 'Coder';

    // Extract leader and second place participant details
    const sortedParticipants = [...participants].sort(
      (a, b) => (b.score ?? b.scores ?? 0) - (a.score ?? a.scores ?? 0)
    );
    const leader = sortedParticipants[0] || { userName: actorName, name: actorName, score: 0, scores: 0 };
    const chaser = sortedParticipants[1] || { userName: 'Opponent', name: 'Opponent', score: 0, scores: 0 };

    const leaderName = actorName || leader.userName || leader.name || 'Top Coder';
    const leaderScore = leader.score ?? leader.scores ?? 0;
    const chaserName = chaser.userName || chaser.name || '';

    // Generate native fallback commentary
    const fallback = generateNativeFallback(
      eventType,
      leaderName,
      leaderScore,
      chaserName,
      problemTitle,
      roomCode,
      participants.length,
      linesOfCode,
      executionResult
    );

    let commentaryText = fallback.text;
    let hypeLevel: 'high' | 'medium' | 'low' = fallback.hypeLevel;

    // Call FreeModel AI if configured
    if (process.env.FREEMODEL_API_KEY) {
      try {
        const systemPrompt =
          'You are an elite, high-energy esports shoutcaster broadcasting a competitive coding duel. ' +
          'Give granular play-by-play commentary like a real sports caster (e.g. mention player progress, line count, failing test cases, getting close, or debugging). ' +
          'Write exactly 1 punchy, exciting callout line (max 25 words). Use emojis and player names.';

        const userPrompt =
          `Room Code: ${roomCode}. Event: ${eventType}. Player: ${leaderName}. Problem: "${problemTitle}". ` +
          `Lines of code written: ${linesOfCode}. Test Verdict: ${executionResult?.verdict || 'N/A'}. ` +
          `Language: ${language}. Deliver the play-by-play shoutcast line now.`;

        const aiResponse = await callFreeModel({
          model: MODELS.FAST,
          systemPrompt,
          userPrompt,
          temperature: 0.8,
          maxTokens: 80,
          fallbackText: fallback.text,
        });

        if (aiResponse && aiResponse.trim().length > 10) {
          const cleanedText = aiResponse.trim().replace(/^["']|["']$/g, '');
          commentaryText = cleanedText.startsWith('🎙️') ? cleanedText : `🎙️ ${cleanedText}`;
          if (['LEAD_SWAP', 'FAST_SUBMISSION', 'HIGH_SCORE', 'SUBMIT_FAILED', 'SAMPLE_PASSED'].includes(eventType)) {
            hypeLevel = 'high';
          } else if (['SUBMIT', 'JOIN', 'TYPING_PROGRESS', 'RUN_CODE'].includes(eventType)) {
            hypeLevel = 'medium';
          }
        }
      } catch (aiErr) {
        console.warn('[Commentator API] FreeModel call failed, utilizing native fallback:', aiErr);
      }
    }

    return NextResponse.json({
      commentary: commentaryText,
      timestamp: Date.now(),
      hypeLevel,
      speaker: 'Shoutcaster',
      success: true,
    });
  } catch (error: any) {
    console.error('Error in AI Commentator route:', error);
    return NextResponse.json(
      {
        commentary: '🎙️ SHOUTCASTER DESK: High-intensity competitive coding underway in the arena!',
        timestamp: Date.now(),
        hypeLevel: 'medium',
        speaker: 'Shoutcaster',
        success: false,
      },
      { status: 500 }
    );
  }
}
