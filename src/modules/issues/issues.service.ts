import { query, findUsersByIds } from "../../utils/query.util";
import { StatusCodes } from "http-status-codes";
import type { IssueRow, CreateIssueBody, UpdateIssueBody, IssueFormattedResponse, IssueReporter } from "./issues.types";
import { AppError } from "../../middlewares/appError";

const createIssueInDB = async (payload: CreateIssueBody, reporterId: number): Promise<IssueRow> => {
  const { title, description, type } = payload;

  const sql = `
    INSERT INTO issues (title, description, type, reporter_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
  `;
  const result = await query<IssueRow>(sql, [title, description, type, reporterId]);
  
  if (!result.rows[0]) {
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create issue.");
  }
  return result.rows[0];
};

const getAllIssuesFromDB = async (filters: { sort?: string; type?: string; status?: string }): Promise<IssueFormattedResponse[]> => {
  let sql = `SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues`;
  const filterConditions: string[] = [];
  const queryParams: any[] = [];

  if (filters.type) {
    queryParams.push(filters.type);
    filterConditions.push(`type = $${queryParams.length}`);
  }

  if (filters.status) {
    queryParams.push(filters.status);
    filterConditions.push(`status = $${queryParams.length}`);
  }

  if (filterConditions.length > 0) {
    sql += ` WHERE ` + filterConditions.join(" AND ");
  }

  const orderBy = filters.sort === "oldest" ? "ASC" : "DESC";
  sql += ` ORDER BY created_at ${orderBy}`;

  const issuesResult = await query<IssueRow>(sql, queryParams);
  const issues = issuesResult.rows;

  if (issues.length === 0) return [];

  const reporterIds = Array.from(new Set(issues.map((i) => i.reporter_id)));
  const usersResult = await findUsersByIds(reporterIds);

  const userMap = new Map<number, IssueReporter>();
  usersResult.forEach((user) => userMap.set(user.id, user));

  return issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: userMap.get(issue.reporter_id) || { id: issue.reporter_id, name: "Unknown", role: "contributor" },
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));
};

const getSingleIssueFromDB = async (id: number): Promise<IssueFormattedResponse> => {
  const sql = `SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues WHERE id = $1`;
  const result = await query<IssueRow>(sql, [id]);
  const issue = result.rows[0];

  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  const userSql = `SELECT id, name, role FROM users WHERE id = $1`;
  const userResult = await query<IssueReporter>(userSql, [issue.reporter_id]);
  const reporter = userResult.rows[0] || { id: issue.reporter_id, name: "Unknown", role: "contributor" };

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

const updateIssueInDB = async (
  id: number, 
  payload: UpdateIssueBody, 
  user: { id: number; role: "contributor" | "maintainer" }
): Promise<IssueRow> => {
  const checkSql = `SELECT id, status, reporter_id FROM issues WHERE id = $1`;
  const checkResult = await query<IssueRow>(checkSql, [id]);
  const existingIssue = checkResult.rows[0];

  if (!existingIssue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  if (user.role === "contributor") {
    if (existingIssue.reporter_id !== user.id) {
      throw new AppError(StatusCodes.FORBIDDEN, "You do not have permission to update this issue.");
    }
    if (existingIssue.status !== "open") {
      throw new AppError(StatusCodes.CONFLICT, "Contributors can only update issues with an open status.");
    }
  }

  const { title, description, type } = payload;
  const updates: string[] = [];
  const queryParams: any[] = [];

  if (title !== undefined) {
    queryParams.push(title);
    updates.push(`title = $${queryParams.length}`);
  }
  if (description !== undefined) {
    queryParams.push(description);
    updates.push(`description = $${queryParams.length}`);
  }
  if (type !== undefined) {
    queryParams.push(type);
    updates.push(`type = $${queryParams.length}`);
  }

  if (updates.length === 0) {
    const freshSql = `SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues WHERE id = $1`;
    const freshResult = await query<IssueRow>(freshSql, [id]);
    return freshResult.rows[0]!;
  }

  queryParams.push(id);
  const updateSql = `
    UPDATE issues 
    SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $${queryParams.length}
    RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
  `;
  const finalResult = await query<IssueRow>(updateSql, queryParams);
return finalResult.rows[0]!;
};

const deleteIssueFromDB = async (id: number): Promise<void> => {
  const checkSql = `SELECT id FROM issues WHERE id = $1`;
  const checkResult = await query<IssueRow>(checkSql, [id]);
  
  if (!checkResult.rows[0]) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  const deleteSql = `DELETE FROM issues WHERE id = $1`;
  await query(deleteSql, [id]);
};

export const issuesService = {
  createIssueInDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueInDB,
  deleteIssueFromDB,
};