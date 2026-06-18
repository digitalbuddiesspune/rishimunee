import React from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { useThemeColors } from "@theme/index";
import { Logo } from "@components/Logo";

export default function FullScreenLoader({ label }: { label?: string }) {
  const c = useThemeColors();
  return (
    <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.25)" }]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={label || "Loading"}
      accessible
    >
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <Logo size="md" />
        <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 12 }} />
        {label ? <Text style={{ color: c.text, marginTop: 8, fontWeight: "600" }}>{label}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  card: {
    padding: 16,
    minWidth: 140,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

