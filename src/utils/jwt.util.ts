import jwt from "jsonwebtoken";
import config from "../config/index";

export interface JwtPayload {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}

export const verifyToken = (token: string, type: "access" | "refresh"): JwtPayload => {
  const secret = type === "refresh" ? (config.refresh_secret as string) : (config.jwt_secret as string);
  const decoded = jwt.verify(token, secret) as JwtPayload;
  return decoded;
};

export const signToken = (payload: JwtPayload): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(payload, config.jwt_secret as string, {
    expiresIn: (config.jwt_expires_in ? String(config.jwt_expires_in) : "7d") as any,
  });

  const refreshToken = jwt.sign(payload, config.refresh_secret as string, {
    expiresIn: (config.refresh_expires_in ? String(config.refresh_expires_in) : "30d") as any,
  });

  return { accessToken, refreshToken };
};