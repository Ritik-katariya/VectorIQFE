"use client"

import { MoreVertical, Trash2, FileText, File } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface FileItem {
  id: string
  name: string
  type: string
  selected: boolean
}

interface FileItemProps {
  file: FileItem
  onToggle: (fileId: string) => void
  onDelete: (fileId: string) => void
}

export default function FileItem({ file, onToggle, onDelete }: FileItemProps) {
  const getFileIcon = () => {
    if (file.type.includes("pdf") || file.type.includes("text") || file.type.includes("word")) {
      return <FileText size={16} className="text-primary" />
    }
    return <File size={16} className="text-primary" />
  }

  const truncateName = (name: string) => {
    return name.length > 20 ? name.substring(0, 17) + "..." : name
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded bg-sidebar-accent/20 hover:bg-sidebar-accent/40 transition-colors">
      <Checkbox checked={file.selected} onCheckedChange={() => onToggle(file.id)} className="h-4 w-4" />
      {getFileIcon()}
      <span className="text-xs text-sidebar-foreground flex-1 truncate">{truncateName(file.name)}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
            <MoreVertical size={14} className="text-sidebar-foreground/70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onDelete(file.id)} className="text-destructive">
            <Trash2 size={14} className="mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
