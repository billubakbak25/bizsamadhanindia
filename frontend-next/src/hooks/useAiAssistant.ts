"use client";

import { useState } from "react";
import { apiJson, unwrapData } from "@/lib/api";
import {
  createAiAssistantMessage,
  type AiAssistantMessage,
  type AiAssistantReply,
} from "@/lib/aiAssistant";

type AiAssistantEnvelope = {
  data?: AiAssistantReply;
};

const INITIAL_MESSAGE = createAiAssistantMessage(
  "assistant",
  "Tell me what you need help with. I can guide you on GST registration, ITR filing, company registration, LLP setup, trademark work, ROC filing, and bookkeeping.",
);

export function useAiAssistant() {
  const [messages, setMessages] = useState<AiAssistantMessage[]>([INITIAL_MESSAGE]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(content: string) {
    const trimmed = content.trim();

    if (!trimmed || isSending) {
      return;
    }

    const userMessage = createAiAssistantMessage("user", trimmed);
    setMessages((current) => [...current, userMessage]);
    setIsSending(true);
    setError("");

    try {
      const payload = await apiJson<AiAssistantEnvelope | AiAssistantReply>(
        "/api/chatbot/message",
        {
          method: "POST",
          cache: "no-store",
          json: { message: trimmed },
        },
        { label: "chatbot.message" },
      );

      const reply = unwrapData(payload);

      setMessages((current) => [
        ...current,
        createAiAssistantMessage("assistant", reply.reply, reply.service),
      ]);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Unable to reach the assistant right now.";
      setError(message);
      setMessages((current) => [
        ...current,
        createAiAssistantMessage(
          "assistant",
          "The assistant is unavailable at the moment. You can still book a consultation and the team will guide you.",
        ),
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function resetConversation() {
    setMessages([INITIAL_MESSAGE]);
    setError("");
  }

  return {
    error,
    isSending,
    messages,
    resetConversation,
    sendMessage,
  };
}