import React, { useState } from "react";
import { View, Text, Card } from "@components/Themed";
import { Header } from "@components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, TouchableOpacity } from "react-native";
import { useThemeColors } from "@theme/index";
import { fetchPanchang, type Panchang } from "@services/api/panchang";

export default function PanchangScreen() {
  const c = useThemeColors();
  const [location, setLocation] = useState("Delhi, India");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Panchang | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchPanchang(location);
      setData(res);
    } catch (e: any) {
      setError(e?.message || "Failed to load panchang");
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Panchang" />
      <View style={{ padding: 16 }}>
        <Card>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Location</Text>
          <TextInput value={location} onChangeText={setLocation} placeholder="City, Country" style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, marginBottom: 8, color: c.text }} />
          <TouchableOpacity onPress={load} disabled={loading} style={{ backgroundColor: c.primary, padding: 12, borderRadius: 12 }}>
            <Text style={{ color: c.primaryForeground, textAlign: "center", fontWeight: "700" }}>{loading ? "Loading..." : "Get Panchang"}</Text>
          </TouchableOpacity>
        </Card>

        {error && (
          <Card style={{ marginTop: 12, borderColor: c.danger, borderWidth: 1 }}>
            <Text style={{ color: c.danger, fontWeight: "700" }}>Error</Text>
            <Text soft>{error}</Text>
          </Card>
        )}

        {data && (
          <Card style={{ marginTop: 12 }}>
            {Object.entries(data).map(([k, v]) => (
              <View key={k} style={{ paddingVertical: 4 }}>
                <Text style={{ fontWeight: "600", textTransform: "capitalize" }}>{k.replace(/_/g, " ")}:</Text>
                <Text soft>{String(v)}</Text>
              </View>
            ))}
          </Card>
        )}
      </View>
    </SafeAreaView>
  );
}
