"use server";

import prisma from "@/lib/prisma";
import { setInLocalStorage } from "@/lib/setinlocal";
import type { response } from "@/types/response";
import type {  saveMessageType } from "@/types/upload-data-item";


const baseUrl = process.env.VECTOR_FASTAPI_BASE_URL;

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

    // 3) Ensure we have a chat id (create if missing)
    const chatId =
      data.chatId ??
      (
        await tx.chat.create({
          data: { historyId },
          select: { id: true },
        })
      ).id;

    // 4) Save message
    const message = await tx.message.create({
      data: {
        role: data.role,
        content: data.query, // or data.content if that's your field
        chatId,
      },
    });
    setInLocalStorage("chatId", chatId);

    return {
      message: "Message saved successfully",
      data: { message, chatId },
      success: true,
    };
  });
}



