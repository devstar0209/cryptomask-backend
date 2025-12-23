import { Router } from "express";
import { UserController } from "../controller/user.controller";
import { checkAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.post("/create", UserController.createUser);
router.post("/add-account", checkAuth, UserController.addAccount);
router.post("/backed-up", checkAuth, UserController.backedUp);
router.post("/login", UserController.loginUser);
router.post("/upload", checkAuth, upload.single("file"), UserController.uploadAttachment);
router.get("/fee", UserController.getFeePercentage);
router.get("/settings", UserController.settings);
router.get("/tokens/:address/:chainId", UserController.tokens);
router.get("/transactions/:address/:tokenAddress/:chainId", UserController.tokenTransaction);
router.get("/wallet-transactions/:address/:tokenAddress/:chainId", UserController.walletTransaction);
router.delete("/:address", UserController.deleteUser);

export default router; 