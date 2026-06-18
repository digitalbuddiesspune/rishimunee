import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card.jsx";
import { Button } from "../ui/Button.jsx";

export const WalletSummary = ({ balance = 0, currency = "INR", onRefresh }) => (
  <Card className="bg-[color:var(--color-card)]">
    <CardHeader className="flex items-center justify-between">
      <div>
        <CardTitle>Wallet Balance</CardTitle>
        <p className="text-sm text-[color:var(--color-text-soft)]">उपलब्ध राशि जिससे आप instantly सेवाएँ सक्रिय कर सकते हैं</p>
      </div>
      <Button onClick={onRefresh} variant="outline" size="sm">
        Refresh
      </Button>
    </CardHeader>
    <CardContent>
      <p className="text-4xl font-semibold text-[color:var(--color-text)]">{currency} {balance.toFixed(2)}</p>
    </CardContent>
  </Card>
);
