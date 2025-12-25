/**
 * Authentication API helpers for Admin Dashboard
 * Verifies credentials against the Admin Control Plane API
 */

interface UserResponse {
  user_id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

/**
 * Verify user credentials with Admin Control Plane API
 * Used by NextAuth CredentialsProvider
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<UserResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:8008';

  try {
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
      throw new Error(error.message || 'Invalid credentials');
    }

    const data = await response.json();

    // Validate response structure
    if (!data.user_id || !data.email) {
      throw new Error('Invalid response from authentication server');
    }

    // Only allow admin and super_admin roles
    if (data.role !== 'admin' && data.role !== 'super_admin') {
      throw new Error('Insufficient permissions - admin access required');
    }

    return {
      user_id: data.user_id,
      email: data.email,
      name: data.name || data.email.split('@')[0],
      role: data.role,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to verify credentials');
  }
}

/**
 * Verify user session with Admin Control Plane API
 * Used to validate existing sessions
 */
export async function verifySession(token: string): Promise<UserResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:8008';

  try {
    const response = await fetch(`${apiUrl}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Session verification failed');
    }

    const data = await response.json();

    return {
      user_id: data.user_id,
      email: data.email,
      name: data.name || data.email.split('@')[0],
      role: data.role,
    };
  } catch (error) {
    throw new Error('Invalid or expired session');
  }
}
