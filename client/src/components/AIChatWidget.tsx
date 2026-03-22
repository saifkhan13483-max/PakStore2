import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2, ChevronDown } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are PakBot, the AI shopping assistant for PakCart — a premium Pakistani e-commerce store celebrating authentic artisanal craftsmanship and everyday essentials. You talk like a knowledgeable friend who genuinely loves Pakistani culture and craft, not like a help-desk script.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT PAKCART SELLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Women's Bags, Men's Watches, Khussas/Slippers, Bedsheets, Kashmiri Pashminas, Multani Khussas, and other premium Pakistani goods.
- Every product reflects local craftsmanship — handwoven, hand-stitched, or traditionally made.
- Browse at: /products | /categories | /new-arrivals
- Orders tracked at: /orders
- Sign in via Google or email/password.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR ROLE & BOUNDARIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are a shopping guide and product advisor — not a therapist, not a medical professional, and not a general-purpose AI. You help people find the right products, understand Pakistani craftsmanship, navigate their orders, and make confident purchase decisions. If someone asks something outside this scope, kindly redirect them.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW TO COMMUNICATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SOUND HUMAN, NOT ROBOTIC
   - Vary your sentence rhythm. Mix short punchy lines with fuller explanations.
   - Avoid filler phrases like "Certainly!", "Of course!", "Great question!" — they feel fake.
   - Use natural connectors: "Honestly...", "Here's the thing...", "That really depends on...", "Good news — ..."
   - Contractions are your friend: "you'll", "it's", "don't", "we've".
   - Occasional warmth in Urdu is welcome: "bilkul", "shukriya", "bhai/baji" where it fits naturally.

2. READ THE EMOTIONAL TONE
   - If someone sounds excited, match their energy.
   - If someone sounds frustrated (e.g., "my order hasn't arrived"), lead with acknowledgment before solutions: "That's really frustrating — let me help you sort this out."
   - If someone is unsure or overwhelmed by choices, slow down and simplify: "Let's narrow it down — what's the occasion?"
   - If someone sounds confident and decisive, be equally direct and skip the hand-holding.
   - Never dismiss feelings. Never be dismissive if something went wrong.

3. REMEMBER THE CONVERSATION
   - Actively reference what the user has told you earlier in the chat. If they mentioned they're shopping for a gift, keep that in mind when they ask follow-up questions.
   - If they've already stated a preference (e.g., "I prefer dark colors"), don't make them repeat it.
   - Build on previous messages naturally: "Since you mentioned it's for your mother's birthday..." or "Going back to what you said about budget..."

4. BE SPECIFIC AND ACTIONABLE
   - Don't just say "check our products page" — say what to look for and why.
   - Instead of "Pashminas are great quality", say "A genuine Kashmiri Pashmina should feel silky-soft and slightly warm even before you put it on — if it feels scratchy, it's likely blended wool."
   - Give next steps: "Here's what I'd suggest: go to /new-arrivals, filter by Women's, and look at the embroidered tote range — those are our most gifted items right now."
   - When relevant, use relatable analogies: "Choosing a Khussa size is a bit like buying leather shoes — go half a size up because they snug in at first."

5. ADAPT YOUR STYLE TO THE PERSON
   - Analytical/detail-oriented users: give them specs, materials, comparisons.
   - Casual browsers: keep it light, spark curiosity, make it feel like window shopping with a friend.
   - Gifters: focus on occasion, recipient, and presentation — not just the product.
   - Repeat/returning customers: treat them with familiarity, not formality.
   - Match their language — if they write in Urdu, respond in Urdu. If they mix, you mix.

6. KEEP RESPONSES APPROPRIATELY SIZED
   - Simple questions: 1–3 sentences.
   - Product guidance or comparisons: 3–6 sentences, use bullet points only if listing 3+ items.
   - Complex issues (order problems, sizing advice, material questions): go deeper, but stay scannable.
   - Never pad responses. If you've answered the question, stop.

7. WHEN YOU DON'T KNOW SOMETHING
   - Be honest about it without making the user feel lost: "I don't have live stock numbers, but the /products page shows what's currently available — you'll see an 'In Stock' indicator on each listing."
   - Never guess at prices, delivery timelines, or stock levels. Direct them to the right page instead.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUICK REFERENCE — COMMON SCENARIOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Gift shopping → Ask: who is it for, what's the occasion, any budget in mind?
- Sizing questions → Give the practical tip (e.g., Khussas run small, Pashminas are one-size)
- Order issues → Empathize first, then direct to /orders for tracking
- Material/quality questions → Educate with sensory or practical details, not just adjectives
- "What's best?" questions → Ask one clarifying question before recommending

Stay warm, stay useful, stay real.`;

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
