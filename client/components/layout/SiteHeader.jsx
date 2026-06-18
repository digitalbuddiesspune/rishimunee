"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Moon,
  Sun,
  Wallet,
  LogOut,
  UserCircle2,
  ShoppingCart,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../app/providers.jsx";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import {
  clearCredentials,
  selectCurrentUser,
} from "../../lib/store/slices/authSlice.js";
import {
  resetWallet,
  selectWalletBalance,
} from "../../lib/store/slices/walletSlice.js";
import { resetDashboard } from "../../lib/store/slices/dashboardSlice.js";
import { apiClient } from "../../lib/api-client.js";
import { Logo } from "../ui/Logo.jsx";

const navItems = [
  { href: "/services", label: "Services" },
  { href: "/astrologers", label: "Astrologers" },
  { href: "/store", label: "Shop" },
  { href: "/dashboard", label: "Dashboard" },
];

export const SiteHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const walletBalance = useSelector(selectWalletBalance);
  const isAdmin = pathname?.startsWith("/admin");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const original = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original;
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, [open, mounted]);

  // Load cart count minimally for logged-in users
  useEffect(() => {
    let cancelled = false;
    const loadCart = async () => {
      if (!user) return;
      try {
        const { data } = await apiClient.get("/cart");
        const items = data?.data?.cart?.items || [];
        const count = items.reduce((s, i) => s + (i.quantity || 0), 0);
        if (!cancelled) setCartCount(count);
      } catch (err) {
        // Treat 404/empty as zero items without noisy logs
        const status = err?.response?.status;
        if (!cancelled && (status === 404 || status === 400)) setCartCount(0);
      }
    };
    loadCart();
    // Live update via custom cart event
    const onCartUpdated = (e) => {
      const next = typeof e?.detail?.count === "number" ? e.detail.count : null;
      if (next != null) setCartCount(next);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("cart:updated", onCartUpdated);
    }
    return () => {
      cancelled = true;
      if (typeof window !== "undefined") {
        window.removeEventListener("cart:updated", onCartUpdated);
      }
    };
  }, [user, pathname]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((segment) => segment.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("")
    : "";

  const handleLogout = () => {
    dispatch(clearCredentials());
    dispatch(resetWallet());
    dispatch(resetDashboard());
    router.push("/");
  };

  const mobileMenu = mounted && open
    ? createPortal(
        <div className="fixed inset-0 z-[200] sm:hidden" aria-modal="true" role="dialog">
          <button
            type="button"
            className="absolute inset-0 z-[200] bg-black/45"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          />
          <aside className="absolute right-0 top-0 z-[210] h-full w-[86vw] max-w-[360px] border-l border-[color:var(--color-border)] bg-[color:var(--color-card)] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <Logo size="md" href="/" priority />
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border)] p-2"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="space-y-2">
              {navItems
                .filter((item) => !(isAdmin && item.href === "/services"))
                .filter((item) => !(item.href === "/dashboard" && !user))
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "block rounded-xl px-3 py-2 transition-colors",
                      pathname.startsWith(item.href)
                        ? "bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]"
                        : "text-[color:var(--color-text-soft)] hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-text)]"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
            </nav>

            <div className="mt-6 space-y-3 border-t border-[color:var(--color-border)] pt-4">
              {user ? (
                <>
                  <Link
                    href="/cart"
                    className="relative inline-flex w-full items-center justify-center gap-2 rounded-full border border-[color:var(--color-border)] px-4 py-2 text-[color:var(--color-text)]"
                    onClick={() => setOpen(false)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <span className="absolute right-3 top-1/2 inline-flex h-5 min-w-[20px] -translate-y-1/2 items-center justify-center rounded-full bg-[color:var(--color-primary)] px-1 text-xs text-[color:var(--color-primary-foreground)]">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/wallet"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[color:var(--color-border)] px-4 py-2 text-[color:var(--color-text)]"
                    onClick={() => setOpen(false)}
                  >
                    <Wallet className="h-4 w-4" />
                    <span>{`Wallet • ₹${walletBalance.toFixed(0)}`}</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[color:var(--color-border)] px-4 py-2 text-[color:var(--color-text)]"
                    onClick={() => setOpen(false)}
                  >
                    <UserCircle2 className="h-4 w-4" />
                    <span>{initials || "Me"}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[color:var(--color-border)] px-4 py-2 text-[color:var(--color-text-soft)] hover:text-[color:var(--color-text)]"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                !isAdmin && (
                  <Link
                    href="/login"
                    className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--color-primary)] px-4 py-2 !text-white"
                    onClick={() => setOpen(false)}
                  >
                    Sign in
                  </Link>
                )
              )}
            </div>
          </aside>
        </div>,
        document.body
      )
    : null;

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[color:var(--color-background)]/85 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Logo size="lg" href="/" priority />
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border)] p-2 sm:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div
          className="hidden flex-1 items-center justify-end gap-6 text-sm font-medium sm:flex"
        >
          {navItems
            .filter((item) => !(isAdmin && item.href === "/services"))
            .filter((item) => !(item.href === "/dashboard" && !user))
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "transition-colors",
                  pathname.startsWith(item.href)
                    ? "text-[color:var(--color-primary)]"
                    : "text-[color:var(--color-text-soft)] hover:text-[color:var(--color-text)]"
                )}
              >
                {item.label}
              </Link>
            ))}
          {/* <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-text)]"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button> */}
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/cart"
                className="relative inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] px-3 py-2 text-[color:var(--color-text)]"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-1 text-xs text-[color:var(--color-primary-foreground)]">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/wallet"
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] px-4 py-2 text-[color:var(--color-text)]"
              >
                <Wallet className="h-4 w-4" />
                <span>{`₹${walletBalance.toFixed(0)}`}</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] px-3 py-2 text-[color:var(--color-text)]"
              >
                <UserCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">{initials || "Me"}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-border)] px-3 py-2 text-[color:var(--color-text-soft)] hover:text-[color:var(--color-text)]"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            !isAdmin && (
              <Link
                href="/login"
                className="inline-flex rounded-full bg-[color:var(--color-primary)] px-4 py-2 !text-white"
              >
                Sign in
              </Link>
            )
          )}
        </div>
      </nav>
    </header>
    {mobileMenu}
    </>
  );
};
