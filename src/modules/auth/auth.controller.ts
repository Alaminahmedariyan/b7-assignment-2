import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../utils/sendResponse";
import { authService } from "./auth.service";
import type { SignupBody, LoginBody } from "./auth.types";
import catchAsync from "../../utils/catchAsync";

const signup = catchAsync(async (req: Request<unknown, unknown, SignupBody>, res: Response, _next: NextFunction): Promise<void> => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "name, email, and password are required.",
      errors: "Missing required fields",
    });
    return;
  }

  if (role !== undefined && role !== "contributor" && role !== "maintainer") {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "role must be contributor or maintainer.",
      errors: "Invalid role",
    });
    return;
  }

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
});

const login = catchAsync(async (req: Request<unknown, unknown, LoginBody>, res: Response, _next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "email and password are required.",
      errors: "Missing credentials",
    });
    return;
  }

  const result = await authService.loginUser({ email, password });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const authController = {
  signup,
  login,
};
