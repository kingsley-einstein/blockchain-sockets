import { Router } from "express";
import walletRouter from "./wallet";
import transactionRouter from "./transaction";
import chainRouter from "./blockchain";

const router = Router();

router.use("/wallet", walletRouter);
router.use("/transaction", transactionRouter);
router.use("/chain", chainRouter);

export default router;
