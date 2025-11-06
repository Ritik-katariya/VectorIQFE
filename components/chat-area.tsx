"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Upload, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import ChatMessage from "./chat-message"
import ParametersPopup from "./parameters-popup"
import { FileUploadModal } from "./file-upload-modal"
import Image from "next/image"
import logo from "@/public/image/logo.png"

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

export default function ChatArea({
  messages,
  onSendMessage,
  onFileUpload,
  onMicClick,
  isListening,
}: ChatAreaProps) {
  const [input, setInput] = useState("")
  const [showParameters, setShowParameters] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
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

  const handleSubmit = (data: any) => {
    console.log("Form submitted:", data)
    setIsOpen(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFileUpload(Array.from(e.target.files))
      e.target.value = ""
    }
  }

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
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Bottom Input Bar */}
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl px-3 sm:px-6 py-3 sm:py-4">
          {showParameters && <ParametersPopup onClose={() => setShowParameters(false)} />}

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

            <FileUploadModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSubmit={handleSubmit} />

            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) handleSend()
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
                  isListening ? "bg-accent/30 text-accent" : "hover:bg-accent/10"
                }`}
              >
                <Mic size={18} className="sm:size-5" />
              </Button>

              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                size="icon"
                className="rounded-xl h-10 w-10 sm:h-12 sm:w-12 bg-[#bab3b3] border shadow-md text-black transition-all"
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
  )
}
