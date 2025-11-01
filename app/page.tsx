"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import ChatArea from "@/components/chat-area"
import VoiceVisualizer from "@/components/voice-visualizer"

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [files, setFiles] = useState<Array<{ id: string; name: string; type: string; selected: boolean }>>([])
  const [chatHistory, setChatHistory] = useState<Array<{ id: string; name: string; timestamp: string }>>([])
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "ai"; content: string }>>([])
  const [isListening, setIsListening] = useState(false)

  const handleFileUpload = (newFiles: File[]) => {
    const uploadedFiles = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      selected: true,
    }))
    setFiles((prev) => [...prev, ...uploadedFiles])
  }

  const handleToggleFile = (fileId: string) => {
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, selected: !f.selected } : f)))
  }

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleSendMessage = (content: string) => {
    const userMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user" as const,
      content,
    }
    setMessages((prev) => [...prev, userMessage])

    setTimeout(() => {
      const aiMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: "ai" as const,
        content: `This is an AI response based on your documents. In a real application, this would be connected to your RAG pipeline.`,
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 1000)
  }

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
        {isListening && <VoiceVisualizer onClose={() => setIsListening(false)} />}

        <ChatArea
          messages={messages}
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          onMicClick={() => setIsListening(!isListening)}
          isListening={isListening}
        />
      </div>
    </div>
  )
}
