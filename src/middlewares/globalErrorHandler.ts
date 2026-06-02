import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

interface IPostgresError extends Error {
  statusCode?: number;
  code?: string;
  detail?: string;
}

const globalErrorHandler: ErrorRequestHandler = (
  err: IPostgresError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode: number = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message: string = err.message || 'Something went wrong on the server.';
  let errors: unknown = process.env['NODE_ENV'] === 'development' ? err.stack : 'Internal server error';

  if (err.code === '23505') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Duplicate resource error';
    errors = err.detail || 'The resource you are trying to create already exists.';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Unauthorized';
    errors = 'Invalid JWT token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Unauthorized';
    errors = 'JWT token has expired. Please log in again.';
  }

  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.message || 'Business logic violation';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default globalErrorHandler;