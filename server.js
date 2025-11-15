import { configDotenv } from "dotenv";
if (process.env.NODE_ENV === "production") {
  configDotenv({ path: ".env.production" });
} else {
  configDotenv();
}
import app from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initializeSocketIO } from "./socket/index.js";

const PORT = process.env.PORT;
const server = createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: [
      process.env.NODE_ENV === "production"
        ? "http://51.21.161.74"
        : "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);
initializeSocketIO(io);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on PORT ${PORT}`);
});
