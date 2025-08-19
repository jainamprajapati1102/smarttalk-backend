import jwt from "jsonwebtoken";
import { ChatEventEnum } from "../constants.js";
import userModel from "../models/user.model.js";
// Utility function to verify JWT token using your auth middleware logic
const verifyJWT = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRETE);
    const user = await userModel.findById(decoded?._id).select("-password");
    return user;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Event handler for joining a chat room
const mountJoinChatEvent = (socket) => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
    if (!chatId) {
      socket.emit("socketError", "Chat ID is required");
      return;
    }

    socket.join(chatId);
    console.log(`User ${socket.user?._id} joined chat ${chatId}`);

    socket.emit(ChatEventEnum.JOIN_CHAT_EVENT, {
      success: true,
      chatId,
      message: `Joined chat ${chatId}`,
    });
  });
};

// Event handler for typing indicators
const mountParticipantTypingEvent = (socket) => {
  socket.on("typing", (chatId) => {
    if (!chatId || !socket.user) return;

    socket.to(chatId).emit("typing", {
      chatId,
      userId: socket.user._id,
      username: socket.user.username,
    });
  });
};

// Event handler for stopped typing indicators
const mountParticipantStoppedTypingEvent = (socket) => {
  socket.on("stopTyping", (chatId) => {
    if (!chatId || !socket.user) return;

    socket.to(chatId).emit("stopTyping", {
      chatId,
      userId: socket.user._id,
      username: socket.user.username,
    });
  });
};

// Event handler for sending messages
const mountSendMessageEvent = (socket, io) => {
  console.log("0");
  socket.on("newMessage", (messageData) => {
    console.log("1", messageData);

    try {
      if (!messageData || !messageData.chat || !messageData.chat.users) {
        console.log("2");

        socket.emit("socketError", "Invalid message data");
        return;
      }

      const chat = messageData.chat;

      // Validate sender matches authenticated user
      if (String(messageData.sender_id) !== String(socket.user._id)) {
        console.log("3");
        socket.emit("socketError", "Unauthorized message sender");
        return;
      }
      console.log("4");

      // Send to all users in the chat except sender
      chat.users.forEach((user) => {
        console.log("all user id-->", user._id);

        if (String(user._id) === String(socket.user._id)) return;

        io.to(String(user._id)).emit("messageReceive", messageData);
      });

      // Send confirmation to sender
      socket.emit("messageSent", messageData);
    } catch (error) {
      socket.emit("socketError", error.message);
    }
  });
  console.log("0.1");
};

// Main socket initialization using your auth middleware logic
const initializeSocketIO = (io) => {
  io.on("connection", async (socket) => {
    try {
      // Extract token from headers (same as your auth middleware)
      const authHeader = socket.handshake.headers?.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer")) {
        socket.emit("socketError", "Bearer token required");
        socket.disconnect();
        return;
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        socket.emit("socketError", "Token not found");
        socket.disconnect();
        return;
      }

      // Verify user using your auth middleware logic
      const user = await verifyJWT(token);
      if (!user) {
        socket.emit("socketError", "Invalid authentication");
        socket.disconnect();
        return;
      }

      // Attach user to socket
      socket.user = user;

      // Join user's personal room
      socket.join(user._id.toString());

      // Send connected event
      socket.emit("connected", {
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
      });

      console.log(`User connected: ${user._id} (${socket.id})`);

      // Mount event handlers
      mountJoinChatEvent(socket);
      mountParticipantTypingEvent(socket);
      mountParticipantStoppedTypingEvent(socket);
      mountSendMessageEvent(socket, io);

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${user._id} (${socket.id})`);
        if (socket.user?._id) {
          socket.leave(socket.user._id.toString());
        }
      });
    } catch (error) {
      console.error("Socket connection error:", error.message);
      socket.emit("socketError", error.message);
      socket.disconnect();
    }
  });
};

// Utility function to emit events from HTTP routes
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
