import mongoose from "mongoose";
// mongoose.set('debug',true);
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/SmartTalks");
    console.log("Mongodb connected!!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit with failure
  }
};
// connectDB();
export default connectDB;
