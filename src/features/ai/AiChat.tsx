"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Sparkles,
  X,
  RotateCcw,
  Zap,
  ChevronRight,
  Minus,
  Square,
  ArrowDown,
} from "lucide-react";

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}.${minutes}`;
}

export type AnalysisType =
  | "price_negotiation"
  | "inventory_optimization"
  | "supplier_performance"
  | "sales_forecasting"
  | "profitability_insights"
  | "risk_alerts"
  | "general_qa";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  analysisType?: AnalysisType;
  /** Quick replies shown right below this assistant message (instant-answer system) */
  suggestions?: string[];
}

interface ChatSuggestion {
  label: string;
  analysisType?: AnalysisType;
  prompt: string;
}

/** Category modes shown inside the chat (no cramped select dropdown) */
const ANALYSIS_TYPES: { value: AnalysisType; label: string; icon: string }[] = [
  { value: "general_qa", label: "Umum", icon: "💬" },
  { value: "price_negotiation", label: "Harga", icon: "💰" },
  { value: "inventory_optimization", label: "Stok", icon: "📦" },
  { value: "supplier_performance", label: "Supplier", icon: "🏭" },
  { value: "sales_forecasting", label: "Forecast", icon: "📈" },
  { value: "profitability_insights", label: "Margin", icon: "🧮" },
  { value: "risk_alerts", label: "Risiko", icon: "⚠️" },
];

const SUGGESTIONS: Record<AnalysisType, ChatSuggestion[]> = {
  general_qa: [
    { label: "Posisi kas sekarang", prompt: "What's our current cash position?" },
    { label: "Ringkasan bulan ini", prompt: "Summarize this month's business performance" },
    { label: "Alur rantai pasok", prompt: "Explain the cassava supply chain flow from farmer to customer" },
  ],
  price_negotiation: [
    { label: "Benchmark harga Fresh Cassava", prompt: "What's the current market benchmark for Fresh Cassava (Grade A)?" },
    { label: "Walk-away price Cassava Flour", prompt: "What should be my walk-away price when selling Cassava Flour?" },
    { label: "Leverage nego dengan China Foods", prompt: "Analyze my negotiation leverage with China Foods Import Co." },
  ],
  inventory_optimization: [
    { label: "Produk yang perlu reorder", prompt: "Which products need reordering right now?" },
    { label: "Safety stock Tapioca Starch", prompt: "Calculate optimal safety stock for Tapioca Starch" },
    { label: "Kapasitas gudang", prompt: "Show current warehouse capacity utilization" },
  ],
  supplier_performance: [
    { label: "Ranking supplier", prompt: "Rank all suppliers by total cost of ownership" },
    { label: "Supplier kualitas terbaik", prompt: "Which supplier has the best quality score?" },
    { label: "Optimasi payment terms", prompt: "Analyze payment terms optimization opportunities" },
  ],
  sales_forecasting: [
    { label: "Forecast Q1 revenue", prompt: "Forecast Q1 2026 revenue based on current pipeline" },
    { label: "Customer paling potensial", prompt: "Which customer has the highest growth potential?" },
    { label: "Permintaan musiman Chips", prompt: "Predict seasonal demand for Cassava Chips" },
  ],
  profitability_insights: [
    { label: "Margin per kategori", prompt: "Show margin breakdown by product category" },
    { label: "Customer paling profit", prompt: "Which customer is most profitable?" },
    { label: "Dampak ongkir ke margin", prompt: "Analyze shipping cost impact on margins by route" },
  ],
  risk_alerts: [
    { label: "Exposure kredit customer", prompt: "Check current customer credit exposure and overdue amounts" },
    { label: "Risiko single-source", prompt: "Identify products with single-source supplier risk" },
    { label: "Stok > 90 hari", prompt: "Alert on inventory aging more than 90 days" },
  ],
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

/** Max number of past messages (excluding the new one) sent as conversation context */
const HISTORY_LIMIT = 12;

/* ------------------------------------------------------------------ */
/* Lightweight markdown renderer: bold, lists, headings, tables, code  */
/* ------------------------------------------------------------------ */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const token = match[0];
    const key = `${keyPrefix}-i${i++}`;
    if (token.startsWith("**")) {
      parts.push(
        <strong key={key} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      parts.push(
        <code key={key} className="px-1 py-0.5 rounded bg-black/10 text-[0.85em] font-mono">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      parts.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function MarkdownLite({ content, isUser }: { content: string; isUser: boolean }) {
  const blocks = useMemo(() => content.split("\n"), [content]);
  const nodes: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let tableBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    const items = listBuffer.map((item, idx) => (
      <li key={`${key}-li${idx}`} className="flex gap-2">
        <span className="mt-[2px] shrink-0 opacity-60">•</span>
        <span>{renderInline(item, `${key}-li${idx}`)}</span>
      </li>
    ));
    nodes.push(<ul key={key} className="space-y-1 my-1">{items}</ul>);
    listBuffer = [];
  };

  const flushTable = (key: string) => {
    if (tableBuffer.length === 0) return;
    const rows = tableBuffer
      .filter((r) => !/^\s*\|?\s*[-:|]+\s*\|?\s*$/.test(r))
      .map((r) => r.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim()));
    const [head, ...body] = rows;
    nodes.push(
      <div key={key} className="my-2 overflow-x-auto rounded-lg border border-white/15 bg-black/5 dark:border-white/10">
        <table className="w-full text-[0.8rem]">
          {head && (
            <thead>
              <tr className="bg-black/5">
                {head.map((c, i) => (
                  <th key={i} className="px-2 py-1.5 text-left font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri} className="border-t border-black/5">
                {r.map((c, ci) => (
                  <td key={ci} className="px-2 py-1">
                    {renderInline(c, `t${ri}-${ci}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    tableBuffer = [];
  };

  blocks.forEach((line, idx) => {
    const key = `b${idx}`;
    const trimmed = line.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList(`${key}-ul`);
      tableBuffer.push(trimmed);
      return;
    }
    flushTable(`${key}-table`);

    if (/^#{1,3}\s/.test(trimmed)) {
      nodes.push(
        <p key={key} className="mt-2 mb-1 text-[0.95rem] font-bold first:mt-0">
          {renderInline(trimmed.replace(/^#{1,3}\s/, ""), key)}
        </p>,
      );
      return;
    }
    if (/^[-*•]\s+/.test(trimmed) || /^\d+[.)]\s+/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^([-*•]|\d+[.)])\s+/, ""));
      return;
    }
    flushList(`${key}-ul`);
    if (trimmed === "") return;
    nodes.push(
      <p key={key} className="my-1 first:mt-0 last:mb-0">
        {renderInline(trimmed, key)}
      </p>,
    );
  });

  flushList("ul-end");
  flushTable("table-end");

  return (
    <div className={isUser ? "text-[0.9rem]" : "text-[0.9rem] text-inherit"}>
      {nodes.length > 0 ? nodes : <p>{content}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Typing indicator                                                    */
/* ------------------------------------------------------------------ */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1" aria-label="AI sedang mengetik">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-2 w-2 animate-bounce rounded-full bg-white/80"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main chat widget                                                    */
/* ------------------------------------------------------------------ */
export function AiChat({ isOpen = true, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Halo! 👋 Saya **CASSAVA AI** — analyst bisnis kamu untuk Indo Cassava Trading.\n\nSaya bisa bantu soal harga & negosiasi, stok & gudang, supplier, forecast, margin, sampai risiko bisnis.\n\nTanya langsung di bawah, atau klik salah satu pertanyaan cepat ini 👇",
      timestamp: new Date(),
      suggestions: [
        "Posisi kas kita sekarang gimana?",
        "Produk mana yang perlu reorder?",
        "Siapa supplier terbaik kita?",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisType>("general_qa");
  const [isMinimized, setIsMinimized] = useState(false);
  const [textareaRows, setTextareaRows] = useState(1);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  /** true kalau user sedang memang di dekat bagian bawah chat */
  const atBottomRef = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<Message[]>(messages);

  // Keep a ref mirror of messages so sendMessage can build history without
  // running side effects inside a state updater (StrictMode-safe).
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /** Deteksi posisi scroll user setiap dia menggulir manual */
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    atBottomRef.current = distance < 80;
    setShowScrollBottom(distance > 160);
  };

  /** Auto-scroll HANYA kalau user sudah dekat bawah — kalau dia sedang
   *  scroll ke atas buat baca jawaban lama, jangan tarik balik. */
  const scrollToBottom = useCallback((force = false) => {
    const el = scrollRef.current;
    if (!el || (!atBottomRef.current && !force)) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    atBottomRef.current = true;
    setShowScrollBottom(false);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const sendMessage = useCallback(
    async (content: string, analysisType?: AnalysisType) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      const type = analysisType || selectedAnalysis;
      const userMessage: Message = {
        role: "user",
        content: trimmed,
        timestamp: new Date(),
        analysisType: type,
      };

      // Send full conversation history so the AI actually follows the thread
      messagesRef.current = [...messagesRef.current, userMessage];
      setMessages(messagesRef.current);
      const history = messagesRef.current
        .filter((m) => m.role !== "system")
        .slice(-HISTORY_LIMIT)
        .map((m) => ({ role: m.role, content: m.content }));

      fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          analysisType: type,
          companyId: "company-dev-001",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const text: string =
            data.data?.response || data.response || "Maaf, saya tidak bisa menghasilkan jawaban sekarang.";
          const API_ROOT = data.data || data;
          const suggestions: string[] | undefined = Array.isArray(API_ROOT.suggestions)
            ? API_ROOT.suggestions.slice(0, 3)
            : undefined;
          const assistantMessage: Message = {
            role: "assistant",
            content: text,
            timestamp: new Date(),
            analysisType: type,
            suggestions,
          };
          messagesRef.current = [...messagesRef.current, assistantMessage];
          setMessages(messagesRef.current);
          setIsLoading(false);
        })
        .catch(() => {
          const errorMessage: Message = {
            role: "assistant",
            content: "Hmm, koneksinya bermasalah 😅. Coba kirim ulang pertanyaannya ya.",
            timestamp: new Date(),
          };
          messagesRef.current = [...messagesRef.current, errorMessage];
          setMessages(messagesRef.current);
          setIsLoading(false);
        });

      setInput("");
      setTextareaRows(1);
      setIsLoading(true);
    },
    [isLoading, selectedAnalysis],
  );

  const handleQuickReply = (text: string) => sendMessage(text);

  const clearChat = () => {
    const resetMessage: Message = {
      role: "assistant",
      content:
        "Chat di-reset ✨. Ada yang mau ditanyain soal bisnis cassava? Langsung aja ketik di bawah 👇",
      timestamp: new Date(),
      suggestions: SUGGESTIONS[selectedAnalysis].slice(0, 3).map((s) => s.prompt),
    };
    messagesRef.current = [resetMessage];
    setMessages([resetMessage]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!isOpen || isMinimized) {
    // Minimized state: floating pill version of the widget
    if (isOpen && isMinimized) {
      return (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-800 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-green-900/30 transition hover:scale-[1.03]"
        >
          <Sparkles className="h-4 w-4" />
          CASSAVA AI
          <Badge className="bg-white/20 text-white text-[10px]">1</Badge>
        </button>
      );
    }
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex h-[min(680px,90vh)] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-emerald-200/60 bg-white shadow-2xl shadow-green-900/20 md:max-w-lg">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-emerald-700 via-green-800 to-green-900 px-4 pb-4 pt-3 text-white">
        <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Sparkles className="h-5 w-5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-green-800 bg-lime-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight">CASSAVA AI</span>
                <Badge className="rounded-full bg-white/15 text-[10px] text-white">Beta</Badge>
              </div>
              <p className="text-xs text-emerald-100/90">
                {isLoading ? "Sedang menganalisis…" : "Online — siap bantu bisnis kamu"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="h-8 w-8 p-0 text-white/80 hover:bg-white/10 hover:text-white"
              title="Reset chat"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            {onClose ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-white/80 hover:bg-white/10 hover:text-white"
                title="Tutup"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8 p-0 text-white/80 hover:bg-white/10 hover:text-white"
                title="Minimize"
              >
                <Minus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Category chips (inline — no cramped dropdown) */}
        <div className="relative mt-3 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ANALYSIS_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedAnalysis(type.value)}
              disabled={isLoading}
              className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
                selectedAnalysis === type.value
                  ? "bg-white text-green-900 shadow"
                  : "bg-white/10 text-emerald-50 hover:bg-white/20"
              }`}
            >
              <span>{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="chat-scroll relative min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-gradient-to-b from-emerald-50/60 to-white px-3 py-4"
      >
        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <div key={index}>
              <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-green-800 text-white shadow">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className={`flex max-w-[85%] flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 shadow-sm ${
                      isUser
                        ? "rounded-br-sm bg-gradient-to-br from-emerald-600 to-green-700 text-white"
                        : "rounded-bl-sm border border-emerald-100 bg-white text-gray-800"
                    }`}
                  >
                    <MarkdownLite content={message.content} isUser={isUser} />
                    <p
                      className={`mt-1 text-right text-[10px] ${
                        isUser ? "text-emerald-100/80" : "text-gray-400"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>

                  {/* Instant-answer quick replies (the direct-answer system) */}
                  {!isUser &&
                    !isLoading &&
                    message.suggestions &&
                    index === messages.length - 1 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {message.suggestions.map((s, si) => (
                          <button
                            key={si}
                            onClick={() => handleQuickReply(s)}
                            disabled={isLoading}
                            className="group flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50 active:scale-[0.97] disabled:opacity-50"
                          >
                            <Zap className="h-3 w-3 text-amber-500" />
                            {s}
                            <ChevronRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    )}
                </div>
                {isUser && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator bubble */}
        {isLoading && (
          <div className="flex gap-2">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-green-800 text-white shadow">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-bl-sm border border-emerald-100 bg-white px-3 py-2.5 shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}
        {/* Tombol kembali ke bawah — muncul saat user sedang scroll ke atas */}
        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom(true)}
            className="sticky bottom-2 ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-700 shadow-md transition hover:bg-emerald-50"
            aria-label="Gulir ke jawaban terbaru"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Starter quick actions (before first user message) */}
      {messages.filter((m) => m.role === "user").length === 0 && !isLoading && (
        <div className="border-t border-emerald-100 bg-emerald-50/50 px-3 py-2">
          <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
            Coba tanya
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SUGGESTIONS[selectedAnalysis].map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s.prompt, s.analysisType)}
                className="shrink-0 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs text-gray-700 transition hover:border-emerald-400 hover:bg-emerald-50"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="border-t border-emerald-100 bg-white p-3"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-3 py-2 transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
          <textarea
            ref={textareaRef}
            value={input}
            rows={textareaRows}
            onChange={(e) => {
              setInput(e.target.value);
              setTextareaRows(Math.min(3, Math.max(1, e.target.value.split("\n").length)));
            }}
            onKeyDown={handleKeyDown}
            placeholder="Tanya apa aja soal bisnis kamu…"
            disabled={isLoading}
            className="max-h-24 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={() => setIsLoading(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow transition hover:opacity-90"
              title="Stop"
            >
              <Square className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow transition hover:opacity-90 disabled:opacity-40"
              title="Kirim"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-1.5 text-center text-[10px] text-gray-400">
          Enter untuk kirim • Shift+Enter baris baru — jawaban berbasis data bisnis, cek kembali keputusan penting
        </p>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Floating open button                                                */
/* ------------------------------------------------------------------ */
export function AiChatButton({ onToggle, onClick, href }: { onToggle?: () => void; onClick?: () => void; href?: string }) {
  if (href) {
    return (
      <a
        href={href}
        className="group fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-emerald-600 to-green-800 px-4 py-3 text-white shadow-lg shadow-green-900/30 transition hover:scale-[1.03]"
        aria-label="Buka CASSAVA AI"
      >
        <Sparkles className="h-5 w-5 transition group-hover:rotate-12" />
        <span className="text-sm font-medium">CASSAVA AI</span>
      </a>
    );
  }
  return (
    <button
      onClick={onClick || onToggle}
      className="group fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-emerald-600 to-green-800 px-4 py-3 text-white shadow-lg shadow-green-900/30 transition hover:scale-[1.03]"
      aria-label="Buka CASSAVA AI"
    >
      <Sparkles className="h-5 w-5 transition group-hover:rotate-12" />
      <span className="text-sm font-medium">CASSAVA AI</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Full-page variant (the /ai website page)                            */
/* ------------------------------------------------------------------ */
export function AiChatPage() {
  const [showWidget] = useState(true);

  return (
    <div className="bg-background">
      {/* Header halaman — bersih, konsisten dengan dashboard */}
      <div className="border-b border-border bg-surface px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-green-800 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text">CASSAVA AI Assistant</h1>
            <p className="text-sm text-text-secondary">
              Analyst bisnis kamu untuk trading cassava — tanya apa aja, jawaban langsung.
            </p>
          </div>
        </div>
      </div>

      {/* Panel chat */}
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="flex h-[calc(100vh-15rem)] min-h-[480px] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <AiChatFullPanel show={showWidget} />
        </div>
      </div>
    </div>
  );
}

/**
 * Inner panel used by AiChatPage: reuses the chat logic but embedded (no
 * fixed positioning, dark theme, no header duplication).
 */
function AiChatFullPanel({ show }: { show: boolean }) {
  if (!show) return null;
  return <div className="chat-embed flex min-h-0 flex-1 flex-col"><AiChatEmbedded /></div>;
}

/* Embedded (non-floating) version of the chat shell, dark themed for the /ai page */
function AiChatEmbedded() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="chat-embedded flex min-h-0 flex-1 flex-col">
        <AiChatEmbeddedInner />
      </div>
    </div>
  );
}

function AiChatEmbeddedInner() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Halo! 👋 Saya **CASSAVA AI** — analyst bisnis kamu untuk Indo Cassava Trading.\n\nTanya langsung di bawah, atau klik salah satu pertanyaan cepat ini 👇",
      timestamp: new Date(),
      suggestions: [
        "Posisi kas kita sekarang gimana?",
        "Produk mana yang perlu reorder?",
        "Siapa supplier terbaik kita?",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisType>("general_qa");
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  /** true kalau user sedang memang di dekat bagian bawah chat */
  const atBottomRef = useRef(true);
  const messagesRef = useRef<Message[]>(messages);

  // Keep a ref mirror so sendMessage can build history without running side
  // effects inside a state updater (StrictMode-safe).
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /** Deteksi posisi scroll user setiap dia menggulir manual */
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    atBottomRef.current = distance < 80;
    setShowScrollBottom(distance > 160);
  };

  /** Auto-scroll HANYA kalau user sudah dekat bawah — kalau dia sedang
   *  scroll ke atas buat baca jawaban lama, jangan tarik balik. */
  const scrollToBottom = useCallback((force = false) => {
    const el = scrollRef.current;
    if (!el || (!atBottomRef.current && !force)) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    atBottomRef.current = true;
    setShowScrollBottom(false);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      const userMessage: Message = {
        role: "user",
        content: trimmed,
        timestamp: new Date(),
        analysisType: selectedAnalysis,
      };

      messagesRef.current = [...messagesRef.current, userMessage];
      setMessages(messagesRef.current);
      const history = messagesRef.current
        .filter((m) => m.role !== "system")
        .slice(-HISTORY_LIMIT)
        .map((m) => ({ role: m.role, content: m.content }));

      fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          analysisType: selectedAnalysis,
          companyId: "company-dev-001",
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          const API_ROOT = data.data || data;
          const assistantMessage: Message = {
            role: "assistant",
            content: API_ROOT?.response || "Maaf, saya tidak bisa menjawab sekarang.",
            timestamp: new Date(),
            suggestions: Array.isArray(API_ROOT?.suggestions) ? API_ROOT.suggestions.slice(0, 3) : undefined,
          };
          messagesRef.current = [...messagesRef.current, assistantMessage];
          setMessages(messagesRef.current);
          setIsLoading(false);
        })
        .catch(() => {
          const errorMessage: Message = {
            role: "assistant",
            content: "Koneksi bermasalah 😅 coba kirim ulang ya.",
            timestamp: new Date(),
          };
          messagesRef.current = [...messagesRef.current, errorMessage];
          setMessages(messagesRef.current);
          setIsLoading(false);
        });

      setInput("");
      setIsLoading(true);
    },
    [isLoading, selectedAnalysis],
  );

  const userCount = messages.filter((m) => m.role === "user").length;

  return (
    <>      {/* Panel header with category chips */}
      <div className="border-b border-border bg-emerald-50/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-green-800 shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-text">CASSAVA AI</p>
              <p className="text-[11px] text-text-secondary">{isLoading ? "Sedang menganalisis…" : "Mode online"}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const resetMessage: Message = {
                role: "assistant",
                content: "Chat di-reset ✨ Tanya aja lagi di bawah 👇",
                timestamp: new Date(),
                suggestions: SUGGESTIONS[selectedAnalysis].slice(0, 3).map((s) => s.prompt),
              };
              messagesRef.current = [resetMessage];
              setMessages([resetMessage]);
            }}
            className="h-8 gap-1.5 px-3 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ANALYSIS_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedAnalysis(type.value)}
              disabled={isLoading}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
                selectedAnalysis === type.value
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-border bg-surface text-text-secondary hover:border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="chat-scroll relative min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
      >
        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <div key={index}>
              <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-700 text-white shadow">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className={`flex max-w-[85%] flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 shadow-sm ${
                      isUser
                        ? "rounded-br-sm bg-gradient-to-br from-emerald-600 to-green-700 text-white"
                        : "rounded-bl-sm border border-gray-200 bg-emerald-50 text-text"
                    }`}
                  >
                    <MarkdownLite content={message.content} isUser={isUser} />
                    <p className={`mt-1 text-right text-[10px] ${isUser ? "text-emerald-100/70" : "text-gray-400"}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>

                  {!isUser && !isLoading && message.suggestions && index === messages.length - 1 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {message.suggestions.map((s, si) => (
                        <button
                          key={si}
                          onClick={() => sendMessage(s)}
                          className="flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50 active:scale-[0.97]"
                        >
                          <Zap className="h-3 w-3 text-amber-500" />
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {isUser && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-700 text-white shadow">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-bl-sm border border-gray-200 bg-emerald-50 px-3 py-2.5">
              <TypingDots />
            </div>
          </div>
        )}
        {/* Tombol kembali ke bawah — muncul saat user sedang scroll ke atas */}
        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom(true)}
            className="sticky bottom-2 ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-emerald-700 shadow-md transition hover:bg-emerald-50"
            aria-label="Gulir ke jawaban terbaru"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Starter chips */}
      {userCount === 0 && !isLoading && (
        <div className="border-t border-border bg-gray-50 px-4 py-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Coba tanya</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SUGGESTIONS[selectedAnalysis].map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s.prompt)}
                className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="border-t border-border bg-surface p-3"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-gray-300 bg-gray-50 px-3 py-2 transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
          <textarea
            value={input}
            rows={1}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Tanya apa aja soal bisnis kamu…"
            disabled={isLoading}
            className="max-h-24 flex-1 resize-none bg-transparent text-sm text-text outline-none placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-sm transition hover:opacity-90 disabled:opacity-40"
            title="Kirim"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-gray-400">
          Enter untuk kirim • Shift+Enter baris baru — jawaban berbasis data bisnis, cek kembali keputusan penting
        </p>
      </form>
    </>
  );
}
