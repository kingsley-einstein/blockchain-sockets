import { Router } from "express";
import { WalletController } from "../controllers";

const router = Router();

router.post("/create", WalletController.create);
router.get("/get/:address", WalletController.getWallet);

export default router;
