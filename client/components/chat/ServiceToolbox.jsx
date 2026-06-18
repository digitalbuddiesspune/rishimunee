"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "../../lib/store/hooks.js";
import { Button } from "../ui/Button.jsx";
import { Input, TextArea } from "../ui/Input.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card.jsx";
import { apiClient } from "../../lib/api-client.js";
import { PAYMENT_GATEWAYS } from "../../lib/wallet/constants.js";
import { fetchWallet } from "../../lib/store/slices/walletSlice.js";
import { appendMessage } from "../../lib/store/slices/chatSlice.js";

const SERVICE_MAP = {
  kundli: { type: "kundli", paid: true, title: "Generate Kundli" },
  matching: { type: "kundli_matching", paid: true, title: "Kundli Matching" },
  panchang: { type: "panchang", paid: false, title: "Daily Panchang" },
  horoscope: { type: "daily_horoscope", paid: false, title: "Daily Horoscope" },
  "gochar-phal": { type: "gochar_phal", paid: true, title: "Gochar Phal" },
  "baby-name": { type: "baby_name", paid: true, title: "Baby Name Suggestions" },
  "lal-kitab": { type: "lal_kitab", paid: true, title: "Lal Kitab Horoscope" },
  "mangal-dosha": { type: "mangal_dosha", paid: true, title: "Mangal Dosha Check" },
  "kal-sarp-dosh": { type: "kal_sarp_dosh", paid: true, title: "Kal Sarp Dosh" },
  "career-counselling": { type: "career_counselling", paid: true, title: "Career Counselling" },
  "life-report": { type: "life_report", paid: true, title: "Life Report" },
  "year-analysis": { type: "year_analysis", paid: true, title: "Year Analysis" }
};

