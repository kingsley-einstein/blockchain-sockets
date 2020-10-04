import { Router } from "express";
import walletRouter from "./wallet";
import transactionRouter from "./transaction";

const router = Router();

router.use("/wallet", walletRouter);
router.use("/transaction", transactionRouter);

export default router;
