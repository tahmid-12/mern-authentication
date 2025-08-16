import dotenv from "dotenv";
dotenv.config();
import cors from 'cors';
import express, { NextFunction, Request, Response }  from 'express';
import connectToDatabase from './config/db';
import { PORT,NODE_ENV } from './constants/env';
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import { OK } from "./constants/http";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "*",
    credentials: true
}));
app.use(cookieParser());

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    return res.status(OK).json({
        status: "Healthy"
    });
}
);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT} in ${NODE_ENV} mode`);
    });
  } catch (err) {
    console.error("❌ Error starting server:", err);
    process.exit(1);
  }
};

startServer();