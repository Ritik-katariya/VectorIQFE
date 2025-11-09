"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Upload, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ChatMessage from "./chat-message";
import { FileUploadModal } from "./file-upload-modal";
import Image from "next/image";
import logo from "@/public/image/logo.png";
import useDataItemStore from "@/store/data-itmes";
import { useQueryStream } from "@/hooks/useQueryStream";
import { getFromLocalStorage } from "@/lib/setinlocal";
import { useAuth } from "@clerk/nextjs";
import { saveMessage } from "@/server-action/chat.server";
interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (
    content: string,
    role?: "user" | "ai",
    messageId?: string
  ) => void;
  onMicClick: () => void;
  isListening: boolean;
  onChatIdChange?: (chatId: string) => void;
}

export default function ChatArea({
  messages,
  onSendMessage,
  onMicClick,
  isListening,
  onChatIdChange,
}: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { text, isStreaming, error, run } = useQueryStream();
  const { dataItems } = useDataItemStore();
  const chatId = getFromLocalStorage<string>("chatId");
  const { userId } = useAuth();
  const [currentAssistantMessageId, setCurrentAssistantMessageId] = useState<
    string | null
  >(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, text]);

  const handleSend = async () => {
    if (!input.trim() || !userId || isStreaming) return;

    const userMessage = input.trim();
    const queryInput = input.trim();
    setInput(""); // Clear input immediately for better UX

    // Clear any previous assistant message ID
    setCurrentAssistantMessageId(null);

    // Add user message immediately
    onSendMessage(userMessage, "user");

    // Save user message to DB
    let updatedChatId = chatId;
    try {
      const result = await saveMessage({
        query: userMessage,
        userId: userId,
        chatId: chatId || "",
        role: "USER",
      });

      // Update chatId if it was created
      if (result.data?.chatId) {
        updatedChatId = result.data.chatId;
        localStorage.setItem("chatId", JSON.stringify(result.data.chatId));
        // Notify parent component of chatId change
        onChatIdChange?.(result.data.chatId);
      }
    } catch (err) {
      console.error("Failed to save user message:", err);
    }

    // Create assistant message placeholder
    const assistantMessageId = Math.random().toString(36).substr(2, 9);
    setCurrentAssistantMessageId(assistantMessageId);
    onSendMessage("", "ai", assistantMessageId); // Create empty AI message

    // Start streaming
    // Flatten all ChunksIds from selected data items into a single array
    const allChunkIds = dataItems.flatMap((item) => item.ChunksIds || []);
    run({
      query: queryInput,
      ids: allChunkIds,
      namespace: `user-${userId}`,
      temperature: 0.5,
      top_k: 10,
      base_collection: "knowledge",
    });
  };

  // Update assistant message as it streams
  useEffect(() => {
    if (text !== undefined && currentAssistantMessageId) {
      onSendMessage(text, "ai", currentAssistantMessageId);
    }
  }, [text, currentAssistantMessageId, onSendMessage]);

  // Handle errors
  useEffect(() => {
    if (error && currentAssistantMessageId) {
      onSendMessage(
        `Error: ${error}. Please try again.`,
        "ai",
        currentAssistantMessageId
      );
      setCurrentAssistantMessageId(null);
    }
  }, [error, currentAssistantMessageId, onSendMessage]);

  // Save assistant message when streaming completes
  useEffect(() => {
    if (!isStreaming && text && currentAssistantMessageId && userId) {
      const finalText = text.trim();
      if (finalText) {
        const currentChatId = getFromLocalStorage<string>("chatId");
        saveMessage({
          query: finalText,
          userId: userId,
          chatId: currentChatId || "",
          role: "ASSISTANT",
        }).catch((err) => {
          console.error("Failed to save assistant message:", err);
        });
      }
      setCurrentAssistantMessageId(null);
    }
  }, [isStreaming, text, currentAssistantMessageId, userId]);

  return (
    <div className="flex h-full w-full justify-center items-center bg-background">
      <div className="flex flex-col h-full w-full max-w-5xl bg-background md:rounded-xl">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 sm:px-6 md:px-10 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center px-4 text-center animate-fadeIn">
              <div className="flex flex-col justify-center items-center w-full h-full">
                <Image src={logo} alt="logo image"></Image>
                <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
                  Welcome to Your VectorIQ
                </h2>
                <p className="text-muted-foreground text-sm sm:text-lg">
                  Upload documents and start your conversation
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={
                    isStreaming &&
                    message.role === "ai" &&
                    message.id === currentAssistantMessageId
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Bottom Input Bar */}
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl px-3 sm:px-6 py-3 sm:py-4">
          {/* Selected documents chips */}
          <SelectedChips />

          <div className="flex items-end gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="rounded-xl h-10 w-10 sm:h-12 sm:w-12 border-border/70 hover:bg-accent/10 transition-all"
              title="Upload Files"
            >
              <Upload size={18} className="sm:size-5" />
            </Button>

            <FileUploadModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) handleSend();
                }}
                placeholder="Ask me anything about your documents..."
                className="min-h-10 sm:min-h-12 max-h-36 resize-none bg-input border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-accent/50 focus:ring-accent/20 pr-10 transition-all text-sm sm:text-base"
              />
            </div>

            <div className="flex gap-2 justify-center items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={onMicClick}
                title="Voice Input"
                className={`rounded-xl h-10 w-10 sm:h-12 sm:w-12 border-border/70 border shadow-md transition-all ${
                  isListening
                    ? "bg-accent/30 text-accent"
                    : "hover:bg-accent/10"
                }`}
              >
                <Mic size={18} className="sm:size-5" />
              </Button>

              <Button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                size="icon"
                className="rounded-xl h-10 w-10 sm:h-12 sm:w-12 bg-[#bab3b3] border shadow-md text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} className="sm:size-5" />
              </Button>
            </div>
          </div>

          <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 ml-12 sm:ml-14">
            Shift + Enter for new line • Ctrl + Enter to send
          </p>
        </div>

        {/* Hide Scrollbar Styling */}
        <style jsx global>{`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-in-out;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

function SelectedChips() {
  const { dataItems } = useDataItemStore();
  if (!dataItems || dataItems.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {dataItems.map((item) => (
        <span
          key={item.id}
          className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-accent-foreground border border-accent/30"
          title={item.name}
        >
          {item.name.slice(0, 7)}
        </span>
      ))}
    </div>
  );
}
