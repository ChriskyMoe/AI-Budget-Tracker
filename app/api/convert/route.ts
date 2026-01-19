import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { amount, from, to } = await req.json();

  if (!amount || !from || !to) {
    return NextResponse.json(
      { error: "Missing parameters" },
      { status: 400 }
    );
  }

  if (from === to) {
    return NextResponse.json({
      originalAmount: amount,
      convertedAmount: amount,
      rate: 1
    });
  }

  const res = await fetch(
    `https://api.frankfurter.app/latest?from=${from}&to=${to}`
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch exchange rate" },
      { status: 500 }
    );
  }

  const data = await res.json();
  const rate = data.rates[to];

  return NextResponse.json({
    from,
    to,
    originalAmount: amount,
    convertedAmount: Number((amount * rate).toFixed(2)),
    rate
  });
}
