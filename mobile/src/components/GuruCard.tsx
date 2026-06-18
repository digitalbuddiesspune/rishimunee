import React, { useMemo } from "react";
import { View, Text } from "@components/Themed";
import { Image, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import { useThemeColors } from "@theme/index";
import { apiClient } from "@services/api/client";

type Props = {
  name: string;
  description?: string;
  specialty?: string[];
  avatarUrl?: string;
  avatar?: string;
  onPress?: () => void;
  variant?: "carousel" | "grid";
  containerStyle?: StyleProp<ViewStyle>;
};

export function GuruCard({ name, description, specialty, avatarUrl, avatar, onPress, variant = "carousel", containerStyle }: Props) {
  const c = useThemeColors();
  const absoluteAvatar = useMemo(() => {
    const raw = (avatar || avatarUrl) as string | undefined;
    if (!raw) return undefined;
    if (/^https?:\/\//i.test(raw)) return raw;
    const base = (apiClient.defaults.baseURL || "").replace(/\/?api\/?$/, "");
    if (!raw.startsWith("/")) return `${base}/${raw}`;
    return `${base}${raw}`;
  }, [avatar, avatarUrl]);
  return (
    <TouchableOpacity onPress={onPress} style={[{ width: variant === "grid" ? "48%" : 240 }, containerStyle]}>
      <View style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 16, padding: 12, ...(variant === "carousel" ? { marginRight: 12 } : { marginBottom: 12 }) }}>
        {absoluteAvatar ? (
          <Image source={{ uri: absoluteAvatar }} style={{ width: "100%", height: 120, borderRadius: 12, marginBottom: 8 }} resizeMode="cover" />
        ) : (
          <View style={{ width: "100%", height: 120, borderRadius: 12, marginBottom: 8, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
            <Text soft style={{ fontSize: 40 }}>{name?.[0] || "A"}</Text>
          </View>
        )}
        <Text style={{ fontWeight: "700", fontSize: 16 }} numberOfLines={1}>{name}</Text>
        {specialty?.length ? (
          <Text soft numberOfLines={1}>{specialty.join(", ")}</Text>
        ) : null}
        {description ? (
          <Text soft numberOfLines={2} style={{ marginTop: 4 }}>{description}</Text>
        ) : null}
        <View style={{ marginTop: 8, backgroundColor: c.primary, paddingVertical: 8, borderRadius: 12 }}>
          <Text style={{ color: c.primaryForeground, textAlign: "center", fontWeight: "700" }}>Chat Now</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
