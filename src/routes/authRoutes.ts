import { Router } from "express";
import { loginHandler, logoutHandler, refreshTokenHandler, registerHandler,verifyEmailHandler } from "../controllers/authController";

const authRoutes = Router();

authRoutes.post("/register", registerHandler);
authRoutes.post("/login", loginHandler);
authRoutes.get("/refresh-token", refreshTokenHandler);
authRoutes.get("/email/verify/:code", verifyEmailHandler);
authRoutes.post("/logout", logoutHandler);

export default authRoutes;
