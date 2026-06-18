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
import { usePaidNavigationGuard } from "../../../lib/hooks/usePaidNavigationGuard.js";
import LoadingOverlay from "../../../components/ui/LoadingOverlay.jsx";

const defaultValues = {
  bride: { name: "", date: "", time: "", place: "" },
  groom: { name: "", date: "", time: "", place: "" }
};

export default function MatchingServicePage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading…</div>}>
      <MatchingContent />
    </Suspense>
  );
}

function MatchingContent() {
  const dispatch = useDispatch();
  const params = useSearchParams();
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm({ defaultValues });

  const onSubmit = async (values) => {
    try {
      setErrorMessage("");
      await apiClient.post("/payments/initiate", { serviceType: "kundli_matching", gateway: PAYMENT_GATEWAYS.WALLET });
      const payload = {
        bride: values.bride,
        groom: values.groom
      };
      const { data } = await apiClient.post("/kundli/match", payload);
      setResult(data.data);
      dispatch(fetchWallet());
    } catch (error) {
      const message = error.response?.data?.message || "Failed to match kundli";
      setErrorMessage(message.includes("Service") ? `${message} • प्लान अपडेट करें` : message);
    }
  };

  usePaidNavigationGuard({ isPaid: true, hasResult: !!result, clearResult: () => setResult(null), hasPaidFlag: params.get("paid") === "1" });

  if (result) {
    return (
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 md:grid-cols-12">
        <aside className="md:col-span-4 lg:col-span-3">
          <ServiceNav />
        </aside>
        <main className="md:col-span-8 lg:col-span-9">
          <Card className="h-[70vh] flex flex-col">
            <CardHeader>
              <CardTitle>Matching Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)] flex-1 overflow-y-auto pr-2">
              <p className="text-xl font-semibold text-[color:var(--color-text)]">Score: {result.compatibility?.gunasMatched}/36</p>
              <p>{result.compatibility?.compatibilityLevel}</p>
              <Markdown content={result.narrative} />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-12 md:grid-cols-[1.1fr,0.9fr]">
      <LoadingOverlay show={isSubmitting} label="Calculating compatibility..." />
      <Card>
        <CardHeader>
          <CardTitle>Kundli Matching</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-3">
              <p className="text-sm font-medium text-[color:var(--color-text)]">Bride Details</p>
              <Input placeholder="Name" {...register("bride.name", { required: true })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input type="date" {...register("bride.date", { required: true })} />
                <Input type="time" {...register("bride.time", { required: true })} />
              </div>
              <Input placeholder="Place of birth" {...register("bride.place", { required: true })} />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-[color:var(--color-text)]">Groom Details</p>
              <Input placeholder="Name" {...register("groom.name", { required: true })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input type="date" {...register("groom.date", { required: true })} />
                <Input type="time" {...register("groom.time", { required: true })} />
              </div>
              <Input placeholder="Place of birth" {...register("groom.place", { required: true })} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Analysing..." : "Calculate compatibility"}
            </Button>
            {errorMessage && <p className="text-xs text-[color:var(--color-danger)]">{errorMessage}</p>}
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <p>Enter both charts to view Guna matching score and AI recommendations. Wallet balance required.</p>
        </CardContent>
      </Card>
    </div>
  );
}
