import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";

export const WalletTransactions = ({ transactions = [] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Wallet Activity</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)]">
      {transactions.length === 0 && <p>No wallet history yet. Recharge and book your first सेवा.</p>}
      {transactions.map((txn) => (
        <div
          key={txn._id}
          className="flex flex-col rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-3 md:flex-row md:items-center md:justify-between"
        >
          <div className="space-y-1">
            <p className="font-medium text-[color:var(--color-text)]">₹{txn.amount.toFixed(2)} • {txn.type === "credit" ? "जमा" : "कटौती"}</p>
            <p className="text-xs">{txn.description || txn.gateway}</p>
            <p className="text-[10px] uppercase">{new Date(txn.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{txn.status}</Badge>
            {txn.referenceId && <Badge variant="outline">Ref: {txn.referenceId}</Badge>}
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);
