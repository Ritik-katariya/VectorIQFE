"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileItem from "./file-item";
interface File {
  id: string;
  name: string;
  type: string;
  selected: boolean;
}

interface ChatHistoryItem {
  id: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  files: File[];
  onFileToggle: (fileId: string) => void;
  onFileDelete: (fileId: string) => void;
  chatHistory: ChatHistoryItem[];
  onChatSelect: (chatId: string) => void;
  currentChatId: string | null;
}

export default function Sidebar({
  isOpen,
  onToggle,
  files,
  onFileToggle,
  onFileDelete,
  chatHistory,
  onChatSelect,
  currentChatId,
}: SidebarProps) {
  return (
    <div
      className={`transition-all duration-300 ${
        isOpen ? "w-72" : "w-16"
      } bg-sidebar border-r border-sidebar-border flex flex-col h-screen`}
    >
      {/* Toggle Button */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {isOpen && (
          <h2 className="text-lg font-semibold text-sidebar-foreground">
            RAG Chat
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </Button>
      </div>

      {/* Files Section */}
      {isOpen && (
        <div className="flex-1 overflow-hidden flex flex-col ">
          <div className="p-4 border-b border-sidebar-border max-h-1/2 overflow-auto">
            <h3 className="text-sm font-semibold text-sidebar-foreground mb-3">
              Documents
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {files.length === 0 ? (
                <p className="text-xs text-sidebar-foreground/50">
                  No files uploaded
                </p>
              ) : (
                files.map((file) => (
                  <FileItem
                    key={file.id}
                    file={file}
                    onToggle={onFileToggle}
                    onDelete={onFileDelete}
                  />
                ))
              )}
            </div>
          </div>

          {/* Chat History Section */}
          <div className="flex-1  border-t border-sidebar-border p-4 flex flex-col max-h-1/2 overflow-auto">
            <h3 className="text-sm font-semibold text-sidebar-foreground mb-3">
              History
            </h3>
            <div className="space-y-2 overflow-y-auto flex-1">
              {chatHistory.length === 0 ? (
                <p className="text-xs text-sidebar-foreground/50">
                  No chat history
                </p>
              ) : (
                chatHistory.map((item) => {
                  const chatId = item?.id || item;
                  if (!chatId) return null;
                  const displayId =
                    typeof chatId === "string"
                      ? chatId.slice(0, 8)
                      : String(chatId).slice(0, 8);
                  const isActive = currentChatId === chatId;
                  return (
                    <button
                      key={typeof chatId === "string" || typeof chatId === "number" ? chatId : (chatId?.id ?? String(chatId))}
                      onClick={() => onChatSelect(String(chatId))}
                      className={`w-full text-left p-2 rounded text-sm transition-colors truncate ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      chat-{displayId}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
