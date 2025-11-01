"use client"

import { useState } from "react"
import { Mic, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VoiceInput() {
  const [isListening, setIsListening] = useState(false)
  const [waveActive, setWaveActive] = useState(false)

  const handleMicClick = () => {
    setIsListening(!isListening)
    setWaveActive(!isListening)
  }

  return (
    <div className="w-24 flex flex-col items-center justify-center border-l border-border bg-card py-6 px-4">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Wave circles */}
        {waveActive && (
          <>
            <div
              className="absolute inset-0 rounded-full border-2 border-primary opacity-60 wave-pulse"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="absolute inset-0 rounded-full border-2 border-primary opacity-40 wave-pulse"
              style={{ animationDelay: "0.3s" }}
            />
            <div
              className="absolute inset-0 rounded-full border-2 border-primary opacity-20 wave-pulse"
              style={{ animationDelay: "0.6s" }}
            />
          </>
        )}

        {/* Microphone Button */}
        <Button
          onClick={handleMicClick}
          size="icon"
          className={`relative z-10 rounded-full h-12 w-12 ${
            isListening ? "bg-primary hover:bg-primary/90" : "bg-muted hover:bg-muted/80 text-foreground"
          }`}
        >
          {isListening ? <X size={20} /> : <Mic size={20} />}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">{isListening ? "Listening..." : "Click to talk"}</p>
    </div>
  )
}