export function ServiceToolbox({ chatId, open, onClose }) {
  const params = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [active, setActive] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [serviceInfo, setServiceInfo] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({ slug: "", name: "", price: 0 });
  const confirmResolver = useRef(null);

  // form states
  const [kundli, setKundli] = useState({ name: "", date: "", time: "", place: "" });
  const [matching, setMatching] = useState({ bride: { name: "", date: "", time: "", place: "" }, groom: { name: "", date: "", time: "", place: "" } });
  const [panchang, setPanchang] = useState({ location: "Delhi, India" });
  const [horoscope, setHoroscope] = useState({ zodiacSign: "Aries" });
  const [chartJson, setChartJson] = useState("{}"); // legacy; no longer shown
  const [babyDetails, setBabyDetails] = useState({ name: "", date: "", time: "", place: "" });
  const [lalKitabDetails, setLalKitabDetails] = useState({ name: "", date: "", time: "", place: "" });
  const [mangalDetails, setMangalDetails] = useState({ name: "", date: "", time: "", place: "" });
  const [kalSarpDetails, setKalSarpDetails] = useState({ name: "", date: "", time: "", place: "" });
  const [gocharDetails, setGocharDetails] = useState({ date: "", time: "", place: "" });
  const [genericQuestion, setGenericQuestion] = useState("");

  const initialSlug = params.get("service") || "";
  const alreadyPaid = params.get("paid") === "1";

  useEffect(() => {
    if (initialSlug && SERVICE_MAP[initialSlug]) setActive(initialSlug);
  }, [initialSlug]);

  const title = useMemo(() => (active ? SERVICE_MAP[active]?.title : "Start a Service"), [active]);

  const askConfirm = (data) => {
    return new Promise((resolve) => {
      confirmResolver.current = resolve;
      setConfirmData(data);
      setConfirmOpen(true);
    });
  };

  const ensurePayment = async (slug) => {
    const meta = SERVICE_MAP[slug];
    if (!meta?.paid) return true;
    // If user came with ?paid=1 for this specific service, consume entitlement once
    if (alreadyPaid && slug === initialSlug) {
      await apiClient.post("/orders/consume", { serviceType: meta.type });
      return true;
    }
    // For any other paid service, try consuming; if no entitlement, redirect to checkout
    try {
      await apiClient.post("/orders/consume", { serviceType: meta.type });
      return true;
    } catch (err) {
      if (err.response?.status === 402) {
        try {
          const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
          const res = await fetch(`${apiBase}/services/${encodeURIComponent(slug)}`);
          const json = await res.json();
          const svc = json?.data?.service || {};
          setServiceInfo(svc);
          const price = svc.basePrice ?? 0;
          const ok = await askConfirm({ slug, name: svc.name || SERVICE_MAP[slug]?.title || "Service", price });
          if (!ok) return false;
          setPaying(true);
          await apiClient.post("/payments/initiate", { serviceType: meta.type, gateway: PAYMENT_GATEWAYS.WALLET });
          await apiClient.post("/orders/consume", { serviceType: meta.type });
          dispatch(fetchWallet());
          return true;
        } catch (e) {
          const msg = e.response?.data?.message || "Payment failed or insufficient balance";
          setError(msg);
          return false;
        } finally {
          setPaying(false);
        }
      }
      throw err;
    }
  };

  const appendAssistant = (text) => {
    const msg = { sender: "assistant", text, timestamp: new Date().toISOString() };
    dispatch(appendMessage({ chatId, message: msg }));
  };

  const onRun = async () => {
    if (!active) return;
    try {
      setBusy(true);
      setError("");
      const routeFor = (s) => {
        switch (s) {
          case "kundli":
            return "/services/kundli";
          case "matching":
            return "/services/matching";
          case "panchang":
            return "/services/panchang";
          case "horoscope":
            return "/services/horoscope";
          default:
            return `/services/${s}`;
        }
      };
      router.push(routeFor(active));
      onClose?.();
    } catch (_err) {
      setError("Failed to open service page");
    } finally {
      setBusy(false);
    }
  };
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] shadow-xl max-h-[80vh] overflow-hidden ">
        <div className="flex items-center justify-between gap-10 border-b border-[color:var(--color-border)] px-4 py-3">
          <p className="text-sm font-semibold text-[color:var(--color-text)]">Choose Service</p>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(SERVICE_MAP).map((slug) => (
              <Button
                key={slug}
                size="sm"
                variant={active === slug ? "default" : "outline"}
                onClick={() => setActive(slug)}
              >
                {SERVICE_MAP[slug].title}
              </Button>
            ))}
          </div>
        </div>
        <Card className="border-0 flex flex-col overflow-y-scroll max-h-[60vh]">
          <CardHeader>
            <CardTitle className="text-base">Provide details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 grow pr-1">
            {active === "kundli" && (
              <>
                <Input placeholder="Full name" value={kundli.name} onChange={(e) => setKundli((p) => ({ ...p, name: e.target.value }))} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input type="date" value={kundli.date} onChange={(e) => setKundli((p) => ({ ...p, date: e.target.value }))} />
                  <Input type="time" value={kundli.time} onChange={(e) => setKundli((p) => ({ ...p, time: e.target.value }))} />
                </div>
                <Input placeholder="Place of birth" value={kundli.place} onChange={(e) => setKundli((p) => ({ ...p, place: e.target.value }))} />
              </>
            )}

            {active === "matching" && (
              <>
                <p className="text-xs text-[color:var(--color-text-soft)]">Bride Details</p>
                <Input placeholder="Name" value={matching.bride.name} onChange={(e) => setMatching((p) => ({ ...p, bride: { ...p.bride, name: e.target.value } }))} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input type="date" value={matching.bride.date} onChange={(e) => setMatching((p) => ({ ...p, bride: { ...p.bride, date: e.target.value } }))} />
                  <Input type="time" value={matching.bride.time} onChange={(e) => setMatching((p) => ({ ...p, bride: { ...p.bride, time: e.target.value } }))} />
                </div>
                <Input placeholder="Place of birth" value={matching.bride.place} onChange={(e) => setMatching((p) => ({ ...p, bride: { ...p.bride, place: e.target.value } }))} />

                <p className="mt-2 text-xs text-[color:var(--color-text-soft)]">Groom Details</p>
                <Input placeholder="Name" value={matching.groom.name} onChange={(e) => setMatching((p) => ({ ...p, groom: { ...p.groom, name: e.target.value } }))} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input type="date" value={matching.groom.date} onChange={(e) => setMatching((p) => ({ ...p, groom: { ...p.groom, date: e.target.value } }))} />
                  <Input type="time" value={matching.groom.time} onChange={(e) => setMatching((p) => ({ ...p, groom: { ...p.groom, time: e.target.value } }))} />
                </div>
                <Input placeholder="Place of birth" value={matching.groom.place} onChange={(e) => setMatching((p) => ({ ...p, groom: { ...p.groom, place: e.target.value } }))} />
              </>
            )}

            {active === "panchang" && (
              <Input placeholder="City, Country" value={panchang.location} onChange={(e) => setPanchang({ location: e.target.value })} />
            )}

            {active === "horoscope" && (
              <select
                value={horoscope.zodiacSign}
                onChange={(e) => setHoroscope({ zodiacSign: e.target.value })}
                className="w-full rounded-2xl border border-[color:var(--color-border)] bg-transparent px-4 py-2 text-sm text-[color:var(--color-text)]"
              >
                {["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"].map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            )}

            {active === "gochar-phal" && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input type="date" value={gocharDetails.date} onChange={(e) => setGocharDetails((p) => ({ ...p, date: e.target.value }))} />
                  <Input type="time" value={gocharDetails.time} onChange={(e) => setGocharDetails((p) => ({ ...p, time: e.target.value }))} />
                </div>
                <Input placeholder="Place of birth" value={gocharDetails.place} onChange={(e) => setGocharDetails((p) => ({ ...p, place: e.target.value }))} />
              </>
            )}

            {active === "baby-name" && (
              <>
                {/* <Input placeholder="Full name" value={babyDetails.name} onChange={(e) => setBabyDetails((p) => ({ ...p, name: e.target.value }))} /> */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input type="date" value={babyDetails.date} onChange={(e) => setBabyDetails((p) => ({ ...p, date: e.target.value }))} />
                  <Input type="time" value={babyDetails.time} onChange={(e) => setBabyDetails((p) => ({ ...p, time: e.target.value }))} />
                </div>
                <Input placeholder="Place of birth" value={babyDetails.place} onChange={(e) => setBabyDetails((p) => ({ ...p, place: e.target.value }))} />
              </>
            )}
            {active === "lal-kitab" && (
              <>
                <Input placeholder="Full name" value={lalKitabDetails.name} onChange={(e) => setLalKitabDetails((p) => ({ ...p, name: e.target.value }))} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input type="date" value={lalKitabDetails.date} onChange={(e) => setLalKitabDetails((p) => ({ ...p, date: e.target.value }))} />
                  <Input type="time" value={lalKitabDetails.time} onChange={(e) => setLalKitabDetails((p) => ({ ...p, time: e.target.value }))} />
                </div>
                <Input placeholder="Place of birth" value={lalKitabDetails.place} onChange={(e) => setLalKitabDetails((p) => ({ ...p, place: e.target.value }))} />
              </>
            )}
            {active === "mangal-dosha" && (
              <>
                <Input placeholder="Full name" value={mangalDetails.name} onChange={(e) => setMangalDetails((p) => ({ ...p, name: e.target.value }))} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input type="date" value={mangalDetails.date} onChange={(e) => setMangalDetails((p) => ({ ...p, date: e.target.value }))} />
                  <Input type="time" value={mangalDetails.time} onChange={(e) => setMangalDetails((p) => ({ ...p, time: e.target.value }))} />
                </div>
                <Input placeholder="Place of birth" value={mangalDetails.place} onChange={(e) => setMangalDetails((p) => ({ ...p, place: e.target.value }))} />
              </>
            )}
            {active === "kal-sarp-dosh" && (
              <>
                <Input placeholder="Full name" value={kalSarpDetails.name} onChange={(e) => setKalSarpDetails((p) => ({ ...p, name: e.target.value }))} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input type="date" value={kalSarpDetails.date} onChange={(e) => setKalSarpDetails((p) => ({ ...p, date: e.target.value }))} />
                  <Input type="time" value={kalSarpDetails.time} onChange={(e) => setKalSarpDetails((p) => ({ ...p, time: e.target.value }))} />
                </div>
                <Input placeholder="Place of birth" value={kalSarpDetails.place} onChange={(e) => setKalSarpDetails((p) => ({ ...p, place: e.target.value }))} />
              </>
            )}

            {(active === "career-counselling" || active === "life-report" || active === "year-analysis") && (
              <TextArea rows={4} value={genericQuestion} onChange={(e) => setGenericQuestion(e.target.value)} placeholder="Share your goal or question for this service..." />
            )}

            {serviceInfo && serviceInfo.basePrice > 0 && (
              <p className="text-xs text-[color:var(--color-text-soft)]">Price: ₹{serviceInfo.basePrice}</p>
            )}
            {error && <p className="text-xs text-[color:var(--color-danger)]">{error}</p>}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => onClose?.()}>Cancel</Button>
              <Button onClick={onRun} disabled={busy}>{busy ? "Opening..." : "Open Service Page"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4 shadow-xl">
            <p className="text-sm font-semibold text-[color:var(--color-text)]">Confirm Payment</p>
            <p className="mt-2 text-sm text-[color:var(--color-text-soft)]">
              {`This is a paid service (${confirmData.name}). Amount: ₹${confirmData.price}. Deduct from wallet and continue?`}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setConfirmOpen(false); confirmResolver.current?.(false); }}>Cancel</Button>
              <Button size="sm" onClick={() => { setConfirmOpen(false); confirmResolver.current?.(true); }}>Pay & Continue</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function safeParse(txt) {
  try {
    const obj = JSON.parse(txt || "{}");
    return obj && typeof obj === "object" ? obj : {};
  } catch (_e) {
    return {};
  }
}
