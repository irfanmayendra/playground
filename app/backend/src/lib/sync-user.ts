// Auto-sync Keycloak user to database
import { sql } from './db.js';

export async function syncUserToDB(keycloakUser: { 
  sub: string; 
  email: string; 
  preferred_username?: string; 
  name?: string; 
  realm_access?: { roles: string[] };
  tenant_id?: string;
}) {
  try {
    const role = keycloakUser.realm_access?.roles?.find((r: string) => 
      ['platform_superadmin', 'tenant_admin', 'tenant_staff', 'tenant_user', 'super_admin', 'instansi_admin', 'petugas', 'supervisor', 'masyarakat'].includes(r)
    ) || 'masyarakat';

    // Check if user exists
    const existing = await sql`SELECT id FROM users WHERE keycloak_id = ${keycloakUser.sub}`;
    
    if (existing.length > 0) {
      // Update role and last_login
      await sql`UPDATE users SET role = ${role}, last_login = NOW() WHERE keycloak_id = ${keycloakUser.sub}`;
      return existing[0].id;
    }

    // Create user with tenant_id from JWT if available
    const result = await sql`
      INSERT INTO users (keycloak_id, email, nama, role, instansi_id)
      VALUES (${keycloakUser.sub}, ${keycloakUser.email}, ${keycloakUser.name || keycloakUser.preferred_username || keycloakUser.email}, ${role}, ${keycloakUser.tenant_id || null})
      ON CONFLICT (keycloak_id) DO UPDATE SET role = ${role}, last_login = NOW()
      RETURNING id
    `;
    console.log(`[SYNC] User created: ${keycloakUser.email} (${role})`);
    return result[0].id;
  } catch (error) {
    console.error('[SYNC] Error syncing user:', error);
    return null;
  }
}
