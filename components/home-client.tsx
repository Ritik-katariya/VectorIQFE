"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/sidebar";
import ChatArea from "@/components/chat-area";
import VoiceVisualizer from "@/components/voice-visualizer";
import useDataItemStore from "@/store/data-itmes";
import { getChats, getChatMessages } from "@/server-action/chat.server";
import { useAuth } from "@clerk/nextjs";
import { getFromLocalStorage, setInLocalStorage } from "@/lib/setinlocal";

type InitialItem = {
  id: string;
  name: string;
  dataType: string;
  ChunksIds: string[];
};

export default function HomeClient({
  initialItems,
}: {
  initialItems: InitialItem[];
}) {
  const { userId } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Create a map of initialItems for quick lookup of ChunksIds
  const initialItemsMap = useMemo(
    () => new Map(initialItems.map((item) => [item.id, item.ChunksIds])),
    [initialItems]
  );
  const [files, setFiles] = useState<
    Array<{ id: string; name: string; type: string; selected: boolean }>
  >(() =>
    initialItems.map((i) => ({
      id: i.id,
      name: i.name,
      type: i.dataType,
      selected: true,
    }))
  );
  const [chatHistory, setChatHistory] = useState<Array<{ id: string }>>([]);
  const [messages, setMessages] = useState<
    Array<{ id: string; role: "user" | "ai"; content: string }>
  >([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const { setDataItems } = useDataItemStore();

  // Sync selected files to Zustand store whenever files change
  useEffect(() => {
    const selected = files
      .filter((f) => f.selected)
      .map((f) => ({
        id: f.id,
        name: f.name,
        ChunksIds: initialItemsMap.get(f.id) || [],
      }));
    setDataItems(selected);
  }, [files, setDataItems, initialItemsMap]);

  const handleToggleFile = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, selected: !f.selected } : f))
    );
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSendMessage = (
    content: string,
    role: "user" | "ai" = "user",
    messageId?: string
  ) => {
    if (role === "user") {
      // Add new user message
      const userMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: "user" as const,
        content,
      };
      setMessages((prev) => [...prev, userMessage]);
    } else if (role === "ai") {
      if (messageId) {
        // Update or create AI message (streaming)
        setMessages((prev) => {
          const existingIndex = prev.findIndex((msg) => msg.id === messageId);
          if (existingIndex >= 0) {
            // Update existing message
            return prev.map((msg) =>
              msg.id === messageId ? { ...msg, content } : msg
            );
          } else {
            // Create new message with the provided ID
            const aiMessage = {
              id: messageId,
              role: "ai" as const,
              content,
            };
            return [...prev, aiMessage];
          }
        });
      } else {
        // Add new AI message
        const aiMessage = {
          id: Math.random().toString(36).substr(2, 9),
          role: "ai" as const,
          content,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    }
  };

  // Check localStorage for chatId on mount and load messages
  useEffect(() => {
    if (!userId) return;

    const loadChatMessages = async (chatId: string) => {
      try {
        const res = await getChatMessages(chatId);
        if (res.success && Array.isArray(res.data)) {
          // Convert database messages to component format
          const dbMessages = res.data as Array<{
            id: string;
            role: "USER" | "ASSISTANT" | "SYSTEM";
            content: string;
          }>;

          const formattedMessages = dbMessages
            .filter((msg) => msg.role !== "SYSTEM") // Filter out system messages
            .map((msg) => ({
              id: msg.id,
              role: msg.role === "USER" ? ("user" as const) : ("ai" as const),
              content: msg.content,
            }));

          setMessages(formattedMessages);
          setCurrentChatId(chatId);
          setInLocalStorage("chatId", chatId);
        }
      } catch (error) {
        console.error("Failed to load chat messages:", error);
      }
    };

    const storedChatId = getFromLocalStorage<string>("chatId");
    if (storedChatId) {
      loadChatMessages(storedChatId);
    }
  }, [userId]);

  // Fetch chat history on mount
  useEffect(() => {
    async function fetchChatHistory() {
      if (!userId) return;

      const res = await getChats(userId);
      if (res.success && Array.isArray(res.data)) {
        // getChats returns an array of chat IDs (strings)
        const chatIds = res.data as string[];
        // Convert to array of objects with id property
        const chats = chatIds.map((id) => ({ id }));
        setChatHistory(chats);
      }
      console.log("Fetching chat history for userId:", userId, res);
    }

    fetchChatHistory();
  }, [userId]);

  // Handle chat selection from sidebar
  const handleChatSelect = async (chatId: string) => {
    try {
      const res = await getChatMessages(chatId);
      if (res.success && Array.isArray(res.data)) {
        // Convert database messages to component format
        const dbMessages = res.data as Array<{
          id: string;
          role: "USER" | "ASSISTANT" | "SYSTEM";
          content: string;
        }>;

        const formattedMessages = dbMessages
          .filter((msg) => msg.role !== "SYSTEM") // Filter out system messages
          .map((msg) => ({
            id: msg.id,
            role: msg.role === "USER" ? ("user" as const) : ("ai" as const),
            content: msg.content,
          }));

        setMessages(formattedMessages);
        setCurrentChatId(chatId);
        setInLocalStorage("chatId", chatId);
      }
    } catch (error) {
      console.error("Failed to load chat messages:", error);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        files={files}
        onFileToggle={handleToggleFile}
        onFileDelete={handleDeleteFile}
        chatHistory={chatHistory}
        onChatSelect={handleChatSelect}
        currentChatId={currentChatId}
      />

      <div className="flex-1 flex flex-col relative">
        {isListening && (
          <VoiceVisualizer onClose={() => setIsListening(false)} />
        )}

        <ChatArea
          messages={messages}
          onSendMessage={handleSendMessage}
          onMicClick={() => setIsListening(!isListening)}
          isListening={isListening}
          onChatIdChange={(chatId) => {
            setCurrentChatId(chatId);
            // Refresh chat history when a new chat is created
            if (userId) {
              getChats(userId).then((res) => {
                if (res.success && Array.isArray(res.data)) {
                  const chatIds = res.data as string[];
                  const chats = chatIds.map((id) => ({ id }));
                  setChatHistory(chats);
                }
              });
            }
          }}
        />
      </div>
    </div>
  );
}
