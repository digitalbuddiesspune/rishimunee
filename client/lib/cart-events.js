// Lightweight cart event bus for cross-component updates
export function notifyCartUpdated(count) {
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cart:updated", { detail: { count, ts: Date.now() } }));
    }
  } catch (_) {}
}

