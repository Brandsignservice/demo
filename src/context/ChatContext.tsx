import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { QUICK_ACTIONS, WELCOME_MESSAGE } from "../data/brand";
import { respond, type AssistantReply, type ConversationState } from "../lib/assistant";
import { useCompare } from "./CompareContext";

export type ChatMessage =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "ai"; reply: AssistantReply };

interface ChatApi {
  isOpen: boolean;
  messages: ChatMessage[];
  typing: boolean;
  open: (prompt?: string) => void;
  close: () => void;
  send: (text: string) => void;
  reset: () => void;
}

const ChatContext = createContext<ChatApi | null>(null);

const welcomeMessage = (): ChatMessage => ({
  id: 0,
  role: "ai",
  reply: {
    text: [WELCOME_MESSAGE],
    chips: QUICK_ACTIONS.map((a) => ({ label: a.label, prompt: a.prompt })),
  },
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const { ids: compareIds } = useCompare();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage()]);
  const [typing, setTyping] = useState(false);

  const convo = useRef<ConversationState>({});
  const compareRef = useRef<string[]>(compareIds);
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);
  const typingRef = useRef(false);

  useEffect(() => {
    compareRef.current = compareIds;
  }, [compareIds]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const send = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text || typingRef.current) return;

    const userId = nextId.current++;
    setMessages((m) => [...m, { id: userId, role: "user", text }]);

    const turn = respond(text, { ...convo.current, compareIds: compareRef.current });
    convo.current = turn.state;

    typingRef.current = true;
    setTyping(true);
    const length = turn.reply.text.join(" ").length;
    const delay = Math.min(1100, 420 + length * 3);
    const timer = window.setTimeout(() => {
      const aiId = nextId.current++;
      setMessages((m) => [...m, { id: aiId, role: "ai", reply: turn.reply }]);
      typingRef.current = false;
      setTyping(false);
    }, delay);
    timers.current.push(timer);
  }, []);

  const open = useCallback(
    (prompt?: string) => {
      setIsOpen(true);
      if (prompt) {
        // Let the panel mount before the message animates in.
        const t = window.setTimeout(() => send(prompt), 60);
        timers.current.push(t);
      }
    },
    [send],
  );

  const close = useCallback(() => setIsOpen(false), []);

  const reset = useCallback(() => {
    convo.current = {};
    typingRef.current = false;
    setTyping(false);
    setMessages([welcomeMessage()]);
  }, []);

  const value = useMemo<ChatApi>(
    () => ({ isOpen, messages, typing, open, close, send, reset }),
    [isOpen, messages, typing, open, close, send, reset],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatApi {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}
