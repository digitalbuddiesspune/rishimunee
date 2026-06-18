import React, { useEffect, useState } from "react";
import { View, Text, Card } from "@components/Themed";
import { Header } from "@components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity, ScrollView } from "react-native";
import Markdown from "react-native-markdown-display";
import { useThemeColors } from "@theme/index";
import { fetchHoroscope, type HoroscopeRecord } from "@services/api/horoscope";

export default function LalKitabScreen() {
  const c = useThemeColors();
  const SIGNS = [
    "aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"
  ];
  const [active, setActive] = useState<string>("aries");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<HoroscopeRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async (sign: string) => {
    setLoading(true); setError(null);
    try {
      const r = await fetchHoroscope(sign);
      setRecord(r);
    } catch (e: any) {
      setError(e?.message || "Failed to load Lal Kitab horoscope");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(active); }, [active]);

  const content = (record as any)?.lalKitab || record?.daily?.summary || "";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Lal Kitab Horoscope" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {SIGNS.map((s) => (
            <TouchableOpacity key={s} onPress={() => setActive(s)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, backgroundColor: active === s ? c.primary : c.card, borderWidth: 1, borderColor: c.border }}>
              <Text style={{ color: active === s ? c.primaryForeground : c.text, fontWeight: "700", textTransform: "capitalize" }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card>
          {loading ? (
            <Text soft>Loading…</Text>
          ) : error ? (
            <>
              <Text style={{ color: c.danger, fontWeight: "700" }}>Error</Text>
              <Text soft>{error}</Text>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 8, textTransform: "capitalize" }}>{active} — {record ? new Date(record.date).toDateString() : "Today"}</Text>
              <Markdown style={{ body: { color: c.text } }}>{content || ""}</Markdown>
            </>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
