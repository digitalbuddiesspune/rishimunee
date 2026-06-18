import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "@components/Themed";
import { useThemeColors } from "@theme/index";
import { useRouter } from "expo-router";
import { Logo } from "@components/Logo";

export default function SplashScreen() {
  const c = useThemeColors();
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace("/(auth)/login");
    }, 2000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Logo size="xl" />
      </View>
    </SafeAreaView>
  );
}
