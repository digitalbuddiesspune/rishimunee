import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "@components/Themed";
import { TouchableOpacity } from "react-native";
import { Header } from "@components/Header";
import { useThemeColors } from "@theme/index";
import VoiceChatPanel from "@components/VoiceChatPanel";
import { fetchChatHistory } from "@services/api/chat";

export default function CallScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const c = useThemeColors();
  const [astrologerId, setAstrologerId] = useState<string | null>(null);
  const [astrologerName, setAstrologerName] = useState<string>("Astrologer");
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchChatHistory();
        const chats = (res as any)?.data?.chats || (res as any)?.chats || [];
        const chat = chats.find((x: any) => String(x._id) === String(chatId));
        if (chat?.astrologerId) setAstrologerId(String(chat.astrologerId));
        if (chat?.astrologerName || chat?.astrologer?.name) setAstrologerName(chat.astrologerName || chat.astrologer?.name);
      } catch {}
    })();
  }, [chatId]);

  useEffect(() => {
    if (status === "connected") {
      timerRef.current && clearInterval(timerRef.current as any);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (status === "idle" || status === "error") {
      timerRef.current && clearInterval(timerRef.current as any);
    }
    return () => { try { timerRef.current && clearInterval(timerRef.current as any); } catch {} };
  }, [status]);

  const timeText = useMemo(() => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [seconds]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.surface }}>
      <Header title="Voice Call" />
      <View style={{ flex: 1, padding: 16, gap: 12 }}>
        <View style={{ alignItems: "center", paddingVertical: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: "800" }}>{astrologerName}</Text>
          <Text soft>
            {status === "connected"
              ? `On call • ${timeText}`
              : status === "connecting"
                ? "Connecting…"
                : status === "error"
                  ? "Connection error"
                  : "Ready"}
          </Text>
        </View>
        <View style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 16, padding: 12 }}>
          <VoiceChatPanel astrologerId={astrologerId} compact onStatusChange={setStatus} />
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ alignItems: "center", paddingBottom: 16 }}>
          <Text soft style={{ fontSize: 12 }}>Your wallet will be debited per minute when applicable.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
