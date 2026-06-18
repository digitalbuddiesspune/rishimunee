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
import { generateKundli, matchKundli } from "@services/api/kundli";

export default function MatchingScreen() {
  const c = useThemeColors();
  const [bride, setBride] = useState({ name: "", date: "", time: "", place: "" });
  const [groom, setGroom] = useState({ name: "", date: "", time: "", place: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [servicePrice, setServicePrice] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);
  const [activated, setActivated] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const svc = await getServiceBySlug("matching");
        const paid = !!svc?.isPaid;
        setIsPaid(paid);
        if (paid) { setServicePrice(svc.basePrice || 0); setActivated(false); } else { setActivated(true); }
      } catch {}
    })();
  }, []);

  const submit = async () => {
    if (isPaid && !activated) { Alert.alert("Activation required", "Please activate with wallet first."); return; }
    if (!bride.name || !bride.date || !bride.time || !bride.place || !groom.name || !groom.date || !groom.time || !groom.place) {
      Alert.alert("Missing details", "Please fill all fields for both profiles");
      return;
    }
    setLoading(true);
    try {
      const res = await matchKundli({ bride, groom });
      setResult(res);
    } catch (e: any) {
      Alert.alert("Failed", e?.message || "Could not compute matching");
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Kundli Matching" />
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <Card>
            {isPaid && servicePrice !== null && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: "700", marginBottom: 6 }}>Activation</Text>
                <Text soft>Price: Rs {servicePrice}</Text>
                <TouchableOpacity onPress={async () => {
                  setPaying(true);
                  try { await initiatePayment({ serviceType: "kundli_matching", items: [], gateway: "wallet" }); setActivated(true); Alert.alert("Activated", "Matching activated via wallet"); }
                  catch (e: any) { Alert.alert("Payment failed", e?.response?.data?.message || e?.message || ""); }
                  finally { setPaying(false); }
                }} disabled={paying} style={{ backgroundColor: c.primary, padding: 12, borderRadius: 12, marginTop: 8 }}>
                  <Text style={{ color: c.primaryForeground, textAlign: "center", fontWeight: "700" }}>{paying ? "Processing..." : "Activate with Wallet"}</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={{ fontWeight: "700", marginBottom: 8 }}>Bride Details</Text>
            <TextInput placeholder="Name" placeholderTextColor={c.textSoft} value={bride.name} onChangeText={(v) => setBride({ ...bride, name: v })} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, marginBottom: 8, color: c.text }} />
            <TextInput placeholder="Date (YYYY-MM-DD)" placeholderTextColor={c.textSoft} value={bride.date} onChangeText={(v) => setBride({ ...bride, date: v })} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, marginBottom: 8, color: c.text }} />
            <TextInput placeholder="Time (HH:mm)" placeholderTextColor={c.textSoft} value={bride.time} onChangeText={(v) => setBride({ ...bride, time: v })} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, marginBottom: 8, color: c.text }} />
            <TextInput placeholder="Place" placeholderTextColor={c.textSoft} value={bride.place} onChangeText={(v) => setBride({ ...bride, place: v })} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, marginBottom: 8, color: c.text }} />

            <Text style={{ fontWeight: "700", marginVertical: 8 }}>Groom Details</Text>
            <TextInput placeholder="Name" placeholderTextColor={c.textSoft} value={groom.name} onChangeText={(v) => setGroom({ ...groom, name: v })} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, marginBottom: 8, color: c.text }} />
            <TextInput placeholder="Date (YYYY-MM-DD)" placeholderTextColor={c.textSoft} value={groom.date} onChangeText={(v) => setGroom({ ...groom, date: v })} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, marginBottom: 8, color: c.text }} />
            <TextInput placeholder="Time (HH:mm)" placeholderTextColor={c.textSoft} value={groom.time} onChangeText={(v) => setGroom({ ...groom, time: v })} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, marginBottom: 8, color: c.text }} />
            <TextInput placeholder="Place" placeholderTextColor={c.textSoft} value={groom.place} onChangeText={(v) => setGroom({ ...groom, place: v })} style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, marginBottom: 8, color: c.text }} />

            <TouchableOpacity onPress={submit} disabled={loading || (isPaid && !activated)} style={{ backgroundColor: c.primary, padding: 12, borderRadius: 12, opacity: (isPaid && !activated) ? 0.6 : 1 }}>
              <Text style={{ color: c.primaryForeground, textAlign: "center", fontWeight: "700" }}>{(isPaid && !activated) ? "Activate to Continue" : (loading ? "Checking..." : "Check Compatibility")}</Text>
            </TouchableOpacity>
          </Card>

          {result && (
            <Card style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "800", marginBottom: 6 }}>Compatibility Result</Text>
              {result.compatibility && <Text soft>Score: {result.compatibility?.score ?? "—"}</Text>}
              <Markdown style={{ body: { color: c.text }, paragraph: { color: c.text } }}>
                {result.narrative || result?.result?.narrative || ""}
              </Markdown>
            </Card>
          )}
          {(loading || paying) && <FullScreenLoader label={loading ? "Checking..." : "Processing..."} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
