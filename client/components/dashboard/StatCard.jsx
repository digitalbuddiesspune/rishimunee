import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card.jsx";

export const StatCard = ({ title, value, description }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-semibold text-[color:var(--color-text)]">{value}</p>
    </CardContent>
  </Card>
);



