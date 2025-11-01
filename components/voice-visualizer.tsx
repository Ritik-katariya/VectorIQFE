"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface VoiceVisualizerProps {
  onClose: () => void
}

export default function VoiceVisualizer({ onClose }: VoiceVisualizerProps) {
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    setIsAnimating(true)
  }, [])

  // Generate random bar heights for visualization
  const bars = Array.from({ length: 12 }, () => Math.random() * 100)

  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl m-6">
      <div className="bg-card border border-border rounded-2xl p-8 shadow-xl max-w-sm w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Listening...</h3>
            <p className="text-sm text-muted-foreground">Speak your message</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </Button>
        </div>

        {/* Visualizer Bars */}
        <div className="flex items-end justify-center gap-1 h-20 bg-background/50 rounded-lg p-4">
          {bars.map((height, index) => (
            <div
              key={index}
              className={`bg-gradient-to-t from-primary to-accent rounded-full ${isAnimating ? "animate-pulse" : ""}`}
              style={{
                width: "6px",
                height: `${height}%`,
                minHeight: "4px",
                animationDelay: `${index * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">Recording...</p>
        </div>
      </div>
    </div>
  )
}
