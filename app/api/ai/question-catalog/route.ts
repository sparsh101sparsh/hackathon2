import { NextResponse } from 'next/server';
import { getQuestionCatalog } from '@/lib/problemKnowledge';

export const dynamic = 'force-dynamic';

/** Read-only coverage endpoint used by AI tooling and verification. */
export async function GET() {
  try {
    const questions = await getQuestionCatalog();
    return NextResponse.json({
      count: questions.length,
      questions,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error reading AI question catalog:', error);
    return NextResponse.json(
      { error: message || 'Failed to read AI question catalog' },
      { status: 500 }
    );
  }
}
