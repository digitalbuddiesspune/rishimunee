import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card.jsx";

export const UpcomingSessions = ({ items = [] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Upcoming Sessions</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)]">
      {items.length === 0 && <p>No sessions scheduled. Book an astrologer to secure your slot.</p>}
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3">
          <p className="font-medium text-[color:var(--color-text)]">{item.astrologer}</p>
          <p>{item.date} • {item.time}</p>
        </div>
      ))}
    </CardContent>
  </Card>
);
