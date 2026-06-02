import { Router } from "express";
import { issuesController } from "./issues.controller";
import authGuard from "../../middlewares/authGuard";


const router = Router();

router.post("/", authGuard("contributor", "maintainer"), issuesController.createIssue);
router.get("/", issuesController.getAllIssues);
router.get("/:id", issuesController.getSingleIssue);
router.patch("/:id", authGuard("contributor", "maintainer"), issuesController.updateIssue);
router.delete("/:id", authGuard("maintainer"), issuesController.deleteIssue);

export default router;