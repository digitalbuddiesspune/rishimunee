import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Card } from "@components/Themed";
import { useThemeColors } from "@theme/index";
import { Header } from "@components/Header";

export default function NotificationsScreen() {
  const c = useThemeColors();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Notifications" />
      <View style={{ padding: 16 }}>
        <Card>
          <Text soft>No notifications yet.</Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}

