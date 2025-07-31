import app from "./app.js";
import { createServer } from "http";
import { configDotenv } from "dotenv";
configDotenv();
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production" });
}
const PORT = process.env.PORT;
const server = createServer(app);
server.listen(PORT, () => {
  console.log(`server listing PORT No. ${PORT}`);
});
