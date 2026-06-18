"use client";

import { usePathname } from "next/navigation";
import { AuthModal } from "./AuthModal.jsx";
import { LoginForm } from "./LoginForm.jsx";
import { SignupForm } from "./SignupForm.jsx";

export function AuthModalHost() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return (
      <AuthModal title="Welcome back">
        <LoginForm />
      </AuthModal>
    );
  }

  if (pathname === "/signup") {
    return (
      <AuthModal title="Create your account">
        <SignupForm />
      </AuthModal>
    );
  }

  return null;
}
