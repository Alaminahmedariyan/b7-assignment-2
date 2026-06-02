import type { Response } from "express";

interface ISuccessResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
}

const sendResponse = <T>(res: Response, responseData: ISuccessResponse<T>): void => {
  res.status(responseData.statusCode).json({
    success: responseData.success,
    message: responseData.message,
    ...(responseData.data !== undefined && { data: responseData.data }),
  });
};

export default sendResponse;