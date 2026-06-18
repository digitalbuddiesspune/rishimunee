"use client";

import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../lib/store/hooks.js";
import { appendMessage, selectChatSessionById, upsertSession, updateLastMessageText } from "../../lib/store/slices/chatSlice.js";
import { apiClient } from "../../lib/api-client.js";
import { Button } from "../ui/Button.jsx";
import { Avatar } from "../ui/Avatar.jsx";
import { TextArea } from "../ui/Input.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import VoiceChatPanel from "./VoiceChatPanel.jsx";
// ServiceToolbox removed from chat panel per product request
// import { ServiceToolbox } from "./ServiceToolbox.jsx";
// import { useSearchParams } from "next/navigation";

export const ChatWindow = ({ chatId, astrologer }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  // Toolbox removed; keep chat simple
  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => selectChatSessionById(state, chatId));
  const scrollContainerRef = useRef(null);

  const scrollToBottom = (behavior = "smooth") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // Ensure layout is ready before scrolling
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior });
    });
  };

  // Auto-scroll on mount and whenever messages update (including streaming)
  useEffect(() => {
    // Use instant scroll for very first paint to avoid jank
    scrollToBottom("auto");
  }, []);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [session?.messages]);

  // Removed service picker from chat

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const estimateInitialPause = (userText = "", replyText = "") => {
    const lengthFactor = Math.min(2000, Math.max(300, userText.length * 8));
    const trickyRegex = /(when|exact|marriage|career|promotion|lottery|win|visa|court|tricky|hard|difficult|why|how|kundli|mangal|dosha|gochar|sade sati)/i;
    const trickyBoost = trickyRegex.test(userText) ? 800 : 0;
    const veryLongBoost = replyText.length > 800 ? 600 : replyText.length > 400 ? 300 : 0;
    return lengthFactor + trickyBoost + veryLongBoost;
  };

  const handleSend = async () => {
    if (!input.trim() || !chatId) return;
    const message = { sender: "user", text: input.trim(), timestamp: new Date().toISOString() };
    dispatch(appendMessage({ chatId, message }));
    setInput("");
    try {
      setLoading(true);
      // Append a placeholder assistant message to update incrementally
      const placeholder = { sender: "astrologer", text: "", timestamp: new Date().toISOString() };
      dispatch(appendMessage({ chatId, message: placeholder }));
      // Show a quick typing indicator while waiting for backend
      let dots = 0;
      let dotsTimer = setInterval(() => {
        dots = (dots + 1) % 4;
        const t = dots === 0 ? "" : ".".repeat(dots);
        dispatch(updateLastMessageText({ chatId, text: t }));
      }, 450);

      // Non-streaming: request full reply; show typing indicator until it arrives
      const { data } = await apiClient.post(`/chat/${chatId}/messages`, { message: message.text });
      const full = data?.data?.reply || "";
      try { clearInterval(dotsTimer); } catch (_) {}
      // Immediately render the complete response (no incremental streaming)
      dispatch(updateLastMessageText({ chatId, text: full }));
    } catch (error) {
      console.error("Failed to send message", error);
      // Replace the placeholder with an error message if failed
      dispatch(updateLastMessageText({ chatId, text: "Sorry, I couldn't respond right now." }));
    } finally {
      try { clearInterval(dotsTimer); } catch (_) {}
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[600px] flex-col rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)]">
      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--color-border)] px-6 py-4">
        <Avatar src={astrologer?.avatar} name={astrologer?.name} className="h-12 w-12" />
        <div className="flex-1">
          <p className="font-medium text-[color:var(--color-text)]">{astrologer?.name || "AI Astrologer"}</p>
          <p className="text-xs text-[color:var(--color-text-soft)]">{astrologer?.description || "Always here to guide you"}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowVoice((v) => !v)}>
          {showVoice ? "Hide Voice" : "Voice"}
        </Button>
      </div>
      {/* ServiceToolbox removed */}
      {showVoice && (
        <div className="px-6 pt-4">
          <VoiceChatPanel astrologerId={astrologer?._id} />
        </div>
      )}
      <div ref={scrollContainerRef} className="flex-1 space-y-4 overflow-y-auto no-scrollbar px-6 py-4">
        {(session?.messages || []).map((msg, index) => (
          <div key={`${msg.timestamp}-${index}`} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.sender === "user"
                  ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
                  : "bg-[color:var(--color-surface)] text-[color:var(--color-text)]"
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{msg.text || ""}</ReactMarkdown>
            </div>
          </div>
        ))}
        {!session?.messages?.length && (
          <div className="flex h-full items-center justify-center text-sm text-[color:var(--color-text-soft)]">
            Ask your question to begin the guidance session.
          </div>
        )}
      </div>
      <div className="border-t border-[color:var(--color-border)] p-4">
        <div className="flex items-center gap-3">
          <TextArea
            rows={2}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Share your question or birth details..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={loading} className="whitespace-nowrap">
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};
