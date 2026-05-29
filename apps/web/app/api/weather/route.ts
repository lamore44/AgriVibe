import { NextResponse } from "next/server";

const API_BASE = process.env.RUST_API_BASE_URL ?? "http://127.0.0.1:3001";

export async function GET() {
  try {
    const response = await fetch(`${API_BASE}/api/weather`, {
      cache: "no-store",
    });

    const text = await response.text();
    const data = text ? safeJsonParse(text) : null;

    return NextResponse.json(data ?? { error: "Empty response" }, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { error: "Data cuaca tidak tersedia" },
      { status: 502 },
    );
  }
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
