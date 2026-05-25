import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../utils/sendResponse";
import { authService } from "./auth.service.js";
import type { SignupBody, LoginBody } from "./auth.types.js";

// ─────────────────────────────────────────────────────────────
// POST /api/auth/signup
// ─────────────────────────────────────────────────────────────
const signup = async (
  req: Request<Record<string, never>, unknown, SignupBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // ── Input validation ──────────────────────────────────────
    if (!name || !email || !password) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "name, email, and password are required.",
        errors: "Missing required fields",
      });
      return;
    }

    if (role !== undefined && role !== "contributor" && role !== "maintainer") {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "role must be contributor or maintainer.",
        errors: "Invalid role",
      });
      return;
    }

    // ✅ Business logic (duplicate check, hash, insert) is in service
    // Note: role is built conditionally to satisfy exactOptionalPropertyTypes.
    // Spreading undefined onto the object omits the key entirely.
    const newUser = await authService.signupIntoDB({
      name,
      email,
      password,
      ...(role !== undefined && { role }),
    });

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────
const login = async (
  req: Request<Record<string, never>, unknown, LoginBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // ── Input validation ──────────────────────────────────────
    if (!email || !password) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "email and password are required.",
        errors: "Missing credentials",
      });
      return;
    }

    // ✅ Business logic (lookup, bcrypt compare, token sign) is in service
    const result = await authService.loginUser({ email, password });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// Export controller object
// ─────────────────────────────────────────────────────────────
export const authController = {
  signup,
  login,
};