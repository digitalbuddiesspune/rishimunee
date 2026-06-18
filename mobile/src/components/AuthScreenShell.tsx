import React from "react";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Card } from "@components/Themed";
import { useThemeColors } from "@theme/index";
import { Logo } from "@components/Logo";

type AuthScreenShellProps = {
  children: React.ReactNode;
};

export function AuthScreenShell({ children }: AuthScreenShellProps) {
  const c = useThemeColors();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
      <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
        <Card style={{ padding: 20, borderRadius: 24 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={{
              position: "absolute",
              right: 16,
              top: 16,
              zIndex: 2,
              width: 32,
              height: 32,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: c.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={18} color={c.textSoft} />
          </TouchableOpacity>

          <View style={{ alignItems: "center", marginBottom: 16, marginTop: 8 }}>
            <Logo size="lg" />
          </View>

          {children}
        </Card>
      </View>
    </SafeAreaView>
  );
}
