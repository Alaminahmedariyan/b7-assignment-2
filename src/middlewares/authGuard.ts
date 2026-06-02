import { StatusCodes } from "http-status-codes";
import catchAsync from "../utils/catchAsync";
import type { TokenPayload } from "../modules/auth/auth.types";
import { AppError } from "./appError";
import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.util";

const authGuard = (...requiredRoles: ("contributor" | "maintainer")[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized to access this resource.");
    }

    // Support "Bearer <token>" or raw token
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    const decoded = verifyToken(token, "access") as TokenPayload;

    if (!decoded?.id || !decoded?.role || !decoded?.name) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid token payload structure.");
    }

    if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
      throw new AppError(StatusCodes.FORBIDDEN, "You do not have the required permissions to perform this action.");
    }

    req.user = decoded;
    next();
  });
};

export default authGuard;
