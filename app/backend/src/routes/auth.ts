// Auth Routes — Login via API (proxy to Keycloak)
import { Hono } from 'hono';

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'https://auth.lostinvirtual.com';
const REALM = process.env.KEYCLOAK_REALM || 'pengaduan';
const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'pengaduan-app';

type Variables = { user: { sub: string; email: string }; userId: string; userEmail: string; userRole: string; };

const auth = new Hono<{ Variables: Variables }>();

// POST /api/auth/login — Login with email + password
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: 'Email dan password wajib diisi' }, 400);
  }

  try {
    const res = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'password',
        username: email,
        password: password,
      }),
    });

    const data = await res.json();

    if (data.access_token) {
      // Decode user info
      const payload = JSON.parse(Buffer.from(data.access_token.split('.')[1], 'base64url').toString());
      const role = payload.realm_access?.roles?.find((r: string) =>
        ['super_admin', 'instansi_admin', 'petugas', 'supervisor', 'masyarakat'].includes(r)
      ) || 'masyarakat';

      return c.json({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        user: {
          id: payload.sub,
          email: payload.email,
          name: payload.name || payload.preferred_username,
          role,
        },
      });
    }

    return c.json({ error: data.error_description || 'Login gagal' }, 401);
  } catch (err) {
    return c.json({ error: 'Gagal terhubung ke server auth' }, 502);
  }
});

// POST /api/auth/refresh — Refresh token
auth.post('/refresh', async (c) => {
  const { refresh_token } = await c.req.json();

  try {
    const res = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token,
      }),
    });

    const data = await res.json();

    if (data.access_token) {
      return c.json({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      });
    }

    return c.json({ error: 'Token expired' }, 401);
  } catch {
    return c.json({ error: 'Gagal refresh token' }, 502);
  }
});

// GET /api/auth/me — Get current user
auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const token = authHeader.substring(7);
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    const role = payload.realm_access?.roles?.find((r: string) =>
      ['super_admin', 'instansi_admin', 'petugas', 'supervisor', 'masyarakat'].includes(r)
    ) || 'masyarakat';

    return c.json({
      id: payload.sub,
      email: payload.email,
      name: payload.name || payload.preferred_username,
      role,
    });
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

export default auth;
