"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api-client.js";
import { Button } from "../../components/ui/Button.jsx";
import { notifyCartUpdated } from "../../lib/cart-events.js";
import { useAppSelector } from "../../lib/store/hooks.js";
import { selectAuthToken } from "../../lib/store/slices/authSlice.js";
import Image from "next/image";
import { PAYMENT_GATEWAYS } from "../../lib/wallet/constants.js";

const emptyAddress = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "IN"
};

const toFormAddress = (addr = {}) => ({
  name: addr.name || "",
  phone: addr.phone || "",
  line1: addr.line1 || "",
  line2: addr.line2 || "",
  city: addr.city || "",
  state: addr.state || "",
  postalCode: addr.postalCode || "",
  country: addr.country || "IN"
});

export default function CheckoutPage() {
  const token = useAppSelector(selectAuthToken);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("new");
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [address, setAddress] = useState(emptyAddress);
  const gateway = PAYMENT_GATEWAYS.COD;
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      const [cartRes, addressesRes, profileRes] = await Promise.all([
        apiClient.get("/cart"),
        apiClient.get("/addresses").catch(() => ({ data: { data: { addresses: [] } } })),
        apiClient.get("/auth/me").catch(() => null)
      ]);

      const nextCart = cartRes.data.data?.cart || null;
      setCart(nextCart);
      const items = nextCart?.items || [];
      notifyCartUpdated(items.reduce((s, i) => s + (i.quantity || 0), 0));

      const addresses = addressesRes.data?.data?.addresses || [];
      setSavedAddresses(addresses);

      if (addresses.length) {
        const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0];
        setSelectedAddressId(defaultAddress._id);
        setAddress(toFormAddress(defaultAddress));
        setUseNewAddress(false);
      } else {
        const user = profileRes?.data?.data?.user;
        setSelectedAddressId("new");
        setAddress({
          ...emptyAddress,
          name: user?.name || "",
          phone: user?.phone || ""
        });
        setUseNewAddress(true);
      }
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404 || status === 400 || status === 401) {
        setCart(null);
        notifyCartUpdated(0);
      } else {
        console.error("Failed to load checkout", e?.response?.data || e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setCart(null);
      setLoading(false);
      notifyCartUpdated(0);
      return;
    }
    loadCheckoutData();
  }, [token]);

  const selectSavedAddress = (saved) => {
    setSelectedAddressId(saved._id);
    setAddress(toFormAddress(saved));
    setUseNewAddress(false);
  };

  const startNewAddress = () => {
    setSelectedAddressId("new");
    setUseNewAddress(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { gateway };
      if (!useNewAddress && selectedAddressId !== "new") {
        payload.addressId = selectedAddressId;
      } else {
        payload.address = address;
      }
      const { data } = await apiClient.post("/checkout/initiate", payload);
      const orderId = data.data?.order?._id || data.data?.orderId;
      if (orderId) {
        router.push(`/orders/${orderId}?confirmed=1`);
        return;
      }
      alert("Order placed successfully");
    } catch (err) {
      console.error("Checkout failed", err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 px-4 py-12 md:grid-cols-2">
        <div className="space-y-4">
          <div className="h-6 w-48 animate-pulse rounded bg-[color:var(--color-card)]" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-card)]" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-6 w-48 animate-pulse rounded bg-[color:var(--color-card)]" />
          <div className="h-40 animate-pulse rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)]" />
        </div>
      </div>
    );

  const items = cart?.items || [];
  const total = items.reduce((sum, i) => sum + (i.productId?.price || 0) * (i.quantity || 1), 0);

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 px-4 py-12 md:grid-cols-2">
      <form onSubmit={submit} className="space-y-4">
        <h2 className="text-xl font-semibold text-[color:var(--color-text)]">Shipping Address</h2>

        {savedAddresses.length > 0 && (
          <div className="space-y-3">
            {savedAddresses.map((saved) => {
              const selected = !useNewAddress && selectedAddressId === saved._id;
              return (
                <button
                  key={saved._id}
                  type="button"
                  onClick={() => selectSavedAddress(saved)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5"
                      : "border-[color:var(--color-border)] hover:border-[color:var(--color-primary)]/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-[color:var(--color-text)]">{saved.name}</p>
                    {saved.isDefault && (
                      <span className="rounded-full bg-[color:var(--color-secondary)] px-2 py-0.5 text-xs text-[color:var(--color-text-soft)]">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[color:var(--color-text-soft)]">{saved.phone}</p>
                  <p className="mt-1 text-sm text-[color:var(--color-text-soft)]">
                    {saved.line1}
                    {saved.line2 ? `, ${saved.line2}` : ""}, {saved.city}, {saved.state} {saved.postalCode}
                  </p>
                </button>
              );
            })}
            <Button type="button" variant="outline" size="sm" onClick={startNewAddress}>
              Use a different address
            </Button>
          </div>
        )}

        {(useNewAddress || savedAddresses.length === 0) && (
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Full name" className="rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={address.name} onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value }))} />
            <input required placeholder="Phone" className="rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={address.phone} onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} />
            <input required placeholder="Address line 1" className="col-span-2 rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={address.line1} onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} />
            <input placeholder="Address line 2" className="col-span-2 rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={address.line2} onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))} />
            <input required placeholder="City" className="rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} />
            <input required placeholder="State" className="rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} />
            <input required placeholder="Postal code" className="rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={address.postalCode} onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))} />
            <input placeholder="Country" className="rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={address.country} onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))} />
          </div>
        )}

        {!useNewAddress && savedAddresses.length > 0 && (
          <p className="text-sm text-[color:var(--color-text-soft)]">
            Delivering to your saved address. You can pick another saved address above or add a new one.
          </p>
        )}

        <h2 className="pt-6 text-xl font-semibold text-[color:var(--color-text)]">Payment</h2>
        <p className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] px-4 py-3 text-sm text-[color:var(--color-text-soft)]">
          Cash on Delivery (COD) — pay when your order is delivered.
        </p>
        <Button type="submit" isLoading={submitting}>Place Order (COD)</Button>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[color:var(--color-text)]">Order Summary</h2>
        <div className="divide-y divide-[color:var(--color-border)] rounded-2xl border border-[color:var(--color-border)]">
          {items.map((i) => {
            const img = i.productId?.images?.[0] || null;
            return (
              <div key={i.productId?._id} className="flex items-center justify-between gap-4 p-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-card)]">
                    {img ? (
                      <Image src={img} alt={i.productId?.name || "Product"} width={56} height={56} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-[color:var(--color-text-soft)]">No image</div>
                    )}
                  </div>
                  <p className="text-[color:var(--color-text)]">{i.productId?.name}</p>
                </div>
                <p className="text-[color:var(--color-text-soft)]">₹{i.productId?.price} × {i.quantity}</p>
              </div>
            );
          })}
        </div>
        <p className="text-lg font-semibold text-[color:var(--color-text)]">Total: ₹{Number(total).toLocaleString("en-IN")}</p>
      </div>
    </div>
  );
}
