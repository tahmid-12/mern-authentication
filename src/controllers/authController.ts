import catchErrors from "../utils/catchErrors";
import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../schema/schema";
import { createAccount, loginUser, logoutUser, refreshAccessToken } from "../services/authService";
import { CREATED, OK } from "../constants/http";
import { setAuthCookies } from "../utils/cookies";
import { ONE_DAY_MS } from "../utils/date";

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

export const logoutHandler = catchErrors(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  await logoutUser(refreshToken);

  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
     path: "/auth/refresh-token",
  });

  return res.status(OK).json({ message: "Logout successful" });
});

export const refreshTokenHandler = catchErrors(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;

    console.log("Refresh token:", req);

    const tokens = await refreshAccessToken(refreshToken);
    if (!tokens) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const { accessToken } = tokens;

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: ONE_DAY_MS()
    });

    return res.status(200).json({ message: "Access token refreshed" });
  }
);