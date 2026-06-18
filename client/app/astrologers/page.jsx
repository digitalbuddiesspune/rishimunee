import { AstrologerCard } from "../../components/astrology/AstrologerCard.jsx";

const sampleAstrologers = [
  {
    _id: "sample-1",
    name: "AI Guru Arya",
    description:
      "Empathetic guidance blending Vedic astrology with mindful affirmations.",
    specialty: ["Vedic", "Career"],
    pricePerSession: 699,
    languages: ["English", "Hindi"],
  },
  {
    _id: "sample-2",
    name: "Tarot Sage Tara",
    description:
      "Tarot and numerology based remedies for relationships and finance.",
    specialty: ["Tarot", "Numerology"],
    pricePerSession: 549,
    languages: ["Hindi", "English"],
  },
  {
    _id: "sample-3",
    name: "RisheeMuni Mentor",
    description: "AI astrologer tuned for quick Q&A and daily rituals.",
    specialty: ["AI"],
    pricePerSession: 0,
    languages: ["Multilingual"],
  },
];

async function fetchAstrologers() {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  try {
    const res = await fetch(`${apiBase}/astrologers`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return sampleAstrologers;
    }
    const json = await res.json();
    return json.data?.astrologers || sampleAstrologers;
  } catch (error) {
    console.error("Failed to fetch astrologers", error);
    return sampleAstrologers;
  }
}

export default async function AstrologersPage() {
  const astrologers = await fetchAstrologers();
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12">
      <div>
        <h1 className="text-3xl font-semibold text-[color:var(--color-text)]">
          Astrologers
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--color-text-soft)]">
          Explore our curated panel of AI and real astrologers. Book
          personalised consultations or jump into an instant AI chat.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {astrologers.map((astrologer) => (
          <AstrologerCard key={astrologer._id} astrologer={astrologer} />
        ))}
      </div>
    </div>
  );
}
