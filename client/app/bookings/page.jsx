"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "../../components/ui/Button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { apiClient } from "../../lib/api-client.js";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get("/bookings");
        setBookings(data.data.bookings || []);
      } catch (error) {
        console.error("Failed to load bookings", error);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[color:var(--color-text)]">Bookings</h1>
          <p className="text-sm text-[color:var(--color-text-soft)]">Manage your astrologer appointments and reschedule as needed.</p>
        </div>
        <Button href="/payments/checkout?plan=premium" as="a" variant="outline">
          Upgrade for priority slots
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Schedule a new session</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Astrologer ID" />
          <Input type="date" />
          <Input type="time" />
          <Button className="sm:col-span-2">Request booking</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming bookings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)]">
          {loading && <p>Loading bookings...</p>}
          {!loading && bookings.length === 0 && <p>No bookings yet. Reserve a slot to receive live guidance.</p>}
          {bookings.map((booking) => (
            <div key={booking._id} className="flex flex-col gap-2 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-[color:var(--color-text)]">{booking.astrologerId?.name || "Astrologer"}</p>
                <p>{format(new Date(booking.date), "PPP")} • {booking.timeSlot}</p>
                <p>Status: {booking.status}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Reschedule
                </Button>
                <Button variant="ghost" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}



