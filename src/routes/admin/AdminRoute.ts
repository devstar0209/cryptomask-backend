import { Router } from "express";
import { loginAdminValidationMiddleware } from "../../validator/admin.validator";
import { AdminController } from "../../controller/admin.controller";
import { checkAuth } from "../../middlewares/auth.middleware";
import { UserController } from "../../controller/user.controller";
import { isDev, upload } from "../../utility";

const router = Router();

if (isDev()) {
  router.post("/", AdminController.createUser);
}

router.post(
  "/login",
  loginAdminValidationMiddleware,
  AdminController.loginAdmin
);

router.post(
  "/upload",
  checkAuth,
  upload.single("file"),
  UserController.uploadAttachment
);

router.get("/settings", checkAuth, AdminController.updateSettings);
router.patch("/settings", checkAuth, AdminController.updateSettings);

router.get("/users", checkAuth, AdminController.users);
router.get("/conversations", checkAuth, AdminController.getConversations);
router.delete("/conversations", checkAuth, AdminController.deleteConversation);
router.get(
  "/users/deactivate/:userId",
  checkAuth,
  AdminController.deactivateUser
);
router.get("/users/block/:userId", checkAuth, AdminController.blockUser);
router.get("/users/unblock/:userId", checkAuth, AdminController.unblockUser);

router.get("/users/activate/:userId", checkAuth, AdminController.activateUser);

router.get("/tokens/:address/:chainId", checkAuth, UserController.tokens);

export { router as AdminRouter };
