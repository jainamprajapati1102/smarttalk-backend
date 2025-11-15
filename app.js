import e from "express";
import signupRoute from "./routes/user.routes.js";
import messageRoute from "./routes/message.routes.js";
import chatRoute from "./routes/chat.routes.js";
import cors from "cors";
import connectDB from "./db/db_con.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

connectDB();
const app = e();
if (process.env.NODE_ENV == "production") {
  app.use(
    cors({
      origin: "https://sanvad.xyz",
      credentials: true,
    })
  );
} else {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
}
app.use(e.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(e.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1/uploads", e.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => {
  res.send("Hello From jainam");
});
app.use("/api/v1/user", signupRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/chat", chatRoute);
export default app;
