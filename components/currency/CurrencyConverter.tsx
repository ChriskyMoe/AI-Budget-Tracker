"use client";

import { useState } from "react";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<number>(0);
  const [from, setFrom] = useState("THB");
  const [to, setTo] = useState("USD");
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const convert = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, from, to })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setResult(data.convertedAmount);
    } catch (err: any) {
      setError(err.message || "Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="space-y-4 rounded-lg border p-4 max-w-md">
      <h2 className="text-lg font-semibold">Currency Converter</h2>

      <input
        type="number"
        className="w-full border rounded px-3 py-2"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
      />

      <div className="flex gap-2">
        <select
          className="w-full border rounded px-3 py-2"
          value={from}
          onChange={e => setFrom(e.target.value)}
        >
          {SUPPORTED_CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>
              {c.code} – {c.label}
            </option>
          ))}
        </select>

        <button onClick={swap} className="px-3 border rounded">
          ⇄
        </button>

        <select
          className="w-full border rounded px-3 py-2"
          value={to}
          onChange={e => setTo(e.target.value)}
        >
          {SUPPORTED_CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>
              {c.code} – {c.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={convert}
        disabled={loading}
        className="w-full bg-black text-white rounded py-2"
      >
        {loading ? "Converting..." : "Convert"}
      </button>

      {result !== null && (
        <p className="text-green-600 font-medium">
          Result: {result} {to}
        </p>
      )}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
