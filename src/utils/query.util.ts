import type { QueryResult } from "pg";
import { pool } from "../db";

// ── Generic pool.query wrapper ────────────────────────────────
export const query = async <T extends object>(sql: string, params?: unknown[]): Promise<QueryResult<T>> => {
  return pool.query<T>(sql, params);
};

// Whitelist tables/fields to avoid identifier injection via interpolation
const allowedTables: Record<string, string[]> = {
  users: ["id", "name", "email", "password", "role", "created_at", "updated_at"],
  issues: ["id", "title", "description", "type", "status", "reporter_id", "created_at", "updated_at"],
};

// ── Find single record by field — returns null if not found ───
export const findOneBy = async <T extends object>(table: string, field: string, value: unknown): Promise<T | null> => {
  const fields = allowedTables[table];
  if (!fields || !fields.includes(field)) {
    throw new Error("Unsafe table or field name used in findOneBy");
  }
  const sql = `SELECT * FROM ${table} WHERE ${field} = $1 LIMIT 1`;
  const result = await pool.query<T>(sql, [value]);
  const row = result.rows[0];
  return row !== undefined ? row : null;
};

// ── Batch fetch reporters by IDs — avoids SQL JOINs ──────────
export interface ReporterRow {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}

export const findUsersByIds = async (ids: number[]): Promise<ReporterRow[]> => {
  if (ids.length === 0) return [];
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
  const sql = `SELECT id, name, role FROM users WHERE id IN (${placeholders})`;
  const result = await pool.query<ReporterRow>(sql, ids);
  return result.rows;
};
