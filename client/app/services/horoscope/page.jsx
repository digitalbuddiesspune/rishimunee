"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/Button.jsx";
import { Markdown } from "../../../components/ui/Markdown.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { apiClient } from "../../../lib/api-client.js";
import { ServiceNav } from "../../../components/services/ServiceNav.jsx";
import LoadingOverlay from "../../../components/ui/LoadingOverlay.jsx";

const zodiacSigns = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces"
];

export default function HoroscopePage() {
  const [sign, setSign] = useState("Aries");
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchHoroscope = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/horoscope?zodiacSign=${encodeURIComponent(sign)}`);
      setHoroscope(data.data.horoscope);
    } catch (error) {
      console.error("Unable to load horoscope", error);
    } finally {
      setLoading(false);
    }
  };

  if (horoscope) {
    return (
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 md:grid-cols-12">
        <aside className="md:col-span-4 lg:col-span-3">
          <ServiceNav />
        </aside>
        <main className="md:col-span-8 lg:col-span-9">
          <Card className="h-[70vh] flex flex-col">
            <CardHeader>
              <CardTitle>Daily Horoscope</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto pr-2">
              <div className="space-y-3 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4 text-sm text-[color:var(--color-text-soft)]">
                {(() => {
                  const d = horoscope.daily || {};
                  const md = [
                    d.summary,
                    d.mood ? `**Mood:** ${d.mood}` : null,
                    d.love ? `**Love:** ${d.love}` : null,
                    d.finance ? `**Finance:** ${d.finance}` : null,
                    d.health ? `**Health:** ${d.health}` : null
                  ].filter(Boolean).join("\n\n");
                  return <Markdown content={md} />;
                })()}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Daily Horoscope</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={sign}
              onChange={(event) => setSign(event.target.value)}
              className="w-full rounded-full border border-[color:var(--color-border)] bg-transparent px-4 py-3 text-sm text-[color:var(--color-text)]"
            >
              {zodiacSigns.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <Button onClick={fetchHoroscope} disabled={loading}>
              {loading ? "Loading..." : "View horoscope"}
            </Button>
          </div>
          <p className="text-sm text-[color:var(--color-text-soft)]">Select your sun sign to receive personalised guidance.</p>
        </CardContent>
      </Card>
      <LoadingOverlay show={loading} label="Loading horoscope..." />
    </div>
  );
}
