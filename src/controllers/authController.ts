import catchErrors from "../utils/catchErrors";
import { Request, Response } from "express";
import { registerSchema } from "../schema/schema";
import { createAccount } from "../services/authService";
import { CREATED } from "../constants/http";
import { setAuthCookies } from "../utils/cookies";

export const registerHandler = catchErrors(async(req: Request,res: Response) => {
    const request = registerSchema.parse({
        ...req.body,
        userAgent: req.headers["user-agent"]
    });

    const { user, accessToken, refreshToken } = await createAccount(request);

    return setAuthCookies({ res, accessToken, refreshToken})
            .status(CREATED)
            .json(user);
})