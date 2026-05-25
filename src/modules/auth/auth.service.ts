import bcrypt from "bcrypt";
import { query, findOneBy } from "../../utils/query.util";
import { signToken } from "../../utils/jwt.util";
import type { SignupBody, LoginBody, UserRow, SafeUser, TokenPayload } from "./auth.types.js";

// ─────────────────────────────────────────────────────────────
// Helper: strip password from UserRow → SafeUser
// ─────────────────────────────────────────────────────────────
const toSafeUser = (user: UserRow): SafeUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

// ─────────────────────────────────────────────────────────────
// signupIntoDB
// ─────────────────────────────────────────────────────────────
const signupIntoDB = async (payload: SignupBody): Promise<SafeUser> => {
  const { name, email, password } = payload;
  const role = payload.role ?? "contributor";

  // ── Business rule: no duplicate emails ───────────────────
  const existing = await findOneBy<UserRow>("users", "email", email);
  if (existing !== null) {
    const err = Object.assign(new Error("Email is already registered."), {
      statusCode: 400,
    });
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at
  `;
  const result = await query<SafeUser>(sql, [name, email, hashedPassword, role]);
  const newUser = result.rows[0];
  if (!newUser) throw new Error("Failed to create user.");
  return newUser;
};

// ─────────────────────────────────────────────────────────────
// loginUser
// ─────────────────────────────────────────────────────────────
const loginUser = async (
  payload: LoginBody
): Promise<{ token: string; user: SafeUser }> => {
  const { email, password } = payload;

  // ── Business rule: user must exist ───────────────────────
  const user = await findOneBy<UserRow>("users", "email", email);
  if (user === null) {
    const err = Object.assign(new Error("Invalid email or password."), {
      statusCode: 401,
    });
    throw err;
  }

  // ── Business rule: password must match ───────────────────
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = Object.assign(new Error("Invalid email or password."), {
      statusCode: 401,
    });
    throw err;
  }

  const tokenPayload: TokenPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };
  const token = signToken(tokenPayload);

  return { token, user: toSafeUser(user) };
};

// ─────────────────────────────────────────────────────────────
// Export service object
// ─────────────────────────────────────────────────────────────
export const authService = {
  signupIntoDB,
  loginUser,
};