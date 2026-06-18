"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/Button.jsx";
import { Input, TextArea } from "../../../components/ui/Input.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { adminApiClient } from "../../../lib/admin-api-client.js";

export default function AdminContentPage() {
  const [horoscope, setHoroscope] = useState({ zodiacSign: "Aries", narrative: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await adminApiClient.post("/horoscope", { zodiacSign: horoscope.zodiacSign, date: new Date() });
    } catch (error) {
      console.error("Failed to update horoscope", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[color:var(--color-text)]">Content Management</h1>
        <p className="text-sm text-[color:var(--color-text-soft)]">Update daily horoscopes, prompts, and announcements.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daily Horoscope</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input
              value={horoscope.zodiacSign}
              onChange={(event) => setHoroscope((prev) => ({ ...prev, zodiacSign: event.target.value }))}
            />
            <TextArea
              rows={6}
              value={horoscope.narrative}
              onChange={(event) => setHoroscope((prev) => ({ ...prev, narrative: event.target.value }))}
              placeholder="Write or paste horoscope insights..."
            />
            <Button type="submit">Publish</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


