import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2, ChevronDown } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are PakBot, a friendly and knowledgeable AI shopping assistant for PakCart — a premium Pakistani e-commerce store specializing in authentic artisanal goods and daily essentials.

About PakCart:
- We sell premium Pakistani products: Women's Bags, Men's Watches, Slippers (Khussas), Bedsheets, Kashmiri Pashminas, Multani Khussas, and more.
- All products celebrate Pakistani craftsmanship and artisanal quality.
- We offer secure checkout, order tracking, and customer accounts.
- Users can sign in with Google or email/password.
- You can browse products at /products, categories at /categories, and new arrivals at /new-arrivals.

Your role:
- Help customers find products, answer questions about categories, materials, and quality.
- Help with order-related questions (checking orders at /orders).
- Provide sizing, material, and care advice for Pakistani artisanal goods.
- Be warm, helpful, and conversational. Use a mix of professional and friendly tone.
- You can respond in English or Urdu depending on the user's preference.
- Keep responses concise and helpful (2-4 sentences unless more detail is needed).
- If you don't know something specific (like stock levels or exact prices), suggest they browse the product pages.

Always stay on-topic for PakCart shopping assistance.`;

const QUICK_REPLIES = [
  "What products do you sell?",
  "How do I track my order?",
  "Tell me about Kashmiri Pashminas",
  "What payment methods do you accept?",
];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "السلام علیکم! 👋 I'm PakBot, your PakCart shopping assistant. How can I help you find authentic Pakistani products today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
      setHasUnread(false);
    }
  }, [isOpen, messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...updatedMessages,
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (data.choices?.[0]?.message?.content) {
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: data.choices[0].message.content },
        ]);
      } else {
        throw new Error("Invalid response");
      }
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-20 right-4 z-50 lg:bottom-6 lg:right-6 flex flex-col items-end gap-3">
        {isOpen && (
          <div
            className="w-[calc(100vw-2rem)] max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
            style={{ height: "480px" }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 text-white"
              style={{ background: "hsl(168 58% 32%)" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight">PakBot</p>
                  <p className="text-xs text-white/70">PakCart Assistant</p>
                </div>
              </div>
              <button
                data-testid="button-close-chat"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "hsl(168 58% 32%)" }}
                    >
                      <Bot size={13} className="text-white" />
                    </div>
                  )}
                  <div
                    data-testid={`message-${msg.role}-${i}`}
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "text-white rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                    style={
                      msg.role === "user"
                        ? { background: "hsl(168 58% 32%)" }
                        : {}
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "hsl(168 58% 32%)" }}
                  >
                    <Bot size={13} className="text-white" />
                  </div>
                  <div className="bg-muted px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Thinking…</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    data-testid={`button-quick-reply-${reply}`}
                    onClick={() => sendMessage(reply)}
                    className="text-xs px-2.5 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors bg-white dark:bg-gray-800 text-muted-foreground"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            <div className="px-3 pb-3 pt-2 border-t border-border">
              <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
                <input
                  ref={inputRef}
                  data-testid="input-chat-message"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything…"
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
                />
                <button
                  data-testid="button-send-message"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
                  style={{ background: "hsl(168 58% 32%)" }}
                >
                  <Send size={13} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          data-testid="button-open-chat"
          onClick={() => setIsOpen((o) => !o)}
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 relative"
          style={{ background: "hsl(168 58% 32%)" }}
          aria-label="Open AI chat assistant"
        >
          {isOpen ? (
            <X size={22} className="text-white" />
          ) : (
            <MessageCircle size={22} className="text-white" />
          )}
          {hasUnread && !isOpen && (
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white" />
          )}
        </button>
      </div>
    </>
  );
}
