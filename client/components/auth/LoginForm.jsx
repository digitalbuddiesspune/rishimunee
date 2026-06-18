"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/Button.jsx";
import { Input } from "../ui/Input.jsx";
import { apiClient } from "../../lib/api-client.js";
import {
  setCredentials,
  selectCurrentUser,
} from "../../lib/store/slices/authSlice.js";
import { fetchWallet } from "../../lib/store/slices/walletSlice.js";
import { fetchDashboard } from "../../lib/store/slices/dashboardSlice.js";

function LoginFormContent({ onSwitchToSignup }) {
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [errorMessage, setErrorMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "", password: "" } });

  useEffect(() => {
    if (user) {
      const next = params.get("next");
      router.replace(next || "/dashboard");
    }
  }, [user, router, params]);

  const onSubmit = async (values) => {
    try {
      setErrorMessage("");
      const { data } = await apiClient.post("/auth/login", values);
      dispatch(setCredentials(data.data));
      dispatch(fetchWallet());
      dispatch(fetchDashboard());
      const next = params.get("next");
      router.push(next || "/dashboard");
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      setErrorMessage(message);
    }
  };

  const switchToSignup = () => {
    if (onSwitchToSignup) {
      onSwitchToSignup();
      return;
    }
    router.push("/signup");
  };

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[color:var(--color-text)]">
            Email
          </label>
          <Input
            type="email"
            placeholder="you@example.com"
            {...register("email", { required: true })}
          />
          {errors.email && (
            <p className="text-xs text-[color:var(--color-danger)]">
              Email is required
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[color:var(--color-text)]">
            Password
          </label>
          <Input
            type="password"
            placeholder="••••••"
            {...register("password", { required: true })}
          />
          {errors.password && (
            <p className="text-xs text-[color:var(--color-danger)]">
              Password is required
            </p>
          )}
        </div>
        {errorMessage && (
          <p className="text-xs text-[color:var(--color-danger)]">
            {errorMessage}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-4 text-center text-xs text-[color:var(--color-text-soft)]">
        New to RisheeMuni?{" "}
        <button
          type="button"
          onClick={switchToSignup}
          className="text-[color:var(--color-primary)]"
        >
          Create account
        </button>
      </p>
    </>
  );
}

export function LoginForm(props) {
  return (
    <Suspense fallback={<p className="text-center text-sm">Loading…</p>}>
      <LoginFormContent {...props} />
    </Suspense>
  );
}
