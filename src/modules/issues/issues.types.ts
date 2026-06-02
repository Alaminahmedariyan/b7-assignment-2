export interface CreateIssueBody {
  title: string;
  description: string;
  type: "bug" | "feature_request";
}

export interface UpdateIssueBody {
  title?: string;
  description?: string;
  type?: "bug" | "feature_request";
}

export interface IssueRow {
  id: number;
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status: "open" | "in_progress" | "resolved";
  reporter_id: number;
  created_at: string;
  updated_at: string;
}

export interface IssueReporter {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}

export interface IssueFormattedResponse {
  id: number;
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status: "open" | "in_progress" | "resolved";
  reporter: IssueReporter;
  created_at: string;
  updated_at: string;
}