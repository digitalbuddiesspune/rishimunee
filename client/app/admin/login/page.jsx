"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../lib/store/hooks.js";
import { Button } from "../../../components/ui/Button.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { adminApiClient } from "../../../lib/admin-api-client.js";
import { selectAdminAccessToken, setAdminCredentials } from "../../../lib/store/slices/adminAuthSlice.js";
import { Logo } from "../../../components/ui/Logo.jsx";

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const adminToken = useAppSelector(selectAdminAccessToken);
  const [errorMessage, setErrorMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ defaultValues: { email: "", password: "" } });

  useEffect(() => {
    if (adminToken) {
      router.replace("/admin");
    }
  }, [adminToken, router]);

  const onSubmit = async (values) => {
    try {
      setErrorMessage("");
      const { data } = await adminApiClient.post("/admin/login", values);
      dispatch(setAdminCredentials(data.data));
      router.push("/admin");
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      setErrorMessage(message);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col items-center justify-center px-4 py-12">
      <Logo size="xl" href="/" className="mb-6" />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--color-text)]">Admin Email</label>
              <Input type="email" placeholder="admin@example.com" {...register("email", { required: true })} />
              {errors.email && <p className="text-xs text-[color:var(--color-danger)]">Email is required</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--color-text)]">Password</label>
              <Input type="password" placeholder="••••••" {...register("password", { required: true })} />
              {errors.password && <p className="text-xs text-[color:var(--color-danger)]">Password is required</p>}
            </div>
            {errorMessage && <p className="text-xs text-[color:var(--color-danger)]">{errorMessage}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

