import { PrismaClient } from "@prisma/client";
import { SocketUser } from "../../types/SocketUser";
import { AdminController } from "./admin.controller";
import { isDev } from "../utility";

const prisma = new PrismaClient();

export const MessageController = {
  storeMessage: async (data: any, user: SocketUser) => {
    const { message, forId } = data;
    const messageData: any = {
      message,
      forId: user.isAdmin ? forId : user.id,
      isAdminMessage: user.isAdmin,
    };
    let attachment;
    if (data.attachment) {
      const { url, fileName, mediaType } = data.attachment;
      attachment = await prisma.media.create({
        data: {
          mediaType: mediaType,
          fileName: fileName,
          url: url,
        },
      });
    }
    const createdMessage = await prisma.message.create({
      data: {
        ...messageData,
        mediaId: attachment?.id,
      },
    });
    if (isDev()) {
      console.log("Created Message ===> ", createdMessage);
    }
    return true;
  },
  markAsChatRead: async (forId: number) => {
    await AdminController.markAsChatRead(forId);
  },
};
