"use client";

import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { adminApiClient } from "../../../lib/admin-api-client.js";

export default function AdminAstrologersPage() {
  const [astrologers, setAstrologers] = useState([]);
  // Creation disabled: admins can only hide/unhide existing astrologers

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch all including hidden for admin view
        const { data } = await adminApiClient.get("/astrologers", { params: { includeHidden: true } });
        setAstrologers(data.data.astrologers || []);
      } catch (error) {
        console.error("Unable to fetch astrologers", error);
      }
    };
    load();
  }, []);

  const toggleVisibility = async (id, currentHidden) => {
    try {
      const { data } = await adminApiClient.put(`/astrologers/${id}`, { isHidden: !currentHidden });
      const updated = data.data?.astrologer;
      setAstrologers((prev) => prev.map((a) => (a._id === id ? updated : a)));
    } catch (error) {
      console.error("Failed to toggle visibility", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[color:var(--color-text)]">Astrologer Management</h1>
      </div>
      {/* Creation removed deliberately */}
      <Card>
        <CardHeader>
          <CardTitle>Existing astrologers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)]">
          {astrologers.map((item) => (
            <div key={item._id} className="flex flex-col gap-2 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-[color:var(--color-text)]">{item.name}</p>
                <p>{item.description}</p>
                {item.isHidden && <p className="mt-1 inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">Hidden</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={item.isHidden ? "primary" : "outline"}
                  size="sm"
                  onClick={() => toggleVisibility(item._id, item.isHidden)}
                >
                  {item.isHidden ? "Make visible" : "Hide"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
