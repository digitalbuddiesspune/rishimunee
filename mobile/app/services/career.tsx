import React, { useEffect, useState } from "react";
import { View, Text, Card } from "@components/Themed";
import { Header } from "@components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Markdown from "react-native-markdown-display";
import FullScreenLoader from "@components/FullScreenLoader";
import { useThemeColors } from "@theme/index";
import { getServiceBySlug } from "@services/api/services";
import { initiatePayment } from "@services/api/payments";
import { generateCareerReport } from "@services/api/serviceReports";

export default function CareerCounsellingScreen() {
  const c = useThemeColors();
  const [focus, setFocus] = useState("");
  const [form, setForm] = useState({ name: "", date: "", time: "", place: "" });
  const [servicePrice, setServicePrice] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);
  const [activated, setActivated] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try { const svc = await getServiceBySlug("career-counselling"); const paid = !!svc?.isPaid; setIsPaid(paid); if (paid) { setServicePrice(svc.basePrice || 0); setActivated(false); } else { setActivated(true); } } catch {}
    })();
  }, []);

  const submit = async () => {
    if (isPaid && !activated) { Alert.alert("Activation required", "Please activate with wallet first."); return; }
    if (!form.name || !form.date || !form.time || !form.place) { Alert.alert("Missing details", "Please fill name, date, time and place"); return; }
    setSubmitting(true);
    setResult(null);
    try {
      const data = await generateCareerReport({ focus, ...form });
      setResult(data.narrative || "");
    } catch (e: any) {
      Alert.alert("Failed", e?.response?.data?.message || e?.message || "Could not generate report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Career Counselling (कैरियर परामर्श)" />
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <Card>
            {isPaid && servicePrice !== null && !activated && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: "700", marginBottom: 6 }}>Activation (सक्रियण)</Text>
                <Text soft>Price (कीमत): ₹{servicePrice}</Text>
                <TouchableOpacity onPress={async () => {
                  setPaying(true);
                  try { await initiatePayment({ serviceType: "career_counselling", items: [], gateway: "wallet" }); setActivated(true); Alert.alert("Activated", "Career counselling activated via wallet"); }
                  catch (e: any) { Alert.alert("Payment failed", e?.response?.data?.message || e?.message || ""); }
                  finally { setPaying(false); }
                }} disabled={paying} style={{ backgroundColor: c.primary, padding: 12, borderRadius: 12, marginTop: 8 }}>
                  <Text style={{ color: c.primaryForeground, textAlign: "center", fontWeight: "700" }}>{paying ? "Processing... (प्रोसेस हो रहा है)" : "Activate with Wallet (वॉलेट से सक्रिय करें)"}</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={{ fontWeight: "700", marginBottom: 8 }}>Enter Birth Details (जन्म विवरण भरें)</Text>
            <TextInput placeholder="Name (नाम)" placeholderTextColor={c.textSoft} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, marginBottom: 8, color: c.text }} />
            <TextInput placeholder="Date (YYYY-MM-DD) • तारीख" placeholderTextColor={c.textSoft} value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, marginBottom: 8, color: c.text }} />
            <TextInput placeholder="Time (HH:mm) • समय" placeholderTextColor={c.textSoft} value={form.time} onChangeText={(v) => setForm({ ...form, time: v })} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, marginBottom: 8, color: c.text }} />
            <TextInput placeholder="Place (स्थान)" placeholderTextColor={c.textSoft} value={form.place} onChangeText={(v) => setForm({ ...form, place: v })} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, marginBottom: 8, color: c.text }} />
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>Your Focus Areas (आपके फोकस क्षेत्र)</Text>
            <TextInput placeholder="e.g., Promotion timeline, ideal roles, industry switch • जैसे: प्रमोशन टाइमलाइन, आदर्श भूमिकाएँ, इंडस्ट्री स्विच" placeholderTextColor={c.textSoft} value={focus} onChangeText={setFocus} multiline numberOfLines={4} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, color: c.text, minHeight: 100 }} />
            <TouchableOpacity onPress={submit} disabled={isPaid && !activated} style={{ backgroundColor: c.primary, padding: 12, borderRadius: 12, marginTop: 12, opacity: (isPaid && !activated) ? 0.6 : 1 }}>
              <Text style={{ color: c.primaryForeground, textAlign: "center", fontWeight: "700" }}>{(isPaid && !activated) ? "Activate to Continue (पहले सक्रिय करें)" : "Submit Request (अनुरोध भेजें)"}</Text>
            </TouchableOpacity>
            {result && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontWeight: "800", fontSize: 16, marginBottom: 6 }}>Your Report (आपकी रिपोर्ट)</Text>
                <Markdown style={{ body: { color: c.text }, paragraph: { color: c.text } }}>{result}</Markdown>
              </View>
            )}
            <Markdown style={{ body: { color: c.text }, paragraph: { color: c.text } }}>
{`We’ll generate a tailored report and add it to your **Reports** section.`}
            </Markdown>
          </Card>
          {(paying || submitting) && <FullScreenLoader label={paying ? "Processing... (प्रोसेस हो रहा है)" : "Submitting... (भेजा जा रहा है)"} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
