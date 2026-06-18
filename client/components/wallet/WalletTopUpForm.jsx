"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "../ui/Button.jsx";
import { Input } from "../ui/Input.jsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/Card.jsx";
import { apiClient } from "../../lib/api-client.js";
import { submitHostedPayment } from "../../lib/payu.js";

export const WalletTopUpForm = () => {
  const [response, setResponse] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: { amount: 500 }
  });

  const onSubmit = async (values) => {
    try {
      setResponse(null);
      const { data } = await apiClient.post("/wallet/topup", {
        amount: Number(values.amount),
        platform: "web"
      });
      submitHostedPayment(data.data?.payment);
    } catch (error) {
      setResponse({ error: error.response?.data?.message || "Unable to initiate top-up" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recharge Wallet</CardTitle>
        <CardDescription>राशि चुनें और PayU के सुरक्षित checkout से भुगतान करें • Minimum ₹100.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--color-text)]">Amount (₹)</label>
            <Input type="number" step="100" min="100" {...register("amount", { required: true, min: 100 })} />
            {errors.amount && <p className="text-xs text-[color:var(--color-danger)]">₹100 से ऊपर राशि आवश्यक है</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Opening PayU..." : "Continue to PayU"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 text-xs text-[color:var(--color-text-soft)]">
        <p>Your wallet is credited only after PayU confirms the payment.</p>
        {response?.error && <p className="text-[color:var(--color-danger)]">{response.error}</p>}
      </CardFooter>
    </Card>
  );
};
