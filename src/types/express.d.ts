declare global {
  namespace Express {
    interface Request {
      user?: { id: number; name: string; role: "contributor" | "maintainer" };
      cookies?: Record<string, string>;
    }
  }
}

export {};
