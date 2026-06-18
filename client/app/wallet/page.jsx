"use client";

import { useWallet } from "../../lib/hooks/useWallet.js";
import { WalletSummary } from "../../components/wallet/WalletSummary.jsx";
import { WalletTopUpForm } from "../../components/wallet/WalletTopUpForm.jsx";
import { WalletTransactions } from "../../components/wallet/WalletTransactions.jsx";
import { Card, CardContent } from "../../components/ui/Card.jsx";
import RequireAuth from "../../components/auth/RequireAuth.jsx";

export default function WalletPage() {
  const { balance, currency, transactions, isLoading, error, refresh } =
    useWallet();

  return (
    <RequireAuth>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[color:var(--color-text)]">
          RisheeMuni Wallet
        </h1>
        <p className="text-sm text-[color:var(--color-text-soft)]">
          Recharge करें, बैलेंस से सेवाएँ खरीदें, और इतिहास ट्रैक करें।
        </p>
      </div>
      {error && (
        <p className="text-sm text-[color:var(--color-danger)]">{error}</p>
      )}
      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-[color:var(--color-text-soft)]">
            Loading wallet details...
          </CardContent>
        </Card>
      ) : (
        <WalletSummary
          balance={balance}
          currency={currency}
          onRefresh={refresh}
        />
      )}
      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <WalletTopUpForm />
        <WalletTransactions transactions={transactions} />
      </div>
      <section className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-6 text-sm text-[color:var(--color-text-soft)]">
        <h2 className="text-lg font-semibold text-[color:var(--color-text)]">
          How wallet billing works
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            Recharge securely using PayU; सफल भुगतान के बाद balance auto update
            होगा।
          </li>
          <li>
            Service checkout पर default तरीका wallet deduction है — पर्याप्त
            balance रखें।
          </li>
          <li>
            हर लेन-देन का इतिहास नीचे दिखेगा; आवश्यकता होने पर सपोर्ट से संपर्क
            करें।
          </li>
        </ul>
      </section>
      </div>
    </RequireAuth>
  );
}
