"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/sidebar";
import ChatArea from "@/components/chat-area";
import VoiceVisualizer from "@/components/voice-visualizer";
import useDataItemStore from "@/store/data-itmes";

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
  const [chatHistory, setChatHistory] = useState<
    Array<{ id: string; name: string; timestamp: string }>
  >([]);
  const [messages, setMessages] = useState<
    Array<{ id: string; role: "user" | "ai"; content: string }>
  >([]);
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

  const handleFileUpload = (newFiles: File[]) => {
    const uploadedFiles = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      selected: true,
    }));
    setFiles((prev) => [...prev, ...uploadedFiles]);
  };

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

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        files={files}
        onFileToggle={handleToggleFile}
        onFileDelete={handleDeleteFile}
        chatHistory={chatHistory}
      />

      <div className="flex-1 flex flex-col relative">
        {isListening && (
          <VoiceVisualizer onClose={() => setIsListening(false)} />
        )}

        <ChatArea
          messages={messages}
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          onMicClick={() => setIsListening(!isListening)}
          isListening={isListening}
        />
      </div>
    </div>
  );
}
