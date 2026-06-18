"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api-client.js";
import { useAppDispatch, useAppSelector } from "../../lib/store/hooks.js";
import { fetchWallet } from "../../lib/store/slices/walletSlice.js";
import { selectChatSessions, setActiveChat, upsertSession } from "../../lib/store/slices/chatSlice.js";
import { ChatWindow } from "./ChatWindow.jsx";
import { ChatSidebar } from "./ChatSidebar.jsx";
import { Button } from "../ui/Button.jsx";

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const isValidObjectId = (s) => typeof s === "string" && /^[a-f\d]{24}$/i.test(s);

const loadHistory = async (chatId, astrologerRef) => {
  const qs = isValidObjectId(astrologerRef)
    ? `astrologerId=${astrologerRef}`
    : `astrologerSlug=${encodeURIComponent(astrologerRef)}`;
  const { data } = await apiClient.get(`/chat/history?${qs}`);
  return data.data.chats?.find((chat) => chat._id === chatId) || data.data.chats?.[0];
};

export default function ChatClient({ astrologer, astrologers, initialAstrologerId }) {
  const [chatId, setChatId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPrice, setConfirmPrice] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(5);
  const confirmResolver = useRef(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sessions = useAppSelector(selectChatSessions);
  const sessionsRef = useRef(sessions);
  // Prevent duplicate initialisation in React 18 Strict Mode
  const initAstroRef = useRef(null);

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      try {
        // If already initialised successfully for this astrologer, skip
        if (initAstroRef.current === astrologer._id) return;
        const payload = isValidObjectId(astrologer._id)
          ? { astrologerId: astrologer._id }
          : { astrologerSlug: astrologer._id };

        const finalize = async (sid) => {
          setChatId(sid);
          dispatch(setActiveChat(sid));
          const existing = sessionsRef.current[sid];
          if (!existing?.messages?.length) {
            const history = await loadHistory(sid, astrologer._id);
            dispatch(upsertSession({ chatId: sid, session: history || { messages: [] } }));
          }
          initAstroRef.current = astrologer._id;
        };

        let sessionId = null;
        try {
          const { data } = await apiClient.post("/chat/start", payload);
          sessionId = data.data.chatId;
          await finalize(sessionId);
          return;
        } catch (err) {
          const status = err?.response?.status;
          const code = err?.response?.data?.details?.code;
          if (status === 402 && (code === "NEED_CONFIRMATION" || code === "PASS_REQUIRED")) {
            try {
              const quote = await apiClient.get(`/chat/access/quote?astrologerId=${astrologer._id}&minutes=${selectedMinutes}`);
              const price = quote?.data?.data?.price ?? 0;
              // show custom modal
              const ok = await new Promise((resolve) => {
                confirmResolver.current = resolve;
                setConfirmPrice(price);
                setConfirmOpen(true);
              });
              if (!ok) {
                router.back();
                return;
              }
              await apiClient.post("/chat/access/confirm", { astrologerId: astrologer._id, minutes: selectedMinutes });
              // Refresh wallet balance after successful debit
              try { await dispatch(fetchWallet()); } catch (_) {}
              const { data } = await apiClient.post("/chat/start", payload);
              sessionId = data.data.chatId;
              await finalize(sessionId);
              return;
            } catch (e) {
              const code2 = e?.response?.data?.details?.code;
              if (e?.response?.status === 402 && code2 === "WALLET_INSUFFICIENT") {
                window.location.href = "/wallet";
                return;
              }
              throw e;
            }
          } else {
            throw err;
          }
        }
        // Shouldn't reach here; included as safety
        if (sessionId) await finalize(sessionId);
      } catch (error) {
        console.error("Unable to start chat", error);
      }
    };

    setup();

    return () => { cancelled = true; };
  }, [astrologer._id, dispatch, selectedMinutes]);

  const sidebarAstrologers = useMemo(() => ensureArray(astrologers), [astrologers]);

  return (
    <div className="grid gap-6 md:grid-cols-12">
      <div className="md:col-span-4 lg:col-span-3">
        <ChatSidebar astrologers={sidebarAstrologers} activeAstrologerId={initialAstrologerId} />
      </div>
      <div className="md:col-span-8 lg:col-span-9">
        {chatId ? (
          <ChatWindow chatId={chatId} astrologer={astrologer} />
        ) : (
          <div className="rounded-3xl border border-[color:var(--color-border)] p-8">Preparing your chat...</div>
        )}
      </div>
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4 shadow-xl">
            <p className="text-sm font-semibold text-[color:var(--color-text)]">Confirm Chat Access</p>
            <p className="mt-2 text-sm text-[color:var(--color-text-soft)]">
              {`Book ${selectedMinutes} min chat. Amount: ₹${confirmPrice}. Deduct from wallet?`}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-[color:var(--color-text-soft)]">Duration:</span>
              {[1,5,10,15,30].map((m) => (
                <button
                  key={m}
                  onClick={async () => {
                    setSelectedMinutes(m);
                    try {
                      const q = await apiClient.get(`/chat/access/quote?astrologerId=${astrologer._id}&minutes=${m}`);
                      setConfirmPrice(q?.data?.data?.price ?? confirmPrice);
                    } catch (_) {}
                  }}
                  className={`px-2 py-1 rounded-md border text-xs ${selectedMinutes===m ? 'bg-[color:var(--color-primary)] text-white border-[color:var(--color-primary)]' : 'border-[color:var(--color-border)] text-[color:var(--color-text)]'}`}
                >{m}m</button>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setConfirmOpen(false); confirmResolver.current?.(false); }}>Cancel</Button>
              <Button size="sm" onClick={() => { setConfirmOpen(false); confirmResolver.current?.(true); }}>Confirm & Continue</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

