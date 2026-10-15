import { useState, useCallback } from "react";
import { api } from "@/services/api";
import { AnalysisType } from "@/features/ai/AiChat";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  analysisType?: AnalysisType;
  /** Instant-answer quick replies attached to an assistant message */
  suggestions?: string[];
}

export interface AnalysisResult {
  type: string;
  summary: string;
  details: Record<string, any>;
  recommendations: string[];
  metrics?: Record<string, number>;
}

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string, analysisType?: AnalysisType) => {
      if (!content.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        role: "user",
        content,
        timestamp: new Date(),
        analysisType,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        // Send the full conversation history so the AI follows the thread
        const history = [...messages, userMessage]
          .filter((m) => m.role !== "system")
          .slice(-12)
          .map((m) => ({ role: m.role, content: m.content }));

        const response = await api.ai.chat({
          messages: history,
          analysisType: analysisType || "general_qa",
          companyId: "company-dev-001",
        });

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response.data?.response || "I couldn't generate a response.",
          timestamp: new Date(),
          analysisType,
          suggestions: Array.isArray(response.data?.suggestions)
            ? (response.data.suggestions as string[]).slice(0, 3)
            : undefined,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        return response.data;
      } catch (err) {
        const errorMessage = "Failed to get response. Please try again.";
        setError(errorMessage);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: errorMessage,
            timestamp: new Date(),
          },
        ]);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages],
  );

  const runAnalysis = useCallback(
    async (type: AnalysisType, params: {
      entityId?: string;
      relatedEntityId?: string;
      question?: string;
    } = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.ai.analyze({
          type,
          companyId: "company-dev-001",
          ...params,
        });

        return response.data as AnalysisResult;
      } catch (err) {
        const errorMessage = `Analysis failed: ${err instanceof Error ? err.message : "Unknown error"}`;
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    runAnalysis,
    clearMessages,
    setMessages,
  };
}

export function useAiAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(
    async (type: AnalysisType, params: {
      entityId?: string;
      relatedEntityId?: string;
      question?: string;
    } = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.ai.analyze({
          type,
          companyId: "company-dev-001",
          ...params,
        });

        return response.data as AnalysisResult;
      } catch (err) {
        const errorMessage = `Analysis failed: ${err instanceof Error ? err.message : "Unknown error"}`;
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { analyze, isLoading, error };
}