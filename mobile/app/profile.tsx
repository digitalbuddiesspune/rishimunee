import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Card } from "@components/Themed";
import { TouchableOpacity, ScrollView } from "react-native";
import { useThemeColors } from "@theme/index";
import { useAuth } from "@hooks/useAuth";
import { SafeAreaView } from "react-native-safe-area-context";
import { getOverview } from "@services/api/auth";
import { getWallet } from "@services/api/wallet";
import { apiClient } from "@services/api/client";
import { bi } from "@theme/strings";

export default function ProfileScreen() {
  const c = useThemeColors();
  const { user, logout, refreshProfile } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);

  const avatarUrl = useMemo(() => {
    const raw = (user as any)?.avatar as string | undefined;
    if (!raw) return undefined;
    if (/^https?:\/\//i.test(raw)) return raw;
    const base = (apiClient.defaults.baseURL || "").replace(/\/?api\/?$/, "");
    if (!raw.startsWith("/")) return `${base}/${raw}`;
    return `${base}${raw}`;
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        await refreshProfile();
        const [o, w] = await Promise.all([getOverview(), getWallet()]);
        setOverview(o?.data || o);
        setWallet(w?.data || w);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Profile header */}
        <Card>
          <View style={{ alignItems: "center" }}>
            {avatarUrl ? (
              <View style={{ width: 80, height: 80, borderRadius: 40, overflow: "hidden", borderWidth: 1, borderColor: c.border }}>
                {/* RN image: use native Image instead of img; keeping minimal to avoid extra imports here */}
                <View style={{ width: 80, height: 80, backgroundColor: c.surface }} />
              </View>
            ) : (
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: c.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: c.border }}>
                <Text style={{ fontSize: 28, fontWeight: "800", color: c.primary }}>{(user?.name?.[0] || "J").toUpperCase()}</Text>
              </View>
            )}
            <Text style={{ fontSize: 20, fontWeight: "800", marginTop: 8 }} numberOfLines={1}>{user?.name || "—"}</Text>
            <Text soft numberOfLines={1}>{user?.email || "—"}</Text>
          </View>
        </Card>

        {/* Wallet summary */}
        {wallet && (
          <Card style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>{bi("Wallet", "वॉलेट")}</Text>
            <View style={{ backgroundColor: c.primary, padding: 12, borderRadius: 12 }}>
              <Text style={{ color: c.primaryForeground, opacity: 0.8 }}>{bi("Balance", "शेष")}</Text>
              <Text style={{ color: c.primaryForeground, fontSize: 24, fontWeight: "800" }}>{wallet.balance ?? "—"} {wallet.currency || "INR"}</Text>
            </View>
          </Card>
        )}

        {/* Details */}
        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>{bi("Details", "विवरण")}</Text>
          <View style={{ gap: 6 }}>
            {user?.phone ? (
              <Text soft>{bi("Phone", "फ़ोन")}: {user.phone}</Text>
            ) : null}
            {user?.subscriptionPlan ? (
              <Text soft>{bi("Plan", "प्लान")}: {user.subscriptionPlan}</Text>
            ) : null}
            {user?.dateOfBirth ? (
              <Text soft>{bi("DOB", "जन्म तिथि")}: {new Date(user.dateOfBirth).toLocaleDateString()}</Text>
            ) : null}
            {user?.placeOfBirth ? (
              <Text soft>{bi("Birth Place", "जन्म स्थान")}: {user.placeOfBirth}</Text>
            ) : null}
            {user?.gender ? (
              <Text soft>{bi("Gender", "लिंग")}: {user.gender}</Text>
            ) : null}
          </View>
        </Card>

        {/* Metrics grid */}
        {overview && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>{bi("Overview", "झलक")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {[
                { label: bi("Orders", "आदेश"), value: overview.metrics?.orders ?? 0 },
                { label: bi("Chats", "चैट"), value: overview.metrics?.chats ?? 0 },
                { label: bi("Reports", "रिपोर्ट"), value: overview.metrics?.reports ?? 0 },
                { label: bi("Bookings", "बुकिंग"), value: overview.metrics?.bookings ?? 0 }
              ].map((m) => (
                <View key={m.label} style={{ width: "48%", backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 12, padding: 12 }}>
                  <Text soft>{m.label}</Text>
                  <Text style={{ fontSize: 20, fontWeight: "800" }}>{m.value}</Text>
                </View>
              ))}
            </View>

            {/* Recent transactions */}
            <Card style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: "700", marginBottom: 8 }}>Recent Transactions</Text>
              {(overview.recentTransactions || []).length === 0 && <Text soft>None</Text>}
              {(overview.recentTransactions || []).map((t: any) => (
                <View key={t._id} style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: c.border }}>
                  <Text>{t.type === 'credit' ? 'Wallet recharge' : 'Wallet debit'} • {t.amount}</Text>
                  <Text soft>{new Date(t.createdAt).toLocaleString()}</Text>
                </View>
              ))}
            </Card>

            {/* Upcoming sessions */}
            <Card style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: "700", marginBottom: 8 }}>Upcoming Sessions</Text>
              {(overview.upcomingBookings || []).length === 0 && <Text soft>None</Text>}
              {(overview.upcomingBookings || []).map((b: any) => (
                <View key={b._id} style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: c.border }}>
                  <Text>{b.astrologer?.name || 'Astrologer'}</Text>
                  <Text soft>{new Date(b.date).toLocaleString()} {b.timeSlot ? `• ${b.timeSlot}` : ''}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        <TouchableOpacity onPress={logout} style={{ backgroundColor: c.danger, padding: 12, borderRadius: 12, marginTop: 16 }}>
          <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
