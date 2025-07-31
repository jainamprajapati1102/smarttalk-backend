import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    if (process.env.NODE_ENV == "production") {
      console.log("MongoDB Atlas connected!!");
    } else {
      console.log("connect mongo compass");
    }
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error.message);
    process.exit(1);
  }
};

export default connectDB;
