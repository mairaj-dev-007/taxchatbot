"use client";
import { useState } from "react";
import {
  MessageCircle,
  ArrowUp,
  Bot,
  User,
  Sparkles,
  Send,
  Zap,
  Box,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const suggestionPrompts = {
  "General Tax Questions": ["What is income tax?", "What are tax brackets?"],
  "Filing Taxes": [
    "Which filing status should I choose?",
    "How do I claim deductions?",
  ],
  "Tax Credits & Deductions": [
    "What is the Child Tax Credit?",
    "How do I claim mortgage interest?",
  ],
  "Specific Situations": [
    "How do I file taxes?",
    "What should I do if I receive tax refund?",
  ],
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || prompt;
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageContent) setPrompt("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, I'm having trouble connecting right now. Please try again later.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="w-full py-2 bg-black">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-gray-400" />
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                TaxChatbot
              </h1>
              <p className="text-gray-400 text-xs">Your Tax Advisor</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          // Welcome Screen
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-4xl flex flex-col items-center justify-center space-y-3">
              {/* Hero Section */}
              <div className="text-center space-y-4">
                <div className="relative">
                  <h2 className="text-4xl font-light text-white mb-2 tracking-wide">
                    What's on the agenda today?
                  </h2>
                </div>
              </div>

              {/* Enhanced Search Bar */}
              <div className="w-full max-w-2xl">
                <form
                  className="w-full"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <div className="relative group">
                    <div className="relative flex items-center bg-gray-990 border border-gray-600 rounded-2xl px-6 py-4 shadow-lg hover:border-gray-500 transition-all duration-300">
                      <input
                        type="text"
                        className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-lg font-medium"
                        placeholder="Ask anything about taxes..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                      >
                        <ArrowUp className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Enhanced Suggestion Prompts */}
              <div className="w-full max-w-5xl">
                <div className="flex flex-col gap-3 items-center">
                  {Object.values(suggestionPrompts)
                    .flat()
                    .map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(prompt)}
                        className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm"
                      >
                        {prompt}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Enhanced Chat Interface
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <Box className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <div
                      className={`rounded-3xl p-4 ${
                        message.role === "user"
                          ? "text-white ml-auto w-full text-right"
                          : "bg-gray-800 text-white max-w-[80%]"
                      }`}
                    >
                      <p className="text-base leading-relaxed whitespace-pre-wrap font-semibold">
                        {message.content}
                      </p>
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                    <Box className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="bg-gray-800 text-white rounded-3xl p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Input - Fixed Bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-black">
              <div className="flex items-center justify-center">
                <form
                  className="w-full max-w-2xl"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <div className="relative group">
                    <div className="relative flex items-center bg-gray-990 border border-gray-600 rounded-2xl px-6 py-4 shadow-lg hover:border-gray-500 transition-all duration-300">
                      <input
                        type="text"
                        className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-lg font-medium"
                        placeholder="Ask anything about taxes..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                      >
                        <ArrowUp className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
