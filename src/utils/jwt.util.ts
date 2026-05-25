import jwt from 'jsonwebtoken'

export interface JwtPayload {
  id: number
  name: string
  role: string
}

// ── Sign JWT with user id, name, role in payload ──────────────
export const signToken = (payload: JwtPayload): string => {
  const secret = process.env['JWT_SECRET']
  if (!secret) throw new Error('JWT_SECRET is not defined')

  const expiresIn = process.env['JWT_EXPIRES_IN'] ?? '7d'

  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  })
}

// ── Verify JWT and return decoded payload ─────────────────────
export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env['JWT_SECRET']
  if (!secret) throw new Error('JWT_SECRET is not defined')

  const decoded = jwt.verify(token, secret)
  return decoded as JwtPayload
}
