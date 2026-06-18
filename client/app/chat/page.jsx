import Link from "next/link";
import { Badge } from "../../components/ui/Badge.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card.jsx";

const sampleAstrologers = [
  {
    _id: "ai-arya",
    name: "AI Guru Arya",
    description: "Guides career and finance decisions with empathy.",
    specialty: ["Career", "Finance"]
  },
  {
    _id: "ai-tara",
    name: "Tarot Sage Tara",
    description: "Tarot informed answers for love and relationships.",
    specialty: ["Love", "Tarot"]
  }
];

async function fetchAstrologers() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  try {
    const res = await fetch(`${apiBase}/astrologers?type=AI`, { next: { revalidate: 60 } });
    if (!res.ok) return sampleAstrologers;
    const json = await res.json();
    return json.data?.astrologers || sampleAstrologers;
  } catch (error) {
    console.error("Failed to fetch AI astrologers", error);
    return sampleAstrologers;
  }
}

export default async function ChatLanding() {
  const astrologers = await fetchAstrologers();
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12">
      <div>
        <h1 className="text-3xl font-semibold text-[color:var(--color-text)]">AI Astrologer Lounge</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--color-text-soft)]">
          Choose an astrologer persona to begin your consultation. Every session blends your birth details with OpenAI-powered insights.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {astrologers.map((item) => (
          <Card key={item._id}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2 text-xs">
                {item.specialty?.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <Link href={`/chat/${item._id}`} className="text-sm text-[color:var(--color-primary)]">
                Chat now
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}



