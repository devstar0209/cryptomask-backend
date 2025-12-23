import { Router } from "express";
import { createUserValidationMiddleware } from "../../validator/user.validator";
import { UserController } from "../../controller/user.controller";
import { checkAuth } from "../../middlewares/auth.middleware";
import { upload } from "../../utility";

const router = Router();

if (process.env.NODE_ENV === "development") {
  router.delete("/:address", UserController.deleteUser);
}

router.post(
  "/register",
  createUserValidationMiddleware,
  UserController.createUser
);

router.post(
  "/addAccount",
  createUserValidationMiddleware,
  checkAuth,
  UserController.addAccount
);

router.post("/login", createUserValidationMiddleware, UserController.loginUser);

router.get("/settings", UserController.settings);

router.get("/fee", UserController.getFeePercentage);

router.put("/backedup", checkAuth, UserController.backedUp);

router.get(
  "/wallet/transactions/:address/:chainId",
  checkAuth,
  UserController.walletTransaction
);

router.get("/tokens/:address/:chainId", checkAuth, UserController.tokens);

router.get(
  "/tokens/transfers/:address/:tokenAddress/:chainId",
  checkAuth,
  UserController.tokenTransaction
);

router.post(
  "/upload",
  checkAuth,
  upload.single("file"),
  UserController.uploadAttachment
);

export { router as UserRouter };
