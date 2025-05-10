import * as React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SendHorizonal, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  TrainingAnalytics, 
  SessionAnalytics, 
  CombinedAnalyticsData 
} from "@/lib/hooks/useAnalytics";

interface AnalyticsChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analyticsData: CombinedAnalyticsData;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AnalyticsChat({ open, onOpenChange, analyticsData }: AnalyticsChatProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your analytics assistant. How can I help you understand your data today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Mock function to generate responses based on analytics data
  const generateResponse = (userQuery: string) => {
    // In a real implementation, you would analyze the query and use the analyticsData
    // to generate meaningful responses
    
    const traineesCount = analyticsData?.traineeCountPerTraining 
      ? analyticsData.traineeCountPerTraining.reduce((sum, training) => sum + training.totalTraineeCount, 0)
      : 'unknown';
    
    const responses = [
      `Based on our analytics, we have a total of ${traineesCount} trainees across all trainings.`,
      "The completion rate for trainings is trending upward this month.",
      "Gender distribution shows a balanced participation across all programs.",
      "Most sessions are being delivered through our blended learning approach.",
      "The age distribution shows most participants are between 25-34 years old.",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant",
        content: generateResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  // Scroll to bottom when messages update
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-brand" />
            Analytics Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col max-w-[80%] rounded-lg p-3",
                message.role === "user"
                  ? "ml-auto bg-brand text-white"
                  : "mr-auto bg-muted"
              )}
            >
              <span className="text-sm">{message.content}</span>
              <span className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <DialogFooter className="p-4 border-t flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about your analytics data..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button
              onClick={handleSendMessage}
              type="button"
              size="icon"
              className="absolute right-0"
            >
              <SendHorizonal className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 