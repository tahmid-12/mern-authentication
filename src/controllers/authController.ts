import catchErrors from "../utils/catchErrors";
import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../schema/schema";
import { createAccount, loginUser } from "../services/authService";
import { CREATED, OK } from "../constants/http";
import { setAuthCookies } from "../utils/cookies";

export const registerHandler = catchErrors(
  async (req: Request, res: Response) => {
    const request = registerSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });

    const { user, accessToken, refreshToken } = await createAccount(request);

    return setAuthCookies({ res, accessToken, refreshToken })
      .status(CREATED)
      .json(user);
  }
);

export const loginHandler = catchErrors(async (req: Request, res: Response) => {
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { accessToken, refreshToken } = await loginUser(request);

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json({ message: "Login successful" });
});
