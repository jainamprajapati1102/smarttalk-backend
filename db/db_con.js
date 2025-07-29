import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Atlas connected!!");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error.message);
    process.exit(1);
  }
};

export default connectDB;
