// Audit Logging Middleware
import { Context, Next } from 'hono';

interface AuditEntry {
  user_id?: string;
  user_email?: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

// In-memory queue (will be flushed to DB)
const auditQueue: AuditEntry[] = [];

export function logAudit(entry: AuditEntry) {
  auditQueue.push({
    ...entry,
    created_at: new Date().toISOString(),
  } as AuditEntry & { created_at: string });
}

// Flush audit queue to database
export async function flushAudit() {
  if (auditQueue.length === 0) return;
  
  // TODO: Insert into database
  // const entries = auditQueue.splice(0, auditQueue.length);
  // await db.insert(auditLog).values(entries);
  
  console.log(`[AUDIT] Flushed ${auditQueue.length} entries`);
  auditQueue.length = 0;
}

// Auto-flush every 30 seconds
setInterval(flushAudit, 30000);

// Audit middleware — log all requests
export async function auditMiddleware(c: Context, next: Next) {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;

  // Log only mutations (POST, PUT, PATCH, DELETE)
  const method = c.req.method;
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return;

  const user = c.get('user');
  const path = c.req.path;

  // Determine action from method + path
  let action = method.toLowerCase();
  if (method === 'POST') action = 'create';
  else if (method === 'PUT' || method === 'PATCH') action = 'update';
  else if (method === 'DELETE') action = 'delete';

  // Extract table name from path
  const pathParts = path.split('/').filter(Boolean);
  const tableName = pathParts.includes('api') ? pathParts[pathParts.indexOf('api') + 1] : 'unknown';

  logAudit({
    user_id: user?.sub,
    user_email: user?.email,
    action,
    table_name: tableName,
    record_id: pathParts[pathParts.length - 1],
    ip_address: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
    user_agent: c.req.header('user-agent'),
  });
}

// Get audit logs
export function getAuditLogs(limit = 100): AuditEntry[] {
  return auditQueue.slice(-limit);
}
