import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const defaultUsers = [
      {
        id: 'guest',
        email: 'guest@codeforge.ai',
        name: 'Guest Coder',
        role: 'GUEST',
        rating: 0,
        avatar: null,
        createdAt: new Date().toISOString(),
        _count: { submissions: 0 },
      },
    ];

    return NextResponse.json(defaultUsers);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error fetching admin users list:', error);
    return NextResponse.json(
      { error: message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
