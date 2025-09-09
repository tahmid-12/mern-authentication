import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { ErrorRequestHandler } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";

const handleZodError = (res: Response, error: z.ZodError) => {
    const errors = error.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message
    }));
    return res.status(BAD_REQUEST).json({
        message: error.message,
        errors
    });
}

const errorHandler: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof z.ZodError){
        return handleZodError(res, err);
    }

    return res.status(INTERNAL_SERVER_ERROR).json({
        status: "Internal Server Error",   
    })
}

export default errorHandler;