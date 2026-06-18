import React from "react";
import { Text, View } from "react-native";
import { useThemeColors } from "@theme/index";

export const ErrorView = ({ message }: { message?: string }) => {
  const c = useThemeColors();
  return (
    <View style={{ padding: 16, backgroundColor: c.card, borderColor: c.danger, borderWidth: 1, borderRadius: 12 }}>
      <Text style={{ color: c.danger }}>{message || "Something went wrong"}</Text>
    </View>
  );
};

