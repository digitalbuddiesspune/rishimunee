import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useThemeColors } from "@theme/index";
import { confirmChatAccess, quoteChatAccess } from "@services/api/chat";

type Props = {
  visible: boolean;
  astrologerId: string;
  defaultMinutes?: number;
  onClose: () => void;
  onConfirmed: (minutes: number) => void;
  onInsufficient?: (requiredAmount?: number) => void;
};

const OPTIONS = [1, 5, 10, 15, 30];

export default function ConfirmChatAccessModal({ visible, astrologerId, defaultMinutes = 5, onClose, onConfirmed, onInsufficient }: Props) {
  const c = useThemeColors();
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        const q = await quoteChatAccess(astrologerId, minutes);
        const p = (q as any)?.data?.price ?? (q as any)?.price ?? null;
        setPrice(p);
      } catch {
        setPrice(null);
      }
    })();
  }, [visible, astrologerId, minutes]);

  const onConfirm = async () => {
    try {
      setLoading(true);
      await confirmChatAccess(astrologerId, minutes);
      onConfirmed(minutes);
    } catch (e: any) {
      const status = e?.response?.status;
      const code = e?.response?.data?.details?.code || e?.response?.data?.code;
      const required = e?.response?.data?.details?.requiredAmount || e?.response?.data?.requiredAmount;
      if (status === 402 && code === "WALLET_INSUFFICIENT") {
        onInsufficient?.(required);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <View style={{ width: "100%", maxWidth: 420, backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: c.text, marginBottom: 8 }}>Confirm Chat Access</Text>
          <Text style={{ color: c.textSoft, marginBottom: 8 }}>Select duration and confirm wallet deduction.</Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            {OPTIONS.map((m) => (
              <TouchableOpacity key={m} onPress={async () => setMinutes(m)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: minutes === m ? c.primary : c.border, backgroundColor: minutes === m ? c.primary : c.surface }}>
                <Text style={{ color: minutes === m ? c.primaryForeground : c.text }}>{m}m</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ minHeight: 22, marginBottom: 12 }}>
            {price == null ? (
              <Text style={{ color: c.textSoft }}>Fetching price…</Text>
            ) : (
              <Text style={{ color: c.text }}>Amount: ₹{price}</Text>
            )}
          </View>
          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
            <TouchableOpacity onPress={onClose} style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface }}>
              <Text style={{ color: c.text }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} disabled={loading} style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: c.primary, opacity: loading ? 0.7 : 1 }}>
              {loading ? <ActivityIndicator color={c.primaryForeground} /> : <Text style={{ color: c.primaryForeground, fontWeight: "700" }}>Confirm & Continue</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
