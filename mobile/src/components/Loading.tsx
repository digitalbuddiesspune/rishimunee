import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useThemeColors } from "@theme/index";

export const Loading = () => {
  const c = useThemeColors();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.background }}>
      <ActivityIndicator color={c.primary} />
    </View>
  );
};

