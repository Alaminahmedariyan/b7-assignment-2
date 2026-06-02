import { Router } from "express";

import { issueRoutes } from "../modules/issues/issues.route";
import { authRoutes } from "../modules/auth/auth.routes";


const globalRoutes = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/issues",
    route: issueRoutes,
  }
];

moduleRoutes.forEach((route) => globalRoutes.use(route.path, route.route));

export default globalRoutes;