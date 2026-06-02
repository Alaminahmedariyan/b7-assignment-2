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
  let message: string = 'An error occurred';
  let errors: unknown = process.env['NODE_ENV'] === 'development' ? err.stack : 'Internal server error';

  if (err.code === '23505') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Duplicate resource error';
    errors = err.detail || 'The resource you are trying to create already exists.';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Unauthorized access';
    errors = 'Invalid JWT token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Session expired';
    errors = 'JWT token has expired. Please log in again.';
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    if (err.statusCode === StatusCodes.NOT_FOUND) {
      message = 'Resource not found';
    } else if (err.statusCode === StatusCodes.FORBIDDEN) {
      message = 'Access denied';
    } else if (err.statusCode === StatusCodes.UNAUTHORIZED) {
      message = 'Authentication failed';
    } else {
      message = 'Validation or business logic error';
    }
    errors = err.message || 'Something went wrong.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default globalErrorHandler;