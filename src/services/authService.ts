import VerificationCodeType from "../constants/verificationCodeTypes";
import userModel from "../models/userModel";
import VerificationCodeModel from "../models/verificationCodeModel";
import { oneYearFromNow } from "../utils/date";
import SessionModel from "../models/sessionModel";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import jwt from "jsonwebtoken";

export type CreateAccountParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const createAccount = async (data: CreateAccountParams) => {
  const existingUser = await userModel.exists({ email: data.email });
  if (existingUser) throw new Error("Email already in use");

  const user = await userModel.create({
    email: data.email,
    password: data.password,
  });

  const verificationCode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  const session = await SessionModel.create({
    userId: user._id,
    userAgent: data.userAgent,
  });

  const refreshToken = jwt.sign(
    { sessionId: session._id },
    JWT_REFRESH_SECRET,
    {
      audience: ["user"],
      expiresIn: "30d",
    }
  );

  const accessToken = jwt.sign(
    {
      userId: user._id,
      sessionId: session._id,
    },
    JWT_SECRET,
    {
      audience: ["user"],
      expiresIn: "15m",
    }
  );

  return {
    user,
    accessToken,
    refreshToken,
  };
  //1:12:00
};
