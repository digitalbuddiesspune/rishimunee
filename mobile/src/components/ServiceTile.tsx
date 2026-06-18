import React from "react";
import { View, Text } from "@components/Themed";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@theme/index";
import { biServiceTitle } from "@theme/strings";

type Props = {
  title: string;
  slug: string;
  onPress?: () => void;
};

const iconForSlug = (slug: string): keyof typeof Ionicons.glyphMap => {
  if (slug.includes("horoscope")) return "moon";
  if (slug.includes("kundli") || slug.includes("kundali")) return "book";
  if (slug.includes("panchang")) return "sunny";
  if (slug.includes("gem") || slug.includes("store")) return "storefront" as any;
  return "star" as any;
};

export function ServiceTile({ title, slug, onPress }: Props) {
  const c = useThemeColors();
  const icon = iconForSlug(slug);
  return (
    <TouchableOpacity onPress={onPress} style={{ width: "47%" }}>
      <View style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 16, padding: 16, alignItems: "center", gap: 8 }}>
        <Ionicons name={icon} size={28} color={c.primary} />
        <Text numberOfLines={2} style={{ textAlign: "center", fontWeight: "600" }}>{biServiceTitle(title, slug)}</Text>
      </View>
    </TouchableOpacity>
  );
}
