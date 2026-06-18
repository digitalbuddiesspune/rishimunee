"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { adminApiClient } from "../../../lib/admin-api-client.js";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("all");
  const [saving, setSaving] = useState({});

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await adminApiClient.get("/payments/orders");
        setOrders(data.data.orders || []);
      } catch (error) {
        console.error("Failed to load orders", error);
      }
    };
    loadOrders();
  }, []);

  const filtered = orders.filter((o) => (tab === "shop" ? o.serviceType === "gemstone" : true));

  const updateDelivery = async (id, deliveryStatus) => {
    try {
      setSaving((s) => ({ ...s, [id]: true }));
      await adminApiClient.patch(`/orders/${id}`, { deliveryStatus });
      setOrders((list) => list.map((o) => (o._id === id ? { ...o, deliveryStatus } : o)));
    } catch (e) {
      console.error("Failed to update delivery", e?.response?.data || e.message);
      alert("Failed to update delivery status");
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[color:var(--color-text)]">Orders</h1>
        <div className="mt-4 inline-flex rounded-full border border-[color:var(--color-border)] p-1 text-sm">
          <button onClick={() => setTab("all")} className={`rounded-full px-3 py-1 ${tab === "all" ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]" : "text-[color:var(--color-text-soft)]"}`}>All</button>
          <button onClick={() => setTab("shop")} className={`rounded-full px-3 py-1 ${tab === "shop" ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]" : "text-[color:var(--color-text-soft)]"}`}>Shop</button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{tab === "shop" ? "Shop Orders" : "Recent Orders"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)]">
          {filtered.map((order) => (
            <div key={order._id} className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[color:var(--color-text)]">{order.serviceType}</p>
                  <p>Amount: ₹{Number(order.amount || 0).toLocaleString("en-IN")} via {order.paymentGateway}</p>
                  {order.serviceType === "gemstone" && (
                    <p>Items: {(order.items || []).map((i) => `${i.name} x${i.quantity}`).join(", ")}</p>
                  )}
                  <p>Updated: {format(new Date(order.updatedAt), "PPpp")}</p>
                </div>
                {order.serviceType === "gemstone" && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs">Delivery</label>
                    <select
                      className="rounded-md border border-[color:var(--color-border)] bg-transparent px-2 py-1 text-xs"
                      value={order.deliveryStatus || "pending"}
                      onChange={(e) => updateDelivery(order._id, e.target.value)}
                      disabled={!!saving[order._id]}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
