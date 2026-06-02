import bcrypt from "bcrypt";
import { query, findOneBy } from "../../utils/query.util";
import { signToken } from "../../utils/jwt.util";
import type { SignupBody, LoginBody, UserRow, SafeUser, TokenPayload } from "./auth.types";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../middlewares/appError";
import type { JwtPayload } from "../../utils/jwt.util";

const toSafeUser = (user: UserRow): SafeUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

const signupIntoDB = async (payload: SignupBody): Promise<SafeUser> => {
  const { name, email, password } = payload;
  const role = payload.role ?? "contributor";

  const existing = await findOneBy<UserRow>("users", "email", email);
  if (existing !== null) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email is already registered.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at
  `;
  const result = await query<SafeUser>(sql, [name, email, hashedPassword, role]);
  const newUser = result.rows[0];
  if (!newUser) {
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create user.");
  }
  return newUser;
};

const loginUser = async (
  payload: LoginBody
): Promise<{ token: string; user: SafeUser }> => {
  const { email, password } = payload;

  const user = await findOneBy<UserRow>("users", "email", email);
  if (user === null) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  const tokenPayload: JwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };
  const tokens = signToken(tokenPayload);

  return { token: tokens.accessToken, user: toSafeUser(user) };
};

export const authService = {
  signupIntoDB,
  loginUser,
};