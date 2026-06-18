"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
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

export default function KundliServicePage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading…</div>}>
      <KundliContent />
    </Suspense>
  );
}

function KundliContent() {
  const dispatch = useDispatch();
  const params = useSearchParams();
  const [result, setResult] = useState(null);
  const [fromHistory, setFromHistory] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm({ defaultValues: { name: "", date: "", time: "", place: "" } });

  const onSubmit = async (values) => {
    try {
      setErrorMessage("");
      await apiClient.post("/payments/initiate", { serviceType: "kundli", gateway: PAYMENT_GATEWAYS.WALLET });
      const { data } = await apiClient.post("/kundli/generate", values);
      setResult(data.data);
      dispatch(fetchWallet());
    } catch (error) {
      const message = error.response?.data?.message || "Failed to generate kundli";
      setErrorMessage(message.includes("Service") ? `${message} • Admin से संपर्क करें` : message);
    }
  };

  // Prevent navigating to paid result via back/forward without entitlement
  usePaidNavigationGuard({ isPaid: true, hasResult: !!result, clearResult: () => setResult(null), hasPaidFlag: params.get("paid") === "1", unlockedOverride: fromHistory });

  // Show service left panel only when result is available
  if (result) {
    return (
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 md:grid-cols-12">
        <aside className="md:col-span-4 lg:col-span-3">
          <ServiceNav />
          <ServiceHistory serviceType="kundli" onSelect={(r) => { setFromHistory(true); setResult({ chart: r.result?.chart, narrative: r.result?.narrative }); }} />
        </aside>
        <main className="md:col-span-8 lg:col-span-9">
          <Card className="h-[70vh] flex flex-col">
            <CardHeader>
              <CardTitle>Your Kundli Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)] flex-1 overflow-y-auto pr-2">
              <p className="font-medium text-[color:var(--color-text)]">Sun Sign: {result.chart?.zodiacSign}</p>
              <Markdown content={result.narrative} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowRaw((v) => !v)}
                className="mt-2"
              >
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
      <LoadingOverlay show={isSubmitting} label="Generating your Kundli..." />
      <Card>
        <CardHeader>
          <CardTitle>Generate your Kundli</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input placeholder="Full name" {...register("name", { required: true })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="date" {...register("date", { required: true })} />
              <Input type="time" {...register("time", { required: true })} />
            </div>
            <Input placeholder="Place of birth" {...register("place", { required: true })} />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Calculating..." : "Generate Kundli"}
            </Button>
            {errorMessage && <p className="text-xs text-[color:var(--color-danger)]">{errorMessage}</p>}
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <p>Fill in your details to receive the Kundli summary and AI interpretation. Wallet balance required.</p>
        </CardContent>
      </Card>
    </div>
  );
}
