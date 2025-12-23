import { Router } from "express";
import { SignupController } from "../controller/signup.controller";

const router = Router();
router.post("/simple-signup", SignupController.simpleRegister);
router.post("/signup", SignupController.register);
router.post("/resendOtp", SignupController.resendOtp);
router.post("/verifyOtp", SignupController.verifyOtp);

export default router; 
