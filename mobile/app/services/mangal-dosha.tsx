import React, { useEffect, useState } from "react";
import { View, Text, Card } from "@components/Themed";
import { Header } from "@components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Markdown from "react-native-markdown-display";
import FullScreenLoader from "@components/FullScreenLoader";
import { useThemeColors } from "@theme/index";
import { generateKundli, mangalDosha } from "@services/api/kundli";
import { getServiceBySlug } from "@services/api/services";
import { initiatePayment } from "@services/api/payments";

export default function MangalDoshaScreen() {
  const c = useThemeColors();
  const [form, setForm] = useState({ name: "", date: "", time: "", place: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [servicePrice, setServicePrice] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);
  const [activated, setActivated] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    (async () => {
      try { const svc = await getServiceBySlug("mangal-dosha"); const paid = !!svc?.isPaid; setIsPaid(paid); if (paid) { setServicePrice(svc.basePrice || 0); setActivated(false); } else { setActivated(true); } } catch {}
    })();
  }, []);

  const submit = async () => {
    if (isPaid && !activated) { Alert.alert("Activation required", "Please activate this service first."); return; }
    if (!form.name || !form.date || !form.time || !form.place) { Alert.alert("Missing details", "Please fill all fields"); return; }
    setLoading(true);
    try {
      const kundli = await generateKundli(form);
      const res = await mangalDosha({ chart: kundli.chart });
      setResult(res);
    } catch (e: any) { Alert.alert("Failed", e?.message || "Could not analyze"); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Mangal Dosha" />
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <Card>
            {isPaid && servicePrice !== null && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: "700", marginBottom: 6 }}>Activation</Text>
                <Text soft>Price: Rs {servicePrice}</Text>
                <TouchableOpacity onPress={async () => {
                  setPaying(true);
                  try { await initiatePayment({ serviceType: "mangal_dosha", items: [], gateway: "wallet" }); setActivated(true); Alert.alert("Activated", "Mangal Dosha activated via wallet"); }
                  catch (e: any) { Alert.alert("Payment failed", e?.response?.data?.message || e?.message || ""); }
                  finally { setPaying(false); }
                }} disabled={paying} style={{ backgroundColor: c.primary, padding: 12, borderRadius: 12, marginTop: 8 }}>
                  <Text style={{ color: c.primaryForeground, textAlign: "center", fontWeight: "700" }}>{paying ? "Processing..." : "Activate with Wallet"}</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={{ fontWeight: "700", marginBottom: 8 }}>Enter Birth Details</Text>
            <TextInput placeholder="Name" placeholderTextColor={c.textSoft} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, marginBottom: 8, color: c.text }} />
            <TextInput placeholder="Date (YYYY-MM-DD)" placeholderTextColor={c.textSoft} value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, marginBottom: 8, color: c.text }} />
            <TextInput placeholder="Time (HH:mm)" placeholderTextColor={c.textSoft} value={form.time} onChangeText={(v) => setForm({ ...form, time: v })} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, marginBottom: 8, color: c.text }} />
            <TextInput placeholder="Place" placeholderTextColor={c.textSoft} value={form.place} onChangeText={(v) => setForm({ ...form, place: v })} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, marginBottom: 8, color: c.text }} />
            <TouchableOpacity onPress={submit} disabled={loading || (isPaid && !activated)} style={{ backgroundColor: c.primary, padding: 12, borderRadius: 12, opacity: (isPaid && !activated) ? 0.6 : 1 }}>
              <Text style={{ color: c.primaryForeground, textAlign: "center", fontWeight: "700" }}>{(isPaid && !activated) ? "Activate to Continue" : (loading ? "Analyzing..." : "Analyze Mangal Dosha")}</Text>
            </TouchableOpacity>
          </Card>

          {result && (
            <Card style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "800", marginBottom: 6 }}>Analysis</Text>
              <Markdown style={{ body: { color: c.text } }}>{result.narrative || result?.analysis || ""}</Markdown>
            </Card>
          )}
          {(loading || paying) && <FullScreenLoader label={loading ? "Analyzing..." : "Processing..."} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
