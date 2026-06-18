import React, { useEffect, useState } from "react";
import { View, Text } from "@components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "@theme/index";
import { listAstrologers, type Astrologer } from "@services/api/astrologers";
import { FlatList } from "react-native";
import { GuruCard } from "@components/GuruCard";
import { useRouter } from "expo-router";
import { quoteChatAccess, startChatSession } from "@services/api/chat";
import ConfirmChatAccessModal from "@components/ConfirmChatAccessModal";
import { bi, biTitleFromHeader } from "@theme/strings";

export default function AstrologersTab() {
  const c = useThemeColors();
  const router = useRouter();
  const [data, setData] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedAstro, setSelectedAstro] = useState<Astrologer | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const res = await listAstrologers();
        setData(res);
      } catch (e: any) {
        setError(e?.message || "Failed to load astrologers");
      } finally { setLoading(false); }
    })();
  }, []);

  const startChat = async (astro: Astrologer) => {
    try {
      // Ask for confirmation if needed
      const quote = await quoteChatAccess(astro._id, 5);
      const hasAccess = quote?.data?.hasAccess ?? quote?.hasAccess;
      if (!hasAccess) {
        setSelectedAstro(astro);
        setConfirmOpen(true);
        return;
      }
      const started = await startChatSession({ astrologerId: astro._id });
      const chatId = (started as any)?.data?.chatId || (started as any)?.chatId;
      if (chatId) router.push(`/chat/${chatId}`);
    } catch (e: any) {}
  };

  return (
    <>
    <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", marginBottom: 8 }}>{biTitleFromHeader("Astrologers")}</Text>
        {error && <Text style={{ color: c.danger, marginBottom: 8 }}>{error}</Text>}
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 }}
        renderItem={({ item }) => (
          <GuruCard
            variant="grid"
            name={item.name}
            description={item.description}
            specialty={item.specialty}
            avatar={(item as any).avatar}
            avatarUrl={(item as any).avatarUrl}
            onPress={() => startChat(item)}
          />
        )}
        ListEmptyComponent={loading ? <Text soft style={{ paddingHorizontal: 16 }}>Loading…</Text> : <Text soft style={{ paddingHorizontal: 16 }}>No astrologers found.</Text>}
      />
    </SafeAreaView>
    <ConfirmChatAccessModal
      visible={!!confirmOpen}
      astrologerId={selectedAstro?._id || ""}
      onClose={() => { setConfirmOpen(false); setSelectedAstro(null); }}
      onConfirmed={async () => {
        setConfirmOpen(false);
        const astro = selectedAstro;
        setSelectedAstro(null);
        if (!astro) return;
        try {
          const started = await startChatSession({ astrologerId: astro._id });
          const chatId = (started as any)?.data?.chatId || (started as any)?.chatId;
          if (chatId) router.push(`/chat/${chatId}`);
        } catch {}
      }}
      onInsufficient={() => {
        setConfirmOpen(false);
        setSelectedAstro(null);
        router.push("/(tabs)/wallet");
      }}
    />
    </>
  );
}
