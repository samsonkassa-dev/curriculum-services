import * as React from "react";
import { Button } from "@/components/ui/button";
import { SendHorizonal, Bot, ArrowLeft, Plus, MessageSquare, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  TrainingAnalytics, 
  SessionAnalytics, 
  CombinedAnalyticsData 
} from "@/lib/hooks/useAnalytics";

interface AnalyticsChatFullscreenProps {
  isOpen: boolean;
  onClose: () => void;
  analyticsData: CombinedAnalyticsData;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
}

export function AnalyticsChatFullscreen({ isOpen, onClose, analyticsData }: AnalyticsChatFullscreenProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your analytics assistant. How can I help you understand your data today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = React.useState<ChatHistory[]>([
    { id: "1", title: "Analytics Overview", timestamp: new Date() },
    { id: "2", title: "Training Completion Analysis", timestamp: new Date() },
    { id: "3", title: "Gender Distribution Data", timestamp: new Date() },
    { id: "4", title: "Delivery Method Stats", timestamp: new Date() },
  ]);

  // Generate response based on analytics data
  const generateResponse = (userQuery: string) => {
    const traineesCount = analyticsData?.traineeCountPerTraining 
      ? analyticsData.traineeCountPerTraining.reduce((sum, training) => sum + training.totalTraineeCount, 0)
      : 'unknown';
    
    const lowercaseQuery = userQuery.toLowerCase();
    
    if (lowercaseQuery.includes("trainee") || lowercaseQuery.includes("total")) {
      return `Based on our analytics, we have a total of ${traineesCount} trainees across all trainings.`;
    } else if (lowercaseQuery.includes("gender") || lowercaseQuery.includes("distribution")) {
      return "Gender distribution shows a balanced participation across all programs, with a slight majority of female participants.";
    } else if (lowercaseQuery.includes("age") || lowercaseQuery.includes("demographic")) {
      return "The age distribution shows most participants are between 25-34 years old, accounting for approximately 45% of all trainees.";
    } else if (lowercaseQuery.includes("session") || lowercaseQuery.includes("delivery")) {
      return "Most sessions are being delivered through our blended learning approach, with online sessions being the second most common delivery method.";
    } else if (lowercaseQuery.includes("completion") || lowercaseQuery.includes("success")) {
      return "The completion rate for trainings is trending upward this month, with an average completion rate of 72% across all trainings.";
    } else {
      return "I'm not sure I understand your question about the analytics data. Could you please ask about specific metrics like trainees, gender distribution, age demographics, session delivery methods, or completion rates?";
    }
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

  // Handle new chat
  const handleNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm your analytics assistant. How can I help you understand your data today?",
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex">
      {/* Sidebar */}
      <div className="w-64 h-full bg-white border-r overflow-auto flex flex-col">
        {/* Back Button */}
        <div className="p-4 border-b flex items-center">
          <Button variant="ghost" size="sm" className="text-brand" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            back to system
          </Button>
        </div>
        
        {/* New Chat Button */}
        <div className="p-4">
          <Button 
            className="w-full rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center"
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4 mr-2" />
            New chat
          </Button>
        </div>
        
        {/* History Section */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">History</span>
            <button className="text-xs text-brand">Clear All</button>
          </div>
          <div className="border-t border-gray-200 my-2"></div>
        </div>
        
        {/* Chat History List */}
        <div className="flex-1 overflow-auto">
          {chatHistory.map((chat) => (
            <button 
              key={chat.id}
              className="w-full text-left p-3 hover:bg-gray-100 flex items-center"
              onClick={() => {}}
            >
              <MessageSquare className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-sm text-gray-700 truncate">{chat.title}</span>
            </button>
          ))}
        </div>
        
        {/* User Section */}
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-300 mr-2"></div>
              <span className="text-sm text-gray-700">User Name</span>
            </div>
            <Button variant="ghost" size="icon">
              <LogOut className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
        {/* Chat Messages */}
        <div className="flex-1 overflow-auto p-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "mb-6",
                message.role === "user" ? "flex justify-end" : "flex justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-4",
                  message.role === "user"
                    ? "bg-brand text-white"
                    : "bg-white border border-gray-200 shadow-sm"
                )}
              >
                <div className="flex items-center mb-2">
                  {message.role === "assistant" && (
                    <Bot className="h-5 w-5 mr-2 text-brand" />
                  )}
                  <span className="font-semibold text-sm">
                    {message.role === "user" ? "You" : "Analytics Assistant"}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <div className="text-xs mt-2 opacity-70 text-right">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="mx-auto max-w-3xl relative">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Write your question here....."
                className="flex h-12 w-full rounded-full border border-input bg-background px-6 py-2 pr-12 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="absolute right-2 rounded-full bg-brand hover:bg-brand/90"
              >
                <SendHorizonal className="h-4 w-4 text-white" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 