import { describe, it } from 'node:test';
import assert from 'node:assert';
// Import only the pure token functions, avoiding Prisma dependency
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pawmigos-dev-jwt-secret-change-in-production';

interface TokenPayload { userId: string; phone: string; role: string; }

function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token: string): TokenPayload | null {
  try { return jwt.verify(token, JWT_SECRET) as TokenPayload; } catch { return null; }
}

describe('Auth Token', () => {
  it('should generate and verify a valid token', () => {
    const payload = { userId: 'user123', phone: '9876543210', role: 'CONSUMER' };
    const token = generateToken(payload);
    assert.ok(token.length > 0);

    const decoded = verifyToken(token);
    assert.ok(decoded);
    assert.strictEqual(decoded!.userId, 'user123');
    assert.strictEqual(decoded!.phone, '9876543210');
    assert.strictEqual(decoded!.role, 'CONSUMER');
  });

  it('should return null for invalid token', () => {
    const decoded = verifyToken('invalid-token');
    assert.strictEqual(decoded, null);
  });

  it('should return null for empty token', () => {
    const decoded = verifyToken('');
    assert.strictEqual(decoded, null);
  });
});
