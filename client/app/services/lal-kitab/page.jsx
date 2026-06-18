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

export default function LalKitabPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading…</div>}>
      <LalKitabContent />
    </Suspense>
  );
}

function LalKitabContent() {
  const dispatch = useDispatch();
  const params = useSearchParams();
  const alreadyPaid = params.get("paid") === "1";
  const [result, setResult] = useState(null);
  const [fromHistory, setFromHistory] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: { name: "", date: "", time: "", place: "" } });

  const onSubmit = async (values) => {
    try {
      setErrorMessage("");
      if (!alreadyPaid) {
        await apiClient.post("/payments/initiate", { serviceType: "lal_kitab", gateway: PAYMENT_GATEWAYS.WALLET });
      }
      const gen = await apiClient.post("/kundli/generate", values);
      const chart = gen?.data?.data?.chart;
      const { data } = await apiClient.post("/kundli/lal-kitab", { chart });
      setResult({ chart, narrative: data?.data?.narrative });
      dispatch(fetchWallet());
    } catch (error) {
      const message = error.response?.data?.message || "Failed to generate Lal Kitab Horoscope";
      setErrorMessage(message.includes("Service") ? `${message} • कृपया प्लान/वॉलेट जांचें` : message);
    }
  };

  usePaidNavigationGuard({ isPaid: true, hasResult: !!result, clearResult: () => setResult(null), hasPaidFlag: alreadyPaid, unlockedOverride: fromHistory });

  if (result) {
    return (
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 md:grid-cols-12">
        <aside className="md:col-span-4 lg:col-span-3">
          <ServiceNav />
          <ServiceHistory serviceType="lal_kitab" onSelect={(r) => { setFromHistory(true); setResult({ chart: r.result?.chart || null, narrative: r.result?.narrative }); }} />
        </aside>
        <main className="md:col-span-8 lg:col-span-9">
          <Card className="h-[70vh] flex flex-col">
            <CardHeader><CardTitle>Lal Kitab Horoscope</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)] flex-1 overflow-y-auto pr-2">
              <Markdown content={result.narrative} />
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowRaw((v) => !v)} className="mt-2">
                {showRaw ? "Hide raw chart data" : "Show raw chart data"}
              </Button>
              {showRaw && (
                <TextArea value={JSON.stringify(result.chart, null, 2)} rows={8} readOnly className="font-mono text-xs" />
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-12 md:grid-cols-[1.1fr,0.9fr]">
      <Card>
        <CardHeader><CardTitle>Lal Kitab Horoscope</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input placeholder="Full name" {...register("name", { required: true })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="date" {...register("date", { required: true })} />
              <Input type="time" {...register("time", { required: true })} />
            </div>
            <Input placeholder="Place of birth" {...register("place", { required: true })} />
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Working..." : "Generate"}</Button>
            {errorMessage && <p className="text-xs text-[color:var(--color-danger)]">{errorMessage}</p>}
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>About</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <p>Generate Lal Kitab styled insights based on your birth chart.</p>
          {alreadyPaid && <p className="text-xs">Payment confirmed. You can proceed to generate.</p>}
        </CardContent>
      </Card>
      <LoadingOverlay show={isSubmitting} label="Generating Lal Kitab report..." />
    </div>
  );
}
