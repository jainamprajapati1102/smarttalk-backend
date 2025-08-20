// import app from "./app.js";
// import { createServer } from "http";
// import { configDotenv } from "dotenv";
// import { Server } from "socket.io";

// configDotenv();
// if (process.env.NODE_ENV === "production") {
//   dotenv.config({ path: ".env.production" });
// }
// const PORT = process.env.PORT;
// const server = createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*", // Replace with your React app URL in production
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   // Join personal room for private chat
//   socket.on("join-room", ({ userId }) => {
//     socket.join(userId);
//   });

//   // Listen for sent messages
//   socket.on("send-message", (data) => {
//     const { receiverId, messageData } = data;
//     console.log("msg send");

//     // Send message to the receiver in their room
//     io.to(receiverId).emit("receive-message", messageData);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });
// server.listen(PORT, () => {
//   console.log(`server listing PORT No. ${PORT}`);
// });

import app from "./app.js";
import { createServer } from "http";
import { configDotenv } from "dotenv";
import { Server } from "socket.io";
import { message_create, msg_seen } from "./controller/messageController.js";
import { initializeSocketIO } from "./socket/index.js";

if (process.env.NODE_ENV === "production") {
  configDotenv({ path: ".env.production" });
} else {
  configDotenv();
}
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
