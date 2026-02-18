import { NextRequest, NextResponse } from 'next/server';
import { loginUser, createToken } from '@/lib/auth-utils';
import { cookies } from 'next/headers';
import { createRateLimiter } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic'

const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 })

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
        if (!loginLimiter.check(ip)) {
            return NextResponse.json(
                { error: 'Too many login attempts. Please try again later.' },
                { status: 429 }
            )
        }
        const body = await request.json();
        const { email, password } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Login user from Postgres
        const user = await loginUser(email, password);

        // Create JWT token
        const token = await createToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Set HTTP-only cookie
        const cookieStore = cookies();
        cookieStore.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: error.message || 'Login failed' },
            { status: 401 }
        );
    }
}
