// socket/index.js
import jwt from "jsonwebtoken";
import { ChatEventEnum } from "../constants.js";
import userModel from "../models/user.model.js";

// ---------------------------
// JWT Verification Utility
// ---------------------------
const verifyJWT = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRETE);
    return await userModel.findById(decoded?._id).select("-password");
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// ---------------------------
// Event Handlers
// ---------------------------

// Join Chat
const handleJoinChat = (socket) => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
    if (!chatId) {
      return socket.emit("socketError", "Chat ID is required");
    }

    socket.join(chatId);
    console.log("so hand ==>", socket.handshake);

    console.log(`User ${socket.user?._id} joined chat ${chatId}`);

    socket.emit(ChatEventEnum.JOIN_CHAT_EVENT, {
      success: true,
      chatId,
      message: `Joined chat ${chatId}`,
    });
  });
};

// Typing
const handleTyping = (socket) => {
  socket.on("typing", ({ chatId }) => {
    if (!chatId || !socket.user) return;
    console.log(`user ${chatId} is typiing`);

    socket.to(chatId).emit(ChatEventEnum.TYPING_EVENT, {
      chatId,
      userId: socket.user._id,
    });
  });
};

// Stop Typing
const handleStopTyping = (socket) => {
  socket.on(ChatEventEnum.STOP_TYPING_EVENT, ({ chatId }) => {
    if (!chatId || !socket.user) return;
    socket.to(chatId).emit("stopTyping", {
      chatId,
      userId: socket.user._id,
    });
  });
};

// Send Message
const handleSendMessage = (socket, io) => {
  socket.on("newMessage", (messageData) => {
    try {
      if (!messageData || !messageData.chat?.users) {
        return socket.emit("socketError", "Invalid message data");
      }

      const { chat, sender_id } = messageData;

      // Validate sender
      if (String(sender_id) !== String(socket.user._id)) {
        return socket.emit("socketError", "Unauthorized message sender");
      }

      // Emit message to all chat users except sender
      chat.users.forEach((user) => {
        if (String(user._id) !== String(socket.user._id)) {
          io.to(String(user._id)).emit("messageReceive", messageData);
        }
      });

      // Confirmation to sender
      socket.emit("messageSent", messageData);
    } catch (error) {
      socket.emit("socketError", error.message);
    }
  });
};

// ---------------------------
// Socket Initialization
// ---------------------------
const initializeSocketIO = (io) => {
  io.on("connection", async (socket) => {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        socket.emit("socketError", "Token not found");
        return socket.disconnect();
      }
      // Verify User
      const user = await verifyJWT(token);
      if (!user) {
        socket.emit("socketError", "Invalid authentication");
        return socket.disconnect();
      }

      socket.user = user;

      // Join personal room
      socket.join(user._id.toString());

      // Notify client of connection
      socket.emit(ChatEventEnum.CONNECTED_EVENT, {
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
      });

      // Notify others user is online
      socket.broadcast.emit("user_online", { userId: user._id });

      console.log(`User connected: ${user._id} (${socket.id})`);

      // Register Event Handlers
      handleJoinChat(socket);
      handleTyping(socket);
      handleStopTyping(socket);
      handleSendMessage(socket, io);

      // Handle disconnect
      socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
        console.log(`User disconnected: ${user._id} (${socket.id})`);
        socket.broadcast.emit("user_offline", { userId: user._id });
        socket.leave(user._id.toString());
      });
    } catch (error) {
      console.error("Socket connection error:", error.message);
      socket.emit("socketError", error.message);
      socket.disconnect();
    }
  });
};

// ---------------------------
// Utility: Emit from Routes
// ---------------------------
const emitSocketEvent = (req, roomId, event, payload) => {
  try {
    const io = req.app.get("io");
    if (!io) {
      console.error("Socket.io instance not available");
      return false;
    }

    io.in(roomId).emit(event, payload);
    return true;
  } catch (error) {
    console.error("Error emitting socket event:", error);
    return false;
  }
};

export { initializeSocketIO, emitSocketEvent };
