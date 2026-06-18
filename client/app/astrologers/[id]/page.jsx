import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { Avatar } from "../../../components/ui/Avatar.jsx";

const sampleAstrologer = {
  name: "AI Guru Arya",
  description: "Empathetic AI astrologer offering remedies and mindfulness rituals.",
  specialty: ["Vedic", "Career"],
  pricePerSession: 699,
  experienceYears: 12,
  languages: ["English", "Hindi"],
  prompts: { persona: "Kind and insightful" },
  pricePerMinute: 100
};

async function fetchAstrologer(id) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  try {
    const res = await fetch(`${apiBase}/astrologers/${id}`, { cache: "no-store" });
    if (!res.ok) return sampleAstrologer;
    const json = await res.json();
    return json.data?.astrologer || sampleAstrologer;
  } catch (error) {
    console.error("Failed to fetch astrologer", error);
    return sampleAstrologer;
  }
}

export default async function AstrologerProfilePage({ params }) {
  const { id } = await params;
  const astrologer = await fetchAstrologer(id);
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12">
      <Card>
        <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar src={astrologer.avatar} name={astrologer.name} className="h-28 w-28" />
          <div>
            <CardTitle className="text-2xl">{astrologer.name}</CardTitle>
            <CardDescription>{astrologer.description}</CardDescription>
            <div className="mt-4 flex flex-wrap gap-2">
              {astrologer.specialty?.map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-[color:var(--color-text-soft)]">
          {(() => {
            const perMin = astrologer?.pricePerMinute ?? 100;
            return (
              <p>
                Experience: {astrologer.experienceYears || 5}+ years • ₹{perMin}/min chat
              </p>
            );
          })()}
          <p>Languages: {astrologer.languages?.join(", ")}</p>
          <p>Persona: {astrologer.prompts?.persona || "Warm and supportive"}</p>
          <div className="flex gap-3">
            <Button href={`/chat/${id}`} as="a">
              Start AI Chat
            </Button>
            <Button href={`/bookings?astrologer=${id}`} as="a" variant="outline">
              Book a session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
