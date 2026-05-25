// ── Request body types ────────────────────────────────────────

export interface SignupBody {
  name: string;
  email: string;
  password: string;
  role?: "contributor" | "maintainer";
}

export interface LoginBody {
  email: string;
  password: string;
}

// ── DB row shape returned from users table ────────────────────
export interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
  created_at: string;
  updated_at: string;
}

// ── Safe user object sent in responses (password excluded) ────
export interface SafeUser {
  id: number;
  name: string;
  email: string;
  role: "contributor" | "maintainer";
  created_at: string;
  updated_at: string;
}

// ── Token payload shape ───────────────────────────────────────
export interface TokenPayload {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}