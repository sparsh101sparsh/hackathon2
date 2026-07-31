import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { role } = body;

    if (!role || !['GUEST', 'REGISTERED', 'ADMIN'].includes(role.toUpperCase())) {
      return NextResponse.json(
        { error: 'Valid role (GUEST, REGISTERED, ADMIN) is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      user: {
        id,
        email: 'guest@codeforge.ai',
        name: 'Guest Coder',
        role: role.toUpperCase(),
        rating: 0,
        createdAt: new Date().toISOString(),
      },
      message: `User role updated to ${role.toUpperCase()}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: message || 'Failed to update user role' },
      { status: 500 }
    );
  }
}
