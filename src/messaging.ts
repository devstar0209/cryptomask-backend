import { Socket } from "socket.io";
import { io } from "..";
import { MessageController } from "./controller/message.controller";
import { AdminController } from "./controller/admin.controller";
import { verify } from "jsonwebtoken";
import { SocketUser } from "../types/SocketUser";
import { isDev } from "./utility";

const adminSocketIds: string[] = [];
const users: Record<string, string> = {};

type AppSocket = Socket & { user: SocketUser };

export const initMessaging = () => {
  io.use((socket: Socket, next) => {
    const appSocket = socket as AppSocket;
    const token = socket.handshake.headers["authorization"] as string;
    try {
      const data = verify(token, process.env.SECRET as any);
      if (typeof data === "object") {
        appSocket.user = data as any;
        appSocket.user.isAdmin = Boolean(!data.address);
      }
    } catch (err) {
      return next(new Error("NOT AUTHORIZED"));
    }
    next();
  });

  // On client connected
  io.on("connection", (socket: Socket) => {
    const appSocket = socket as AppSocket;

    appSocket.on("private_message", async (data) => {
      //Saving message in the database
      await MessageController.storeMessage(data, appSocket.user);

      // Sending message to admin - also emit for sender to loading messages
      io.to(adminSocketIds).emit("private_message", {
        from: appSocket.id,
        message: data.message,
      });

      // Sending message to the user - also emit for sender to loading messages
      io.to(users[data.forId]).emit("private_message", {
        from: appSocket.id,
        message: data.message,
      });
    });

    if (appSocket.user.isAdmin) {
      // Update socket id in the admin socket id array
      appSocket.on("update_admin", () => {
        adminSocketIds.push(appSocket.id);
      });

      // Get conversations with most recent message from all users
      appSocket.on("admin_get_conversations", async () => {
        const conversations =
          await AdminController.getConversationsWithoutRequest();
        io.to(adminSocketIds).emit("admin_get_conversations", conversations);
      });

      // Get messages for particular userId
      appSocket.on("admin_get_chat", async (forId: number) => {
        const messages = await AdminController.getChatWithoutRequest(forId);
        io.to(adminSocketIds).emit("admin_get_chat", messages);
      });

      // Mark messages as ready for userId
      appSocket.on("admin_mark_chat_read", async (forId: number) => {
        await AdminController.markAsChatRead(forId);
        io.to(adminSocketIds).emit("admin_mark_chat_read");
      });

      // Disconnect admin
      appSocket.on("disconnect", () => {
        delete adminSocketIds[appSocket.user.id];
        if (isDev()) {
          console.log(`User disconnected: ${appSocket.id}`);
        }
      });
    } else {
      // Update socket id in the user socket id array
      appSocket.on("update_user", () => {
        users[appSocket.user.id] = appSocket.id;
        if (isDev()) {
          console.log("UPDATING_USER ====> ", users);
        }
      });

      // Get messages for connected user
      appSocket.on("user_get_chat", async () => {
        const messages = await AdminController.getChatWithoutRequest(
          appSocket.user.id
        );
        io.to(users[appSocket.user.id]).emit("user_get_chat", messages);
      });

      // Disconnect user
      appSocket.on("disconnect", () => {
        delete users[appSocket.user.id];
        if (isDev()) {
          console.log(`User disconnected: ${appSocket.id}`);
        }
      });
    }
  });
};
