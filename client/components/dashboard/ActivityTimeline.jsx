import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card.jsx";

export const ActivityTimeline = ({ items = [] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 text-sm text-[color:var(--color-text-soft)] max-h-[50vh] overflow-y-auto pr-2">
      {items.length === 0 && <p>No recent activity yet. Book a service to get started.</p>}
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3">
          <div className="mt-1 h-2 w-2 rounded-full bg-[color:var(--color-primary)]" />
          <div>
            <p className="text-[color:var(--color-text)]">{item.title}</p>
            <p className="text-xs">{item.date}</p>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);


