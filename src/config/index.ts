import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  database_url: (process.env.DATABASE_URL || process.env.database_url) as string,
  port: process.env["PORT"] || 5000,
  node_env: process.env["NODE_ENV"] || "development",
  jwt_secret: process.env.JWT_SECRET as string,
  refresh_secret: process.env.JWT_REFRESH_SECRET as string,
  jwt_expires_in: process.env["JWT_EXPIRES_IN"] || "7d",
  refresh_expires_in: process.env["JWT_REFRESH_EXPIRES_IN"] || "30d",
};

export default config;
