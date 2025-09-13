import VerificationCodeType from "../constants/verificationCodeTypes";
import userModel from "../models/userModel";
import VerificationCodeModel from "../models/verificationCodeModel";
import { oneYearFromNow } from "../utils/date";
import SessionModel from "../models/sessionModel";
import { APP_ORIGIN, JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import jwt from "jsonwebtoken";
import appAssert from "../utils/appAssert";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} from "../constants/http";
import { sendMail } from "../utils/sendMail";
import { getVerifyEmailTemplate } from "../utils/emailTemplates";

export type CreateAccountParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const createAccount = async (data: CreateAccountParams) => {
  const existingUser = await userModel.exists({ email: data.email });

  appAssert(!existingUser, CONFLICT, "Email already in use");

  const user = await userModel.create({
    email: data.email,
    password: data.password,
  });

  const verificationCode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  const url = `${APP_ORIGIN}/verify-email?code=${verificationCode._id}`;

  const { error } = await sendMail({
    to : user.email,
    ...getVerifyEmailTemplate(url)
  });

  if(error){
    console.log("Error sending verification email:", error);
  }

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
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

export type LogInParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const loginUser = async (data: LogInParams) => {
  const user = await userModel.findOne({ email: data.email });
  appAssert(user, UNAUTHORIZED, "Invalid email or password");

  const isValid = await user.comparePassword(data.password);
  appAssert(isValid, UNAUTHORIZED, "Invalid email or password");

  const userId = user._id;

  const session = await SessionModel.create({
    userId,
    userAgent: data.userAgent,
  });

  const sessionInfo = {
    sessionId: session._id,
  };

  const refreshToken = jwt.sign(sessionInfo, JWT_REFRESH_SECRET, {
    audience: ["user"],
    expiresIn: "30d",
  });

  const accessToken = jwt.sign(
    {
      ...sessionInfo,
      userId: user._id,
    },
    JWT_SECRET,
    {
      audience: ["user"],
      expiresIn: "15m",
    }
  );

  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

export const logoutUser = async (refreshToken?: string) => {
  if (!refreshToken) return;

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      sessionId: string;
    };

    if (decoded?.sessionId) {
      await SessionModel.findByIdAndDelete(decoded.sessionId);
    }
  } catch {
    return;
  }
};

export const refreshAccessToken = async (refreshToken?: string) => {
  if (!refreshToken) return null;

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      sessionId: string;
    };

    if (!decoded?.sessionId) return null;

    const session = await SessionModel.findById(decoded.sessionId);
    if (!session) return null;

    const user = await userModel.findById(session.userId);
    if (!user) return null;

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

    return { accessToken, refreshToken };
  } catch {
    return null;
  }
};

export const verifyEmail = async (verificationCode: string) => {
  const validCode = await VerificationCodeModel.findOne({
    _id: verificationCode,
    type: VerificationCodeType.EmailVerification,
    expiresAt: { $gt: new Date() },
  });

  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  const updatedUser = await userModel.findByIdAndUpdate(
    validCode.userId,
    {
      verified: true,
    },
    { new: true }
  );

  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to Verify Email");

  await validCode.deleteOne();

  return {
    user: updatedUser.omitPassword(),
  };
};
