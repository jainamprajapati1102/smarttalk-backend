import e from "express";
import signupRoute from "./routes/user.routes.js";
import messageRoute from "./routes/message.routes.js";
import cors from "cors";
import connectDB from "./db/db_con.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import { configDotenv } from "dotenv";
configDotenv();
connectDB();
const app = e();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(e.json());
// app.use(e.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(cors);
app.get("/", (req, res) => {
  res.send("Hello From jainam");
});
// app.use("/socket.io", socketRoute);
// app.get('/socket.io/?')z
app.use("/user", signupRoute);
app.use("/chat", messageRoute);
// app.use((err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     // Multer-specific errors
//     return res.status(400).json({ error: err.message });
//   } else if (err) {
//     // Any other errors (like invalid file type)
//     return res.status(400).json({ error: err.message });
//   }
//   next();
// });
export default app;
