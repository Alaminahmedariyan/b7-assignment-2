export interface SignupBody {
  name: string;
  email: string;
  password: string;
  role?: "contributor" | "maintainer";
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
  created_at: string;
  updated_at: string;
}

export interface SafeUser {
  id: number;
  name: string;
  email: string;
  role: "contributor" | "maintainer";
  created_at: string;
  updated_at: string;
}

export interface TokenPayload {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}