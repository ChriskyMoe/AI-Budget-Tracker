import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ExpenseBreakdown } from "@/components/dashboard/ExpenseBreakdown";
import { TimelineView } from "@/components/dashboard/TimelineView";
import { startOfMonth, endOfMonth, format } from "date-fns";
import CurrencyConverter from "@/components/currency/CurrencyConverter";


export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Get user profile for base currency
  const { data: profile } = await supabase
    .from("profiles")
    .select("base_currency")
    .eq("id", user.id)
    .single();

  const baseCurrency = profile?.base_currency || "THB";

  // Get transactions for current month
  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
      *,
      categories (
        id,
        name
      )
    `,
    )
    .eq("user_id", user.id)
    .gte("date", monthStart.toISOString().split("T")[0])
    .lte("date", monthEnd.toISOString().split("T")[0])
    .order("date", { ascending: false });

  // Get budgets for current month
  const { data: budgets } = await supabase
    .from("budgets")
    .select(
      `
      *,
      categories (
        id,
        name
      )
    `,
    )
    .eq("user_id", user.id)
    .eq("month", now.getMonth() + 1)
    .eq("year", now.getFullYear());

  // Calculate totals
  const income =
    transactions
      ?.filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const expenses =
    transactions
      ?.filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const balance = income - expenses;

  // Calculate total budget
  const totalBudget =
    budgets
      ?.filter((b) => !b.category_id)
      .reduce((sum, b) => sum + Number(b.amount), 0) || 0;

  const remainingBudget = totalBudget - expenses;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">{format(now, "MMMM yyyy")}</p>
      </div>

      <DashboardStats
        income={income}
        expenses={expenses}
        balance={balance}
        budget={totalBudget}
        remainingBudget={remainingBudget}
        currency={baseCurrency}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseBreakdown
          transactions={transactions || []}
          currency={baseCurrency}
        />
        <TimelineView
          transactions={transactions || []}
          currency={baseCurrency}
        />
      </div>
    </div>
  );
}
