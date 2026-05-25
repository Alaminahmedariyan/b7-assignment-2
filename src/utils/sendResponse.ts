import type { Response } from 'express';

type TSuccessResponse<T> = {
  statusCode: number;
  success: true;
  message: string;
  data: T;
};

type TErrorResponse = {
  statusCode: number;
  success: false;
  message: string;
  errors: unknown;
};

type TResponse<T> = TSuccessResponse<T> | TErrorResponse;

const sendResponse = <T>(res: Response, data: TResponse<T>): Response => {
  const { statusCode, success, message } = data;

  const body: Record<string, unknown> = { success, message };

  if (success) {
    body.data = data.data;
  } else {
    body.errors = data.errors;
  }

  return res.status(statusCode).json(body);
};

export default sendResponse;