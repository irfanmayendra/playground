// Auth Middleware — JWT Validation + RBAC
import { Context, Next } from 'hono';
import { syncUserToDB } from '../lib/sync-user.js';

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'https://auth.lostinvirtual.com';
const REALM = process.env.KEYCLOAK_REALM || 'pengaduan';

interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  preferred_username: string;
  realm_access: { roles: string[] };
  azp: string;
  iss: string;
  exp: number;
  iat: number;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    // Accept any issuer from Keycloak (localhost or custom hostname)
    const validIssuers = [
      `${KEYCLOAK_URL}/realms/${REALM}`,
      `https://auth.lostinvirtual.com/realms/${REALM}`,
      `http://auth.lostinvirtual.com/realms/${REALM}`,
      `https://auth.playground.lostinvirtual.com/realms/${REALM}`,
      `http://auth.playground.lostinvirtual.com/realms/${REALM}`,
    ];
    if (!validIssuers.includes(payload.iss)) return null;
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'Missing or invalid token' }, 401);
  }
  const token = authHeader.substring(7);
  const payload = await verifyToken(token);
  if (!payload) {
    return c.json({ error: 'Unauthorized', message: 'Invalid or expired token' }, 401);
  }
  c.set('user', payload);
  c.set('userId', payload.sub);
  c.set('userEmail', payload.email);
  c.set('userRole', payload.realm_access?.roles?.find((r: string) => 
    ['platform_superadmin', 'tenant_admin', 'tenant_staff', 'tenant_user', 'super_admin', 'instansi_admin', 'petugas', 'supervisor', 'masyarakat'].includes(r)
  ) || 'masyarakat');
  
  // Auto-sync user to database
  await syncUserToDB(payload);
  
  await next();
}

export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const userRole = c.get('userRole') as string;
    if (!roles.includes(userRole)) {
      return c.json({ error: 'Forbidden', message: `Requires role: ${roles.join(' or ')}` }, 403);
    }
    await next();
  };
}

export const requireAdmin = requireRole('super_admin', 'instansi_admin');
export const requirePetugas = requireRole('super_admin', 'instansi_admin', 'petugas', 'supervisor');
export const requireSuperAdmin = requireRole('super_admin');
