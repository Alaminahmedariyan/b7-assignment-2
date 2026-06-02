import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { issuesService } from "./issues.service";

const createIssue = catchAsync(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const { title, description, type } = req.body;
  const reporterId = req.user!.id;

  if (!title || !description || !type) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "title, description, and type are required.",
      errors: "Missing required fields",
    });
    return;
  }

  if (title.length > 150) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "title cannot exceed 150 characters.",
      errors: "Validation error",
    });
    return;
  }

  if (description.length < 20) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "description must be at least 20 characters long.",
      errors: "Validation error",
    });
    return;
  }

  if (type !== "bug" && type !== "feature_request") {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "type must be bug or feature_request.",
      errors: "Validation error",
    });
    return;
  }

  const result = await issuesService.createIssueInDB({ title, description, type }, reporterId);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Issue created successfully",
    data: result,
  });
});

const getAllIssues = catchAsync(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const { sort, type, status } = req.query;

  const result = await issuesService.getAllIssuesFromDB({
    sort: sort as string,
    type: type as string,
    status: status as string,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Issues retrieved successfully",
    data: result,
  });
});

const getSingleIssue = catchAsync(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const { id } = req.params;

  const result = await issuesService.getSingleIssueFromDB(Number(id));

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Issue retrieved successfully",
    data: result,
  });
});

const updateIssue = catchAsync(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { title, description, type } = req.body;
  const user = req.user!;

  if (title !== undefined && title.length > 150) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "title cannot exceed 150 characters.",
      errors: "Validation error",
    });
    return;
  }

  if (description !== undefined && description.length < 20) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "description must be at least 20 characters long.",
      errors: "Validation error",
    });
    return;
  }

  if (type !== undefined && type !== "bug" && type !== "feature_request") {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "type must be bug or feature_request.",
      errors: "Validation error",
    });
    return;
  }

  const result = await issuesService.updateIssueInDB(Number(id), { title, description, type }, user as any);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Issue updated successfully",
    data: result,
  });
});

const deleteIssue = catchAsync(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const { id } = req.params;

  await issuesService.deleteIssueFromDB(Number(id));

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Issue deleted successfully"
  });
});

export const issuesController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
