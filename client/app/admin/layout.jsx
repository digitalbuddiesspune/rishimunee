"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "../../lib/store/hooks.js";
import { clearAdminCredentials, loadAdminSession, selectAdminAccessToken } from "../../lib/store/slices/adminAuthSlice.js";
import { Logo } from "../../components/ui/Logo.jsx";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/astrologers", label: "Astrologers" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" }
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const adminToken = useAppSelector(selectAdminAccessToken);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    dispatch(loadAdminSession()).finally(() => setInitialized(true));
  }, [dispatch]);

  useEffect(() => {
    if (!adminToken && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [adminToken, router, pathname]);

  const handleLogout = useCallback(() => {
    dispatch(clearAdminCredentials());
    router.push("/admin/login");
  }, [dispatch, router]);

  // Render a stable skeleton until client-side session check completes
  if (!initialized) {
    return (
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-12">
        <main className="flex-1 space-y-6" />
      </div>
    );
  }

  const showSidebar = initialized && !!adminToken;

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-12">
      <aside
        className={clsx(
          "hidden w-64 shrink-0 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-6",
          showSidebar ? "lg:block" : "lg:hidden"
        )}
      >
        <div className="mb-6">
          <Logo size="md" href="/" />
          <p className="mt-3 text-sm font-semibold text-[color:var(--color-text)]">Admin Panel</p>
        </div>
        <nav className="space-y-2 text-sm text-[color:var(--color-text-soft)]">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "block rounded-2xl px-3 py-2",
                pathname === item.href
                  ? "bg-[color:var(--color-primary)]/15 text-[color:var(--color-text)]"
                  : "hover:bg-[color:var(--color-card)]"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-[color:var(--color-border)] pt-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-2xl border border-[color:var(--color-border)] px-3 py-2 text-sm text-[color:var(--color-text)] hover:bg-[color:var(--color-card)]"
          >
            Logout (Admin)
          </button>
        </div>
      </aside>
      <main className="flex-1 space-y-6">
        <div className="flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <Logo size="md" href="/" />
            <p className="text-sm font-semibold text-[color:var(--color-text)]">Admin Panel</p>
          </div>
          {initialized && adminToken && (
            <button
              onClick={handleLogout}
              className="rounded-2xl border border-[color:var(--color-border)] px-3 py-2 text-xs text-[color:var(--color-text)] hover:bg-[color:var(--color-card)]"
            >
              Logout
            </button>
          )}
        </div>
        {pathname === "/admin/login" || (initialized && adminToken) ? children : null}
      </main>
    </div>
  );
}
