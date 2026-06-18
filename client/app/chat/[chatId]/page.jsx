import { Suspense } from "react";
import ChatClient from "../../../components/chat/ChatClient.jsx";
import RequireAuth from "../../../components/auth/RequireAuth.jsx";

const sampleAstrologers = [
  {
    _id: "ai-arya",
    name: "AI Guru Arya",
    description: "Empathetic Vedic AI advisor",
    specialty: ["Vedic", "Career"],
    pricePerSession: 0,
    languages: ["English", "Hindi"]
  },
  {
    _id: "ai-tara",
    name: "Tarot Sage Tara",
    description: "Tarot insights for love and finances",
    specialty: ["Tarot"],
    pricePerSession: 0,
    languages: ["Hindi"]
  }
];

async function fetchAstrologer(id) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  try {
    const res = await fetch(`${apiBase}/astrologers/${id}`, { cache: "no-store" });
    if (!res.ok) {
      return sampleAstrologers.find((item) => item._id === id) || sampleAstrologers[0];
    }
    const json = await res.json();
    return json.data?.astrologer || sampleAstrologers[0];
  } catch (error) {
    console.error("Failed to fetch astrologer", error);
    return sampleAstrologers.find((item) => item._id === id) || sampleAstrologers[0];
  }
}

async function fetchAstrologers() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  try {
    const res = await fetch(`${apiBase}/astrologers`, { next: { revalidate: 120 } });
    if (!res.ok) return sampleAstrologers;
    const json = await res.json();
    return json.data?.astrologers || sampleAstrologers;
  } catch (error) {
    console.error("Failed to fetch astrologers", error);
    return sampleAstrologers;
  }
}

export default async function ChatSessionPage({ params }) {
  const resolvedParams = await params;
  const chatId = resolvedParams?.chatId;
  const astrologers = await fetchAstrologers();
  const astrologer = await fetchAstrologer(chatId);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12">
      <Suspense fallback={<div className="rounded-3xl border border-[color:var(--color-border)] p-8">Loading chat...</div>}>
        <RequireAuth>
          <ChatClient astrologer={astrologer} astrologers={astrologers} initialAstrologerId={chatId} />
        </RequireAuth>
      </Suspense>
    </div>
  );
}
