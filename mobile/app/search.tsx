import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Card } from "@components/Themed";
import { useThemeColors } from "@theme/index";
import { Header } from "@components/Header";
import { TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function SearchScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const [query, setQuery] = useState("");
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Search" />
      <View style={{ padding: 16 }}>
        <Card>
          <TextInput
            placeholder="Search services or astrologers"
            placeholderTextColor={c.textSoft}
            value={query}
            onChangeText={setQuery}
            style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, color: c.text, marginBottom: 10 }}
          />
          <TouchableOpacity
            onPress={() => {
              // For now, route to Services as a starting point
              router.push("/(tabs)/services");
            }}
            style={{ backgroundColor: c.primary, padding: 12, borderRadius: 12 }}
          >
            <Text style={{ color: c.primaryForeground, textAlign: "center", fontWeight: "700" }}>Search</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </SafeAreaView>
  );
}

