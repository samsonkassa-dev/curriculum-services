import * as React from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
}

export function ChatButton({ onClick, className, ...props }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 flex items-center justify-center rounded-full bg-brand p-3 shadow-lg transition-all hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2",
        "animate-in fade-in-50 zoom-in-95",
        className
      )}
      {...props}
    >
      <MessageSquare className="h-6 w-6 text-white" />
      <span className="sr-only">Open Analytics Chat</span>
    </button>
  );
} 