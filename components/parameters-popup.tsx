"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

interface ParametersPopupProps {
  onClose: () => void
}

export default function ParametersPopup({ onClose }: ParametersPopupProps) {
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2000)
  const [topP, setTopP] = useState(1)
  const [useRAG, setUseRAG] = useState(true)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Custom Parameters</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <Label htmlFor="temperature" className="text-sm font-medium">
            Temperature: {temperature.toFixed(2)}
          </Label>
          <input
            title="temperature"
            id="temperature"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(Number.parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Max Tokens */}
        <div className="space-y-2">
          <Label htmlFor="max-tokens" className="text-sm font-medium">
            Max Tokens
          </Label>
          <Input
            id="max-tokens"
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number.parseInt(e.target.value))}
            min="100"
            max="4000"
            className="bg-input border-border"
          />
        </div>

        {/* Top P */}
        <div className="space-y-2">
          <Label htmlFor="top-p" className="text-sm font-medium">
            Top P: {topP.toFixed(2)}
          </Label>
          <input
          title="range"
            id="top-p"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={topP}
            onChange={(e) => setTopP(Number.parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* RAG Toggle */}
        <div className="flex items-center space-x-2">
          <Checkbox id="use-rag" checked={useRAG} onCheckedChange={(checked) => setUseRAG(checked as boolean)} />
          <Label htmlFor="use-rag" className="text-sm font-medium cursor-pointer">
            Use RAG Pipeline
          </Label>
        </div>

        {/* Apply Button */}
        <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/90">
          Apply Settings
        </Button>
      </div>
    </div>
  )
}
