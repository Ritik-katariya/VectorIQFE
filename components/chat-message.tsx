"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Message {
  id: string
  role: "user" | "ai"
  content: string
  model?: string
}

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">{message.model?.charAt(0)}</AvatarFallback>
        </Avatar>
      )}

      <div
        className={`max-w-md lg:max-w-2xl rounded-lg px-4 py-3 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border border-border"
        }`}
      >
        {!isUser && message.model && <p className="text-xs opacity-70 mb-1">{message.model}</p>}
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-accent text-accent-foreground">U</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
