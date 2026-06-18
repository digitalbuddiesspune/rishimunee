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

export default function GocharPhalPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading…</div>}>
      <GocharPhalContent />
    </Suspense>
  );
}

function GocharPhalContent() {
  const dispatch = useDispatch();
  const params = useSearchParams();
  const alreadyPaid = params.get("paid") === "1";
  const [result, setResult] = useState(null);
  const [fromHistory, setFromHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { date: "", time: "", place: "", months: 3 }
  });

  const onSubmit = async (values) => {
    try {
      setErrorMessage("");
      if (!alreadyPaid) {
        await apiClient.post("/payments/initiate", { serviceType: "horoscope_gochar", gateway: PAYMENT_GATEWAYS.WALLET });
      }
      const payload = { date: values.date, time: values.time, place: values.place, months: Number(values.months) };
      const { data } = await apiClient.post("/kundli/gochar", payload);
      setResult({ narrative: data?.data?.narrative, timeline: data?.data?.timeline });
      dispatch(fetchWallet());
    } catch (error) {
      const message = error.response?.data?.message || "Failed to generate Gochar Phal";
      setErrorMessage(message.includes("Service") ? `${message} • कृपया प्लान/वॉलेट जांचें` : message);
    }
  };

  usePaidNavigationGuard({ isPaid: true, hasResult: !!result, clearResult: () => setResult(null), hasPaidFlag: alreadyPaid, unlockedOverride: fromHistory });

  if (result) {
    return (
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 md:grid-cols-12">
        <aside className="md:col-span-4 lg:col-span-3">
          <ServiceNav />
          <ServiceHistory serviceType="gochar_phal" onSelect={(r) => { setFromHistory(true); setResult({ narrative: r.result?.narrative, timeline: r.result?.timeline }); }} />
        </aside>
        <main className="md:col-span-8 lg:col-span-9">
          <Card className="h-[70vh] flex flex-col">
            <CardHeader><CardTitle>Gochar Phal</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)] flex-1 overflow-y-auto pr-2">
              <Markdown content={result.narrative} />
              {Array.isArray(result.timeline) && result.timeline.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[color:var(--color-text)]">Timeline</p>
                  <ul className="list-disc space-y-1 pl-5">
                    {result.timeline.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
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
        <CardHeader><CardTitle>Gochar Phal</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="date" {...register("date", { required: true })} />
              <Input type="time" {...register("time", { required: true })} />
            </div>
            <Input placeholder="Place of birth" {...register("place", { required: true })} />
            <Input type="number" min={1} max={12} {...register("months", { valueAsNumber: true })} placeholder="Months (1-12)" />
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Working..." : "Generate"}</Button>
            {errorMessage && <p className="text-xs text-[color:var(--color-danger)]">{errorMessage}</p>}
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>About</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <p>Transit based prediction for major planetary movements. Select months for the forecast window.</p>
          {alreadyPaid && <p className="text-xs">Payment confirmed. You can proceed to generate.</p>}
        </CardContent>
      </Card>
      <LoadingOverlay show={isSubmitting} label="Generating gochar phal..." />
    </div>
  );
}
