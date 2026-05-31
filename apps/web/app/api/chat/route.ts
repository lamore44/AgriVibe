import { NextResponse } from "next/server";

const API_BASE = process.env.RUST_API_BASE_URL ?? "http://127.0.0.1:3001";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    const userId = req.headers.get("x-user-id") ?? "";
    const forwardedFor = req.headers.get("x-forwarded-for") ?? "";
    const realIp = req.headers.get("x-real-ip") ?? "";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (userId) headers["x-user-id"] = userId;
    if (forwardedFor) headers["x-forwarded-for"] = forwardedFor;
    if (realIp) headers["x-real-ip"] = realIp;

    const response = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await response.text();
    const data = text ? safeJsonParse(text) : null;

    return NextResponse.json(data ?? { error: "Empty response" }, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghubungi server" },
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
