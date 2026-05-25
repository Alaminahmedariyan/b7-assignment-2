import jwt from "jsonwebtoken";
import config from "../config/index.js";

export interface JwtPayload {
  id: number;
  name: string;
  role: string;
}

export const verifyToken = (token: string, type: "access" | "refresh"): JwtPayload => {
  const secret = type === "refresh" ? config.refresh_secret : config.jwt_secret;
  const decoded = jwt.verify(token, secret) as JwtPayload;
  return decoded;
};

export const signToken = (payload: JwtPayload): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(payload, config.jwt_secret, {
    expiresIn: "7d",
  });

  const refreshToken = jwt.sign(payload, config.refresh_secret, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};