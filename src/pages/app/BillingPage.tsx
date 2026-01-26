import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Check,
  ArrowRight,
  Receipt,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const currentPlan = {
  name: "Free",
  price: "$0",
  period: "forever",
  renewsAt: null,
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    current: true,
    features: ["25 prompts", "5 test runs/month", "Basic export"],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    current: false,
    popular: true,
    features: ["Unlimited prompts", "100 test runs/month", "Full export", "Public sharing"],
  },
  {
    name: "Team",
    price: "$49",
    period: "/user/month",
    current: false,
    features: ["Everything in Pro", "Team workspaces", "Roles & permissions", "Audit log"],
  },
];

const invoices = [
  { id: "1", date: "Dec 1, 2024", amount: "$0.00", status: "paid" },
  { id: "2", date: "Nov 1, 2024", amount: "$0.00", status: "paid" },
];

export default function BillingPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </div>

      {/* Current Plan */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-semibold">Current Plan</h2>
              <Badge variant="secondary">{currentPlan.name}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              You're on the {currentPlan.name} plan. Upgrade to unlock more features.
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{currentPlan.price}</p>
            <p className="text-sm text-muted-foreground">{currentPlan.period}</p>
          </div>
        </div>
      </div>

      {/* Plans Comparison */}
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "p-6 rounded-xl border bg-card",
              plan.popular && "border-amber-500 ring-1 ring-amber-500"
            )}
          >
            {plan.popular && (
              <Badge variant="accent" className="mb-3">Most Popular</Badge>
            )}
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <div className="my-3">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>
            {plan.current ? (
              <Button variant="outline" className="w-full" disabled>
                Current plan
              </Button>
            ) : (
              <Button variant={plan.popular ? "default" : "outline"} className="w-full">
                Upgrade
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Usage */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <h2 className="text-lg font-semibold">Usage This Month</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Prompts</span>
              <span className="text-sm font-medium">24 / 25</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[96%] rounded-full bg-amber-500" />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Test Runs</span>
              <span className="text-sm font-medium">3 / 5</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[60%] rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Usage resets on the 1st of each month.
        </p>
      </div>

      {/* Payment Method */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Payment Method</h2>
          <Button variant="outline" size="sm">
            <CreditCard className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          No payment method on file. Add one to upgrade your plan.
        </p>
      </div>

      {/* Invoices */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <h2 className="text-lg font-semibold">Billing History</h2>
        {invoices.length > 0 ? (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{invoice.date}</p>
                    <p className="text-xs text-muted-foreground">{invoice.amount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="success" className="capitalize">
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No invoices yet.</p>
        )}
      </div>
    </div>
  );
}
