"use client";

import { Suspense, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { Button } from "../../../components/ui/Button.jsx";
import { Input, TextArea } from "../../../components/ui/Input.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { Markdown } from "../../../components/ui/Markdown.jsx";
import { apiClient } from "../../../lib/api-client.js";
import { PAYMENT_GATEWAYS } from "../../../lib/wallet/constants.js";
import { fetchWallet } from "../../../lib/store/slices/walletSlice.js";
import { ServiceNav } from "../../../components/services/ServiceNav.jsx";
import { ServiceHistory } from "../../../components/services/ServiceHistory.jsx";
import { usePaidNavigationGuard } from "../../../lib/hooks/usePaidNavigationGuard.js";
import LoadingOverlay from "../../../components/ui/LoadingOverlay.jsx";

export default function BabyNamePage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading…</div>}>
      <BabyNameContent />
    </Suspense>
  );
}

function BabyNameContent() {
  const dispatch = useDispatch();
  const params = useSearchParams();
  const alreadyPaid = params.get("paid") === "1";
  const [result, setResult] = useState(null);
  const [fromHistory, setFromHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { date: "", time: "", place: "", preferences: "" }
  });

  const onSubmit = async (values) => {
    try {
      setErrorMessage("");
      if (!alreadyPaid) {
        await apiClient.post("/payments/initiate", { serviceType: "baby_name", gateway: PAYMENT_GATEWAYS.WALLET });
      }
      const gen = await apiClient.post("/kundli/generate", values);
      const chart = gen?.data?.data?.chart;
      const { data } = await apiClient.post("/kundli/baby-names", { chart, preferences: values.preferences });
      setResult({ suggestions: data?.data?.suggestions || [], narrative: data?.data?.narrative, chart });
      dispatch(fetchWallet());
    } catch (error) {
      const message = error.response?.data?.message || "Failed to get name suggestions";
      setErrorMessage(message.includes("Service") ? `${message} • कृपया प्लान/वॉलेट जांचें` : message);
    }
  };

  usePaidNavigationGuard({ isPaid: true, hasResult: !!result, clearResult: () => setResult(null), hasPaidFlag: alreadyPaid, unlockedOverride: fromHistory });

  if (result) {
    return (
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 md:grid-cols-12">
        <aside className="md:col-span-4 lg:col-span-3">
          <ServiceNav />
          <ServiceHistory serviceType="baby_name" onSelect={(r) => { setFromHistory(true); setResult({ suggestions: r.result?.suggestions || [], narrative: r.result?.narrative, chart: r.result?.chart }); }} />
        </aside>
        <main className="md:col-span-8 lg:col-span-9">
          <Card className="h-[70vh] flex flex-col">
            <CardHeader><CardTitle>Baby Name Suggestions</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)] flex-1 overflow-y-auto pr-2">
              <ul className="list-disc space-y-1 pl-5">
                {result.suggestions.map((s) => (
                  <li key={s} className="text-[color:var(--color-text)]">{s}</li>
                ))}
              </ul>
              {result.narrative && <Markdown content={result.narrative} />}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-12 md:grid-cols-[1.1fr,0.9fr]">
      <Card>
        <CardHeader><CardTitle>Baby Name Suggestions</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="date" {...register("date", { required: true })} />
              <Input type="time" {...register("time", { required: true })} />
            </div>
            <Input placeholder="Place of birth" {...register("place", { required: true })} />
            <TextArea rows={3} placeholder="Preferences (letters, meaning, style, etc.)" {...register("preferences")} />
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Preparing..." : "Get Suggestions"}</Button>
            {errorMessage && <p className="text-xs text-[color:var(--color-danger)]">{errorMessage}</p>}
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>About</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <p>We use birth chart and your preferences to suggest auspicious names.</p>
          {alreadyPaid && <p className="text-xs">Payment confirmed. You can proceed to generate.</p>}
        </CardContent>
      </Card>
      <LoadingOverlay show={isSubmitting} label="Preparing name suggestions..." />
    </div>
  );
}
