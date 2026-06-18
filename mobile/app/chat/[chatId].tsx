import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text } from "@components/Themed";
import { FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useThemeColors } from "@theme/index";
import { fetchChatHistory, sendChatMessage } from "@services/api/chat";
import { Header } from "@components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import Markdown from "react-native-markdown-display";
import ConfirmChatAccessModal from "@components/ConfirmChatAccessModal";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type Message = { _id?: string; sender: "user" | "astrologer"; text: string };

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const c = useThemeColors();
  const [messages, setMessages] = useState<Message[]>([]);
  const [astrologerId, setAstrologerId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const listRef = useRef<FlatList>(null);
  const router = useRouter();

  useEffect(() => {
    // Load chat from history if needed (basic)
    (async () => {
      try {
        const res = await fetchChatHistory();
        const chat = (res as any)?.data?.chats?.find((c: any) => String(c._id) === String(chatId));
        if (chat?.messages) setMessages(chat.messages);
        if (chat?.astrologerId) setAstrologerId(String(chat.astrologerId));
      } catch {}
    })();
  }, [chatId]);

  const onSend = async () => {
    const content = text.trim();
    if (!content) return;
    const local: Message = { sender: "user", text: content };
    setMessages((prev) => [...prev, local]);
    setText("");
    setSending(true);
    try {
      const res = await sendChatMessage(String(chatId), content);
      const reply = (res as any)?.data?.reply || (res as any)?.reply;
      if (reply) {
        setMessages((prev) => [...prev, { sender: "astrologer", text: reply }]);
      }
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (e: any) {
      const status = e?.response?.status;
      const code = e?.response?.data?.details?.code || e?.response?.data?.code;
      if (status === 402 && (code === "PASS_REQUIRED" || code === "NEED_CONFIRMATION") && astrologerId) {
        // Open confirmation modal; on success we will retry send from handler
        setConfirmOpen(true);
        // Restore the user's message in input for retry UX
        setText(content);
        // Remove the just-added user message since request failed before assistant reply
        setMessages((prev) => prev.slice(0, Math.max(0, prev.length - 1)));
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Chat" right={
        <TouchableOpacity onPress={() => router.push(`/call/${chatId}`)} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="call" size={18} color={c.primary} />
          <Text style={{ color: c.primary, fontWeight: "700" }}>Call</Text>
        </TouchableOpacity>
      } />
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1 }}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
          renderItem={({ item }) => (
            <View
              style={{
                alignSelf: item.sender === "user" ? "flex-end" : "flex-start",
                backgroundColor: item.sender === "user" ? c.primary : c.card,
                borderRadius: 18,
                paddingHorizontal: 14,
                paddingVertical: 10,
                marginVertical: 6,
                maxWidth: "82%",
                borderWidth: item.sender === "user" ? 0 : 1,
                borderColor: c.border,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 }
              }}
            >
              {item.sender === "astrologer" ? (
                <Markdown
                  style={{
                    body: { color: c.text },
                    text: { color: c.text },
                    paragraph: { color: c.text, lineHeight: 20 },
                    strong: { color: c.text },
                    bullet_list: { color: c.text },
                    ordered_list: { color: c.text },
                    code_inline: { backgroundColor: c.surface, color: c.text },
                    code_block: { backgroundColor: c.surface, color: c.text, padding: 8, borderRadius: 8 },
                    fence: { backgroundColor: c.surface, color: c.text, padding: 8, borderRadius: 8 }
                  }}
                >
                  {item.text || ""}
                </Markdown>
              ) : (
                <Text style={{ color: c.primaryForeground }}>{item.text}</Text>
              )}
            </View>
          )}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={{ flexDirection: "row", gap: 8, padding: 12, backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.border }}>
          <TextInput
            multiline
            numberOfLines={4}
            style={{ flex: 1, minHeight: 48, maxHeight: 140, borderWidth: 1, borderColor: c.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 12, color: c.text, textAlignVertical: "top", backgroundColor: c.card }}
            placeholder="Type your message"
            placeholderTextColor={c.textSoft}
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity onPress={onSend} disabled={sending} style={{ backgroundColor: c.primary, paddingHorizontal: 16, borderRadius: 24, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 6, height: 48 }}>
            <Ionicons name="send" size={18} color={c.primaryForeground} />
            <Text style={{ color: c.primaryForeground, fontWeight: "700" }}>{sending ? "Sending" : "Send"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <ConfirmChatAccessModal
        visible={!!confirmOpen}
        astrologerId={astrologerId || ""}
        onClose={() => setConfirmOpen(false)}
        onConfirmed={async () => {
          setConfirmOpen(false);
          const retryText = text.trim();
          if (!retryText) return;
          // Send the pending message after purchasing access
          setSending(true);
          setMessages((prev) => [...prev, { sender: "user", text: retryText }]);
          setText("");
          try {
            const retry = await sendChatMessage(String(chatId), retryText);
            const reply2 = (retry as any)?.data?.reply || (retry as any)?.reply;
            if (reply2) {
              setMessages((prev) => [...prev, { sender: "astrologer", text: reply2 }]);
            }
          } catch {}
          setSending(false);
        }}
        onInsufficient={() => {
          setConfirmOpen(false);
          router.push("/(tabs)/wallet");
        }}
      />
    </SafeAreaView>
  );
}
