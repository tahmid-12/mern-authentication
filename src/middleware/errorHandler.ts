import { Request, Response, NextFunction } from "express";
import { ErrorRequestHandler } from "express";
import { INTERNAL_SERVER_ERROR } from "../constants/http";

const errorHandler: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
    return res.status(INTERNAL_SERVER_ERROR).json({
        status: "Internal Server Error",   
    })
}

export default errorHandler;