import type { QueryResult } from 'pg'
import { pool } from '../db'

// ── Generic pool.query wrapper ────────────────────────────────
export const query = async <T extends object>(
  sql: string,
  params?: unknown[]
): Promise<QueryResult<T>> => {
  return pool.query<T>(sql, params)
}

// ── Find single record by field — returns null if not found ───
// Safe for noUncheckedIndexedAccess: explicitly checks rows[0]
export const findOneBy = async <T extends object>(
  table: string,
  field: string,
  value: unknown
): Promise<T | null> => {
  const sql = `SELECT * FROM ${table} WHERE ${field} = $1 LIMIT 1`
  const result = await pool.query<T>(sql, [value])
  const row = result.rows[0]
  return row !== undefined ? row : null
}

// ── Batch fetch reporters by IDs — avoids SQL JOINs ──────────
// Uses WHERE id IN (...) for a single efficient query
export interface ReporterRow {
  id: number
  name: string
  role: string
}

export const findUsersByIds = async (
  ids: number[]
): Promise<ReporterRow[]> => {
  if (ids.length === 0) return []

  // Build $1, $2, $3 ... placeholders dynamically
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ')
  const sql = `
    SELECT id, name, role
    FROM users
    WHERE id IN (${placeholders})
  `
  const result = await pool.query<ReporterRow>(sql, ids)
  return result.rows
}
