"use client";

import { Button } from "@/shared/components/ui/Button";
import { Avatar } from "@/shared/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { Send, Sparkles, RotateCcw, Zap } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const suggestedQuestions = [
    "How was my pet today?",
    "Show me all events this week",
    "Is my pet's activity level normal?",
    "Generate a health summary",
    "What should I feed a Golden Retriever?",
    "Tips for reducing pet anxiety",
  ];

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputVal("");
    setIsLoading(true);

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to send message");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: accumulated }
              : msg,
          ),
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  "I'm sorry, I encountered an issue connecting to AI services. Please try again.",
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Zap className="h-6 w-6 text-accent-primary" />
            AI Assistant
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Ask anything about your pets
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMessages([])}
            icon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            New Chat
          </Button>
        )}
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pb-4"
      >
        {messages.length === 0 ? (
          /* Welcome state */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex items-center justify-center h-20 w-20 rounded-3xl gradient-primary mb-6 glow-lg">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Hello! I&apos;m your AI Pet Assistant
            </h2>
            <p className="text-sm text-text-secondary max-w-md mb-8">
              I know everything about your pets. Ask me about their behavior,
              health, daily routine, or anything pet-related.
            </p>
            <div className="grid sm:grid-cols-2 gap-2 max-w-lg w-full">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSend(question)}
                  className={cn(
                    "text-left px-4 py-3 rounded-xl text-sm",
                    "bg-bg-secondary border border-border",
                    "text-text-secondary hover:text-text-primary",
                    "hover:border-accent-primary/30 hover:bg-accent-primary/5",
                    "transition-all duration-[var(--duration-fast)]",
                  )}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-fade-in-up",
                message.role === "user" ? "flex-row-reverse" : "",
              )}
            >
              {message.role === "assistant" ? (
                <div className="flex items-center justify-center h-8 w-8 rounded-lg gradient-primary shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              ) : (
                <Avatar src={null} alt="You" size="sm" />
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                  message.role === "user"
                    ? "bg-accent-primary text-white rounded-tr-md"
                    : "glass-card rounded-tl-md",
                )}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.content || (
                    <span className="text-text-muted">Thinking...</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg gradient-primary shrink-0">
              <Sparkles className="h-4 w-4 text-white animate-spin" />
            </div>
            <div className="glass-card rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 pt-4 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputVal);
          }}
          className="flex gap-2"
        >
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask about your pet..."
            className={cn(
              "flex-1 h-12 rounded-xl px-4",
              "bg-bg-secondary border border-border",
              "text-sm text-text-primary placeholder:text-text-muted",
              "focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 focus:outline-none",
              "transition-all duration-[var(--duration-fast)]",
            )}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="h-12 w-12 rounded-xl"
            disabled={!inputVal.trim() || isLoading}
            loading={isLoading}
            icon={<Send className="h-4 w-4" />}
          />
        </form>
      </div>
    </div>
  );
}
