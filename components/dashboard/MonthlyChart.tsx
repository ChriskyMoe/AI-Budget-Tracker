'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { formatCurrency, formatMonth } from '@/lib/utils/format';

interface MonthlyChartProps {
  data: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
  currency: string;
}

export function MonthlyChart({ data, currency }: MonthlyChartProps) {
  const chartData = data.map((item) => ({
    month: formatMonth(item.month).substring(0, 3),
    income: item.income,
    expenses: item.expenses,
  }));

  return (
    <Card title="Monthly Income & Expenses">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} name="Income" />
          <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
