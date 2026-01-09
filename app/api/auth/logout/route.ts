import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const cookieStore = cookies();
        
        // Clear auth token cookie
        cookieStore.set('auth-token', '', {
            httpOnly: true,
            maxAge: 0,
            path: '/',
        });

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error: any) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: error.message || 'Logout failed' },
            { status: 500 }
        );
    }
}
