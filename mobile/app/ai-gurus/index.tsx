import React from "react";
import { View, Text } from "@components/Themed";
import { Header } from "@components/Header";
import { TouchableOpacity, Image } from "react-native";
import { useThemeColors } from "@theme/index";
import { startChatSession } from "@services/api/chat";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const GURUS = [
  { slug: "ai-arya", name: "AI Guru Arya", description: "Empathetic Vedic AI advisor" },
  { slug: "ai-tara", name: "Tarot Sage Tara", description: "Tarot insights for love and finances" }
];

export default function AiGurusScreen() {
  const c = useThemeColors();
  const router = useRouter();

  const start = async (slug: string) => {
    try {
      const res = await startChatSession({ astrologerSlug: slug });
      const chatId = (res as any)?.data?.chatId || (res as any)?.chatId;
      if (chatId) router.push(`/chat/${chatId}`);
    } catch {}
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="AI Gurus" />
      <View style={{ padding: 16, gap: 12 }}>
        {GURUS.map((g) => (
          <TouchableOpacity key={g.slug} onPress={() => start(g.slug)} style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 16, padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>{g.name}</Text>
            <Text soft>{g.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
