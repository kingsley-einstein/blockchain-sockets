import { Router } from "express";
import { TransactionController } from "../controllers";

const router = Router();

router.post("/create", TransactionController.create);
router.get("/all_inputs/:address", TransactionController.getAllTransactionsByInput);
router.get("/all_outputs/:address", TransactionController.getAllTransactionsByOutput);

export default router;
