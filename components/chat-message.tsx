"use client";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  model?: string;
}

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export default function ChatMessage({
  message,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full ${
        isUser ? "justify-end" : "justify-start"
      } px-2 sm:px-4`}
    >
      <div
        className={`max-w-[80%] sm:max-w-2xl rounded-xl px-4 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-gray-100 text-gray-900"
            : "bg-transparent border border-border text-foreground"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">
          {message.content}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-foreground animate-pulse" />
          )}
        </p>
      </div>
    </div>
  );
}
