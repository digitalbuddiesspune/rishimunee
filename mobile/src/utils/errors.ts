export type HumanError = { title: string; message: string };

export function normalizeApiError(err: any, action?: "login" | "signup" | string): HumanError {
  // Axios-style error info
  const status = err?.response?.status as number | undefined;
  const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
  const code = (err?.code || err?.response?.data?.code || "").toString().toLowerCase();
  const msg = (serverMsg || "").toString().toLowerCase();

  // Network problems
  if (code.includes("network") || msg.includes("network") || err?.message?.includes("Network Error")) {
    return { title: "Network error", message: "Please check your internet connection and try again." };
  }

  // Unauthorized / invalid credentials
  if (status === 401 || msg.includes("invalid password") || msg.includes("invalid credentials") || msg.includes("wrong password")) {
    return { title: "Sign in failed", message: "Email or password is incorrect." };
  }

  // Not found (common for unknown user on login)
  if (status === 404 && action === "login") {
    return { title: "Account not found", message: "No account exists for this email address." };
  }

  // Conflict (email already exists during signup)
  if ((status === 409 || msg.includes("already exists") || msg.includes("duplicate")) && action === "signup") {
    return { title: "Email already in use", message: "An account with this email already exists. Try signing in." };
  }

  // Validation errors
  if (status === 400 || status === 422) {
    const detail = err?.response?.data?.details || err?.response?.data?.errors;
    const detailMsg = Array.isArray(detail) ? detail.map((d: any) => d?.message || d).join("\n") : (typeof detail === "string" ? detail : undefined);
    return { title: "Invalid input", message: detailMsg || (serverMsg || "Please check your input and try again.") };
  }

  // Email not verified scenarios
  if (msg.includes("verify") && msg.includes("email")) {
    return { title: "Email not verified", message: "Please verify your email to continue. Check your inbox for a verification link." };
  }

  // Default fallback
  return { title: "Something went wrong", message: serverMsg || "Please try again." };
}

