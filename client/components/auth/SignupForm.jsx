"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/Button.jsx";
import { Input } from "../ui/Input.jsx";
import { apiClient } from "../../lib/api-client.js";
import { setCredentials, selectCurrentUser } from "../../lib/store/slices/authSlice.js";
import { fetchWallet } from "../../lib/store/slices/walletSlice.js";
import { fetchDashboard } from "../../lib/store/slices/dashboardSlice.js";

export function SignupForm({ onSwitchToLogin }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [errorMessage, setErrorMessage] = useState("");
  const [challenge, setChallenge] = useState(null);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: "", email: "", phone: "", password: "" } });

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const onSubmit = async (values) => {
    try {
      setErrorMessage("");
      const { data } = await apiClient.post("/auth/register/request-otp", values);
      setChallenge(data.data);
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed";
      setErrorMessage(message);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    try {
      setVerifying(true);
      setErrorMessage("");
      const { data } = await apiClient.post("/auth/register/verify-otp", {
        challengeId: challenge.challengeId,
        otp,
      });
      dispatch(setCredentials(data.data));
      dispatch(fetchWallet());
      dispatch(fetchDashboard());
      router.push("/dashboard");
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed";
      setErrorMessage(message);
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    try {
      setErrorMessage("");
      const { data } = await apiClient.post("/auth/otp/resend", {
        challengeId: challenge.challengeId,
      });
      setChallenge(data.data);
      setOtp("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to resend code");
    }
  };

  const switchToLogin = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
      return;
    }
    router.push("/login");
  };

  return (
    <>
      {!challenge ? (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--color-text)]">Full name</label>
            <Input placeholder="Aarav Sharma" {...register("name", { required: true })} />
            {errors.name && <p className="text-xs text-[color:var(--color-danger)]">Name is required</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--color-text)]">Email</label>
            <Input type="email" placeholder="you@example.com" {...register("email", { required: true })} />
            {errors.email && <p className="text-xs text-[color:var(--color-danger)]">Email is required</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--color-text)]">Phone</label>
            <Input
              type="tel"
              placeholder="10-digit mobile number"
              {...register("phone", { required: true, minLength: 10 })}
            />
            {errors.phone && (
              <p className="text-xs text-[color:var(--color-danger)]">Valid phone number is required</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--color-text)]">Password</label>
            <Input
              type="password"
              placeholder="Create a password"
              {...register("password", { required: true, minLength: 6 })}
            />
            {errors.password && (
              <p className="text-xs text-[color:var(--color-danger)]">Password should be 6+ characters</p>
            )}
          </div>
          {errorMessage && <p className="text-xs text-[color:var(--color-danger)]">{errorMessage}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending code..." : "Continue with email verification"}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={verifyOtp}>
          <p className="text-sm text-[color:var(--color-text-soft)]">
            Enter the six-digit code sent to your email.
          </p>
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
            placeholder="6-digit code"
            required
          />
          {errorMessage && <p className="text-xs text-[color:var(--color-danger)]">{errorMessage}</p>}
          <Button type="submit" className="w-full" disabled={verifying || otp.length !== 6}>
            {verifying ? "Verifying..." : "Verify and create account"}
          </Button>
          <button type="button" onClick={resend} className="w-full text-sm text-[color:var(--color-primary)]">
            Resend code
          </button>
        </form>
      )}
      <p className="mt-4 text-center text-xs text-[color:var(--color-text-soft)]">
        Already have an account?{" "}
        <button type="button" onClick={switchToLogin} className="text-[color:var(--color-primary)]">
          Sign in
        </button>
      </p>
    </>
  );
}
