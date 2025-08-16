import mongoose from "mongoose";
import { MONGO_URI } from "../constants/env";

const connectToDatabase = async () => {
    console.log("Connecting to MongoDB...", MONGO_URI);
    try {
        await mongoose.connect(MONGO_URI)
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.log("Error connecting to the database:", error);
        process.exit(1);
    }
}

export default connectToDatabase;