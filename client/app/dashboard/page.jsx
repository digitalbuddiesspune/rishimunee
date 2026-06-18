"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppShell } from "../../components/layout/AppShell.jsx";
import { StatCard } from "../../components/dashboard/StatCard.jsx";
import { ActivityTimeline } from "../../components/dashboard/ActivityTimeline.jsx";
import { UpcomingSessions } from "../../components/dashboard/UpcomingSessions.jsx";
import { ServiceHistoryCard } from "../../components/dashboard/ServiceHistoryCard.jsx";
import { OrderHistoryCard } from "../../components/dashboard/OrderHistoryCard.jsx";
import {
  fetchDashboard,
  selectDashboard,
} from "../../lib/store/slices/dashboardSlice.js";
import { selectAuthToken } from "../../lib/store/slices/authSlice.js";
// Quick Links sidebar removed; wallet import no longer needed

const formatDate = (value) => new Date(value).toLocaleString();

export default function DashboardPage() {
  const dispatch = useDispatch();
  const dashboard = useSelector(selectDashboard);
  const token = useSelector(selectAuthToken);
  // Sidebar removed: no wallet usage

  useEffect(() => {
    if (dashboard.status === "idle" && token) {
      dispatch(fetchDashboard());
    }
  }, [dashboard.status, token, dispatch]);

  const stats = useMemo(
    () => [
      {
        title: "Orders",
        value: dashboard.metrics.orders.toString().padStart(2, "0"),
        description: "Total paid services",
      },
      {
        title: "Active Chats",
        value: dashboard.metrics.chats.toString().padStart(2, "0"),
        description: "Conversations so far",
      },
      {
        title: "Reports",
        value: dashboard.metrics.reports.toString().padStart(2, "0"),
        description: "Insights generated",
      },
    ],
    [dashboard.metrics]
  );

  const timelineItems = useMemo(
    () =>
      dashboard.recentTransactions.map((txn) => ({
        id: txn._id,
        title: `${
          txn.type === "credit" ? "Wallet recharge" : "Wallet debit"
        } • ₹${txn.amount.toFixed(0)}`,
        date: formatDate(txn.createdAt),
      })),
    [dashboard.recentTransactions]
  );

  const sessionItems = useMemo(
    () =>
      dashboard.upcomingBookings.map((booking) => ({
        id: booking._id,
        astrologer: booking.astrologer?.name || "Astrologer",
        date: formatDate(booking.date),
        time: booking.timeSlot || "Scheduled",
      })),
    [dashboard.upcomingBookings]
  );

  // Sidebar with Quick Links removed

  return (
    <AppShell>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      {/* <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]"> */}
      {/* <UpcomingSessions items={sessionItems} /> */}
      {/* </div> */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityTimeline items={timelineItems} />
        <ServiceHistoryCard />
      </div>

      <div className="mt-6">
        <OrderHistoryCard />
      </div>

      {dashboard.status === "failed" && (
        <p className="text-sm text-[color:var(--color-danger)]">
          {dashboard.error}
        </p>
      )}
    </AppShell>
  );
}
