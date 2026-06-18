import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { Slot, Stack, useRouter, useSegments } from "expo-router";
import { Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuthContext } from "@context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { getAndClearLastNativeCrash } from "@services/native/crashLogger";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    if (initializing) return;
    const inAuthGroup = segments[0] === "(auth)";
    const onSplash = segments[0] === "splash";
    if (!user) {
      if (!inAuthGroup && !onSplash) {
        router.replace("/splash");
      }
    } else if (user && (inAuthGroup || onSplash)) {
      router.replace("/(tabs)");
    }
  }, [initializing, user, router, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const segments = useSegments();
  const inTabsGroup = segments[0] === "(tabs)";

  useEffect(() => {
    if (Platform.OS !== "android") return;
    (async () => {
      const crash = await getAndClearLastNativeCrash();
      if (!crash) return;
      const preview = crash.length > 1800 ? `${crash.slice(0, 1800)}\n\n[truncated]` : crash;
      Alert.alert("Previous App Crash Captured", preview);
      console.error("[NativeCrashLogger] Previous app crash:\n", crash);
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
            enabled={!inTabsGroup}
          >
            <AuthGate>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
                {/* Root stack wraps tabs and detail screens to enable native back gestures */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(auth)"
                  options={{
                    headerShown: false,
                    presentation: "transparentModal",
                    animation: "fade",
                    contentStyle: { backgroundColor: "transparent" },
                  }}
                />
                {/* Other top-level routes like services/* and chat/* are auto-registered */}
              </Stack>
            </AuthGate>
          </KeyboardAvoidingView>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
