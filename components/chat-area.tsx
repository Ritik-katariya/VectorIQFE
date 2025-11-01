"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Upload, Settings2, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import ChatMessage from "./chat-message"
import ParametersPopup from "./parameters-popup"

interface Message {
  id: string
  role: "user" | "ai"
  content: string
}

interface ChatAreaProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  onFileUpload: (files: File[]) => void
  onMicClick: () => void
  isListening: boolean
}

export default function ChatArea({ messages, onSendMessage, onFileUpload, onMicClick, isListening }: ChatAreaProps) {
  const [input, setInput] = useState("")
  const [showParameters, setShowParameters] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input)
      setInput("")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFileUpload(Array.from(e.target.files))
      e.target.value = ""
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-8 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Welcome to Your RAG Assistant</h2>
              <p className="text-muted-foreground text-lg">Upload documents and start your conversation</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm px-6 lg:px-12 py-6">
        {/* Parameters Popup */}
        {showParameters && <ParametersPopup onClose={() => setShowParameters(false)} />}

        {/* Input Row */}
        <div className="flex gap-3 items-end">
          {/* Left side: Upload & Settings */}
          <div className="flex gap-2">
            <input
            title="upload"
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.txt,.docx,.doc,.pptx,.ppt,.xlsx,.xls"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => document.getElementById("file-upload")?.click()}
              title="Upload Files"
              className="rounded-lg hover:bg-accent/20 text-accent hover:text-accent"
            >
              <Upload size={20} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowParameters(!showParameters)}
              title="Custom Parameters"
              className="rounded-lg hover:bg-accent/20 text-accent hover:text-accent"
            >
              <Settings2 size={20} />
            </Button>
          </div>

          {/* Center: Message Input */}
          <div className="flex-1">
            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleSend()
                  }
                }}
                placeholder="Ask me anything about your documents..."
                className="min-h-12 max-h-32 resize-none bg-input border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-accent/50 focus:ring-accent/20"
              />
            </div>
          </div>

          {/* Right side: Mic & Send */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMicClick}
              title="Voice Input"
              className={`rounded-lg ${
                isListening ? "bg-accent/30 text-accent" : "hover:bg-accent/20 text-accent hover:text-accent"
              }`}
            >
              <Mic size={20} />
            </Button>

            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              size="icon"
              className="rounded-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-foreground shadow-lg shadow-accent/20"
            >
              <Send size={20} />
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-2 ml-12">Shift + Enter for new line, Ctrl + Enter to send</p>
      </div>
    </div>
  )
}
