import { NextResponse } from "next/server";
import { readDb, updateDb } from "@/lib/db";
import { createId } from "@/lib/utils";
import type { User } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name || "").trim();
  const email = String(body.email || "")
    .trim()
    .toLowerCase();

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email required" },
      { status: 400 }
    );
  }

  const existing = await readDb();
  if (existing.users.some((u) => u.email.toLowerCase() === email)) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 }
    );
  }

  const created: User = {
    id: createId("user"),
    name,
    email,
    coins: 50,
    totalHours: 0,
    role: "user",
    createdAt: new Date().toISOString(),
  };

  await updateDb((db) => {
    db.users.push(created);
    db.coinLedger.unshift({
      id: createId("cl"),
      userId: created.id,
      amount: 50,
      reason: "Welcome bonus",
      createdAt: new Date().toISOString(),
    });
  });

  return NextResponse.json({ user: created });
}
