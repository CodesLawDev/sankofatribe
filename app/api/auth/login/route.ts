import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, setSession } from '@/lib/auth'

interface LoginRequest {
    username: string
    password: string
    rememberMe?: boolean
}

export async function POST(request: NextRequest) {
    try {
        const body: LoginRequest = await request.json()
        const { username, password } = body

        // Validate input
        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            )
        }

        // Validate credentials against Sanity
        const user = await validateCredentials(username, password)

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            )
        }

        // Set session cookie
        await setSession(user)

        // Return user data
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'An error occurred during login' },
            { status: 500 }
        )
    }
}
