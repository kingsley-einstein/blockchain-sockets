import { Router } from "express";
import { TransactionController } from "../controllers";

const router = Router();

router.post("/create", TransactionController.create);

export default router;
