"use server";

import prisma from "@/lib/prisma";
import type { response } from "@/types/response";
import type { saveMessageType } from "@/types/upload-data-item";

export async function saveMessage(data: saveMessageType): Promise<response> {
  return prisma.$transaction(async (tx) => {
    // 1) Find user (by Clerk id)
    const user = await tx.user.findUnique({
      where: { clerkId: data.userId },
      include: { history: true },
    });
    if (!user) {
      throw new Error("User not found");
    }

    // 2) Ensure history exists (and capture its id)
    const historyId =
      user.history?.id ??
      (await tx.history.create({ data: { userId: user.id } })).id;

    // 3) Ensure we have a chat id (create if missing or if provided chatId doesn't exist)
    let chatId = data.chatId;

    if (chatId) {
      // Verify the chat exists and belongs to this history
      const existingChat = await tx.chat.findUnique({
        where: { id: chatId },
        select: { id: true, historyId: true },
      });

      // If chat doesn't exist or doesn't belong to this history, create a new one
      if (!existingChat || existingChat.historyId !== historyId) {
        chatId = (
          await tx.chat.create({
            data: { historyId },
            select: { id: true },
          })
        ).id;
      }
    } else {
      // No chatId provided, create a new chat
      chatId = (
        await tx.chat.create({
          data: { historyId },
          select: { id: true },
        })
      ).id;
    }

    // 4) Save message
    const message = await tx.message.create({
      data: {
        role: data.role,
        content: data.query, // or data.content if that's your field
        chatId,
      },
    });

    return {
      message: "Message saved successfully",
      data: { message, chatId },
      success: true,
    };
  });
}

export async function getChats(
  userId: string | undefined | null
): Promise<response> {
  // Check if userId is undefined, null, or empty
  if (!userId || userId.length === 0) {
    return {
      message: "No chats found",
      data: [],
      success: true,
    };
  }

  // Read-only operation - no transaction needed
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      history: {
        include: {
          chats: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!user || !user.history) {
    return {
      message: "No chats found",
      data: [],
      success: true,
    };
  }

  const chatIds = user.history.chats.map((chat) => chat.id);
  return {
    message: "Chats retrieved successfully",
    data: chatIds,
    success: true,
  };
}

export async function getChatMessages(chatId: string): Promise<response> {
  if (!chatId || chatId.length === 0) {
    return {
      message: "No messages found",
      data: [],
      success: true,
    };
  }

  // Read-only operation - no transaction needed
  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
  });

  return {
    message:
      messages.length > 0
        ? "Messages retrieved successfully"
        : "No messages found",
    data: messages,
    success: true,
  };
}
