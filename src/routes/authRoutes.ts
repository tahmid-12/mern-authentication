import { Router } from "express";
import { loginHandler, registerHandler } from "../controllers/authController";

const authRoutes = Router();

authRoutes.post("/register", registerHandler);
authRoutes.post("/login", loginHandler);

export default authRoutes;
