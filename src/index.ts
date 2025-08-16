import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response }  from 'express';
import connectToDatabase from './config/db';
import { PORT,NODE_ENV } from './constants/env';

const app = express();

app.get("/", (req: Request, res: Response) => {
    return res.status(200).json({
        status: "Healthy"
    });
});

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