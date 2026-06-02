import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";

import globalErrorHandler from "./middlewares/globalErrorHandler";
import globalRoutes from "./routes/index";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: " DevPulse API is running",
    version: "1.0.0",
  });
});

app.use("/api", globalRoutes);

app.use((req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found.`,
    errors: "The requested endpoint does not exist.",
  });
});

app.use(globalErrorHandler);

export default app;