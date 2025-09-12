import { Router } from "express";
import { loginHandler, logoutHandler, refreshTokenHandler, registerHandler } from "../controllers/authController";

const authRoutes = Router();

authRoutes.post("/register", registerHandler);
authRoutes.post("/login", loginHandler);
authRoutes.get("/refresh-token", refreshTokenHandler);
authRoutes.post("/logout", logoutHandler);

export default authRoutes;
