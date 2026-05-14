"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Phone,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return "";
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai/chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Show prompt after 5 seconds if user hasn't interacted
  useEffect(() => {
    if (!hasInteracted) {
      const timer = setTimeout(() => {
        setHasInteracted(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasInteracted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    sendMessage({ text: inputValue });
    setInputValue("");
    setHasInteracted(true);
  };

  const handleReset = () => {
    setMessages([]);
    setInputValue("");
  };

  const quickQuestions = [
    "How to register a company?",
    "GST registration process",
    "Trademark my brand",
    "Talk to an expert",
  ];

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 right-4 z-50 lg:bottom-8 lg:right-8"
          >
            {/* Prompt bubble */}
            <AnimatePresence>
              {hasInteracted && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full right-0 mb-3 w-64 rounded-2xl bg-white p-4 shadow-xl"
                >
                  <p className="text-sm font-medium text-gray-900">
                    Need help with legal services?
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Ask me anything about company registration, GST, trademark & more
                  </p>
                  <div className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 bg-white" />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setIsOpen(true)}
              className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl lg:h-16 lg:w-16"
            >
              <MessageCircle className="h-6 w-6 lg:h-7 lg:w-7" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold">
                <Sparkles className="h-3 w-3" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 right-0 z-50 flex h-[100dvh] w-full flex-col bg-white shadow-2xl sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[400px] sm:rounded-2xl lg:bottom-8 lg:right-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-none bg-gradient-to-r from-teal-600 to-emerald-600 p-4 sm:rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Wadhwani Associates Assistant</h3>
                  <p className="text-xs text-teal-100">AI-powered legal help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={handleReset}
                    className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                    title="Reset conversation"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                    <Sparkles className="h-8 w-8 text-teal-600" />
                  </div>
                  <h4 className="mb-2 font-semibold text-gray-900">
                    How can I help you today?
                  </h4>
                  <p className="mb-6 max-w-[280px] text-sm text-gray-500">
                    Ask me about company registration, GST, trademark, compliance, or any legal service
                  </p>
                  <div className="grid w-full gap-2">
                    {quickQuestions.map((question) => (
                      <button
                        key={question}
                        onClick={() => {
                          sendMessage({ text: question });
                          setHasInteracted(true);
                        }}
                        className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left text-sm text-gray-700 transition-all hover:border-teal-300 hover:bg-teal-50"
                      >
                        {question}
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const text = getUIMessageText(message);
                    if (!text) return null;

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${
                          message.role === "user" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            message.role === "user"
                              ? "bg-teal-600 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {message.role === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                            message.role === "user"
                              ? "bg-teal-600 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm">{text}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                        <Bot className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="rounded-2xl bg-gray-100 px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Quick Action */}
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
              <Link
                href="/consultation"
                className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
              >
                <Phone className="h-4 w-4" />
                Talk to Expert - Free Consultation
              </Link>
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-gray-200 p-4"
            >
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
