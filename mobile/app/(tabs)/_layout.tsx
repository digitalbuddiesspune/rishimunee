import React from "react";
import { Tabs } from "expo-router";
import { useThemeColors } from "@theme/index";
import { Ionicons } from "@expo/vector-icons";
import { bi } from "@theme/strings";

export default function TabsLayout() {
  const c = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.mutedForeground,
        tabBarStyle: { backgroundColor: c.surface }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: bi("Home", "होम"),
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: bi("Services", "सेवाएँ"),
          tabBarIcon: ({ color, size }) => <Ionicons name="planet" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="astrologers/index"
        options={{
          title: bi("Astrologers", "ज्योतिषी"),
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: bi("Shop", "दुकान"),
          tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: bi("Wallet", "वॉलेट"),
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet" color={color} size={size} />
        }}
      />
      {/** Profile route will live outside tabs to avoid taking tab space */}
    </Tabs>
  );
}
