import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, Send, MessageSquare, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const DEFAULT_SUGGESTIONS = [
  "How can I reduce my food expenses?",
  "What are good savings goals for my age?",
  "Should I invest in stocks or mutual funds?",
  "How do I create an emergency fund?",
  "Tips for reducing impulse shopping"
];

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your AI finance assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/ai/chat", { message });
      return await res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      setIsThinking(false);
    }
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    try {
      const response = await chatMutation.mutateAsync(input);
      
      const aiMessage: Message = {
        role: "assistant",
        content: response.reply || "Sorry, I couldn't process that request. Please try asking something else.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">AI Finance Assistant</h1>
        <p className="text-gray-500">Get personalized financial advice and insights</p>
      </header>

      <Card className="flex-1 flex flex-col overflow-hidden mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2 bg-primary/20">
              <AvatarFallback><Sparkles className="h-4 w-4 text-primary" /></AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">Finance AI</CardTitle>
              <CardDescription className="text-xs">Powered by OpenAI</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto pt-0 px-3">
          <div className="space-y-4 py-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div
                    className={`text-xs mt-1 opacity-70 ${
                      message.role === "user" ? "text-right" : ""
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      {messages.length < 3 && (
        <div className="mb-3">
          <p className="text-sm text-muted-foreground mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_SUGGESTIONS.map((suggestion, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs py-1 px-2 h-auto"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="relative pb-16">
        <Textarea
          placeholder="Ask anything about personal finance..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="resize-none pr-10"
          rows={2}
        />
        <Button
          size="icon"
          className="absolute right-2 bottom-20 h-8 w-8"
          onClick={handleSendMessage}
          disabled={!input.trim() || isThinking}
        >
          {isThinking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}