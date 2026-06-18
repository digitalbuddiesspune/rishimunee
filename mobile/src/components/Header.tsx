import React from "react";
import { View, Text } from "@components/Themed";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useThemeColors } from "@theme/index";
import { biTitleFromHeader } from "@theme/strings";

export function Header({ title, right }: { title?: string; right?: React.ReactNode }) {
  const router = useRouter();
  const c = useThemeColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 10, backgroundColor: c.surface, borderBottomColor: c.border, borderBottomWidth: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={{ marginLeft: 4, fontSize: 18, fontWeight: "600" }}>{biTitleFromHeader(title)}</Text>
      </View>
      {right ? <View>{right}</View> : <View />}
    </View>
  );
}
