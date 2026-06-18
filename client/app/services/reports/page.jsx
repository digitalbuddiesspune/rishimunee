import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card.jsx";

const reports = [
  {
    title: "Life Report",
    description:
      "12-month roadmap covering finance, career, and relationships with actionable remedies.",
  },
  {
    title: "Career Counselling",
    description:
      "Identify growth periods, ideal industries, and mantra-based remedies.",
  },
  {
    title: "Year Analysis",
    description:
      "Transit analysis with key months, retrograde impacts, and ritual calendar.",
  },
  {
    title: "Baby Name Suggestion",
    description:
      "Name recommendations aligned with nakshatra, numerology, and family preferences.",
  },
];

export default function ReportsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12">
      <div>
        <h1 className="text-3xl font-semibold text-[color:var(--color-text)]">
          Premium Reports
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--color-text-soft)]">
          Deep-dive astrology documents curated by RisheeMuni with human
          oversight. Each report includes personalised rituals and gemstone
          recommendations.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.title}>
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[color:var(--color-text-soft)]">
              {report.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
