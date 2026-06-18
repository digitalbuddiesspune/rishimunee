import React, { useEffect, useState } from "react";
import { View, Text, Card } from "@components/Themed";
import { Header } from "@components/Header";
import { useThemeColors } from "@theme/index";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchHoroscope, type HoroscopeRecord } from "@services/api/horoscope";
import { TouchableOpacity, ScrollView } from "react-native";
import Markdown from "react-native-markdown-display";

export default function HoroscopeScreen() {
  const c = useThemeColors();
  const SIGNS = [
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpio",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces",
  ];
  const [active, setActive] = useState<string>("aries");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<HoroscopeRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async (sign: string) => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetchHoroscope(sign);
      setRecord(r);
    } catch (e: any) {
      setError(e?.message || "Failed to load horoscope");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(active);
  }, [active]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Daily Horoscope (दैनिक राशिफल)" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 12,
          }}
        >
          {SIGNS.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setActive(s)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 16,
                backgroundColor: active === s ? c.primary : c.card,
                borderWidth: 1,
                borderColor: c.border,
              }}
            >
              <Text
                style={{
                  color: active === s ? c.primaryForeground : c.text,
                  fontWeight: "700",
                  textTransform: "capitalize",
                }}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card>
          {loading ? (
            <Text soft>Loading... (लोड हो रहा है)</Text>
          ) : error ? (
            <>
              <Text style={{ color: c.danger, fontWeight: "700" }}>Error (त्रुटि)</Text>
              <Text soft>{error}</Text>
            </>
          ) : record ? (
            <>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  textTransform: "capitalize",
                  marginBottom: 8,
                }}
              >
                {record.zodiacSign} - {new Date(record.date).toDateString()}
              </Text>
              <Markdown style={{ body: { color: c.text } }}>{record.daily.summary || ""}</Markdown>
              <View style={{ marginTop: 12 }}>
                <Text soft>Mood (मूड): {record.daily.mood}</Text>
                <Text soft>Love (प्रेम): {record.daily.love}</Text>
                <Text soft>Finance (वित्त): {record.daily.finance}</Text>
                <Text soft>Health (स्वास्थ्य): {record.daily.health}</Text>
              </View>
            </>
          ) : (
            <Text soft>No data (कोई डेटा नहीं)</Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
