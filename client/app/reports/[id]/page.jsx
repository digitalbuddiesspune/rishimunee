"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { TextArea } from "../../../components/ui/Input.jsx";
import { Markdown } from "../../../components/ui/Markdown.jsx";
import { apiClient } from "../../../lib/api-client.js";

const SERVICE_TITLES = {
  kundli: "Kundli Report",
  kundli_matching: "Kundli Matching",
  panchang: "Panchang",
  daily_horoscope: "Daily Horoscope",
  horoscope_lal_kitab: "Lal Kitab",
  horoscope_gochar: "Gochar Phal",
  baby_name: "Baby Name Suggestions",
  mangal_dosha: "Mangal Dosha",
  kal_sarp_dosh: "Kal Sarp Dosh",
  career: "Career Counselling",
  career_counselling: "Career Counselling",
  life_report: "Life Report",
  year_analysis: "Year Analysis"
};

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await apiClient.get(`/reports/${params.id}`);
        if (!cancelled) setReport(data?.data?.report || null);
      } catch (e) {
        if (!cancelled) setError("Unable to load report");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const title = report ? (SERVICE_TITLES[report.serviceType] || "Service Report") : "Service Report";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>&larr; Back</Button>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-[color:var(--color-text-soft)]">
          {loading && <p>Loading...</p>}
          {!loading && error && <p className="text-[color:var(--color-danger)]">{error}</p>}
          {!loading && !error && !report && <p>Report not found.</p>}
          {!loading && !error && report && (
            <>
              <p className="text-xs">Created: {new Date(report.createdAt).toLocaleString()}</p>
              {report?.result?.narrative && <Markdown content={report.result.narrative} />}
              {!report?.result?.narrative && (
                <TextArea value={JSON.stringify(report.result, null, 2)} rows={10} readOnly className="font-mono text-xs" />
              )}
              {(report?.result?.chart || report?.payload) && (
                <div>
                  <Button variant="ghost" size="sm" onClick={() => setShowRaw((v) => !v)}>
                    {showRaw ? "Hide raw data" : "Show raw data"}
                  </Button>
                  {showRaw && (
                    <TextArea
                      value={JSON.stringify({ payload: report.payload, result: report.result }, null, 2)}
                      rows={12}
                      readOnly
                      className="mt-2 font-mono text-xs"
                    />
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

