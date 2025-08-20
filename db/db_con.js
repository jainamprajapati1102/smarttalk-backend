import mongoose from "mongoose";
import dotenv from "dotenv";

// Load env based on NODE_ENV
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production" });
} else {
  dotenv.config(); // default: .env
}

const connectDB = async () => {
  try {
    console.log("Connecting to:", process.env.MONGODB_URI); // debug

    await mongoose.connect(process.env.MONGODB_URI);

    if (process.env.NODE_ENV === "production") {
      console.log("✅ MongoDB Atlas connected!!");
    } else {
      console.log("✅ MongoDB Compass connected!!");
    }
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    console.error(error.stack); // show full trace
    process.exit(1);
  }
};

export default connectDB;
