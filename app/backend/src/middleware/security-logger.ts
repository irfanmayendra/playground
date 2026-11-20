// Security Logger — Capture & log all attack attempts
import { Context, Next } from 'hono';
import { sql } from '../lib/db.js';

// Suspicious patterns (more precise)
const ATTACK_PATTERNS = {
  'SQL_INJECTION': /(\bunion\b\s+\bselect\b|\bselect\b.*\bfrom\b\s+\w+|\binsert\b\s+\binto\b|\bdelete\b\s+\bfrom\b|\bdrop\b\s+\btable\b|\bupdate\b\s+\w+\s+\bset\b|or\s+1=1|'\s*or\s*'|;\s*drop\s|;\s*delete\s|;\s*update\s)/i,
  'XSS': /(<script[\s>]|javascript:|onerror\s*=|onload\s*=|document\.cookie|<iframe[\s>]|alert\s*\()/i,
  'PATH_TRAVERSAL': /(\.\.\/\.\.\/|\.\.\\\.\.\\|\/etc\/passwd|\/etc\/shadow|c:\\windows|\/proc\/self)/i,
  'COMMAND_INJECTION': /(;|\||`)\s*(rm|nc|curl|wget|bash|sh|python|perl|ruby)\b|\$\(\s*(rm|nc|curl|wget|bash)/i,
  'SENSITIVE_FILE': /(\.env$|\.git\/|wp-admin|phpmyadmin|\.htaccess|\.bak$|\.sql$|\.dump$|\/config\.php)/i,
  'SCANNER': /(nikto|sqlmap|nmap|burp.?suite|acunetix|nessus|owasp.?zap|wpscan|dirbuster|gobuster|masscan|zgrab)/i,
};

function detectAttack(url: string, body: string, userAgent: string): { type: string; pattern: string } | null {
  const testStr = `${url} ${body} ${userAgent}`.toLowerCase();
  
  for (const [type, pattern] of Object.entries(ATTACK_PATTERNS)) {
    if (pattern.test(testStr)) {
      return { type, pattern: pattern.source.substring(0, 50) };
    }
  }
  return null;
}

export async function securityLogger(c: Context, next: Next) {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const userAgent = c.req.header('user-agent') || 'unknown';
  
  // Read body for scanning (only for POST/PUT/PATCH)
  let body = '';
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      const clone = c.req.raw.clone();
      body = await clone.text();
    } catch {}
  }

  // Detect attack
  const attack = detectAttack(path, body, userAgent);

  // Log to security_log table
  const logEntry = {
    timestamp: new Date().toISOString(),
    method,
    path,
    ip,
    user_agent: userAgent.substring(0, 200),
    attack_type: attack?.type || 'NORMAL',
    attack_pattern: attack?.pattern || null,
    status: 0, // will be set after response
    response_time_ms: 0,
  };

  // Process request
  await next();

  // After response
  const status = c.res.status;
  const responseTime = Date.now() - start;

  logEntry.status = status;
  logEntry.response_time_ms = responseTime;

  // Save to DB (async, don't block response)
  try {
    await sql`
      INSERT INTO security_log (timestamp, method, path, ip, user_agent, attack_type, attack_pattern, status, response_time_ms)
      VALUES (${logEntry.timestamp}, ${logEntry.method}, ${logEntry.path}, ${logEntry.ip}, ${logEntry.user_agent}, ${logEntry.attack_type}, ${logEntry.attack_pattern}, ${logEntry.status}, ${logEntry.response_time_ms})
    `;
  } catch (err) {
    // Silent fail — don't block response
    console.error('[SECURITY] Log error:', err);
  }

  // Alert if attack detected
  if (attack) {
    console.log(`🚨 [SECURITY ALERT] ${attack.type} detected!`);
    console.log(`   IP: ${ip}`);
    console.log(`   Path: ${method} ${path}`);
    console.log(`   Pattern: ${attack.pattern}`);
    console.log(`   User-Agent: ${userAgent.substring(0, 100)}`);
    console.log(`   Status: ${status}`);
  }
}
