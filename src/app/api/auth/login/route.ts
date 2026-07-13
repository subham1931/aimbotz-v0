import { NextResponse } from "next/server";
import { readDb, updateDb } from "@/lib/db";
import { ADMIN_CREDENTIALS } from "@/lib/config";

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const db = await readDb();

  if (
    email === ADMIN_CREDENTIALS.email &&
    password === ADMIN_CREDENTIALS.password
  ) {
    let admin = db.users.find((u) => u.email === email && u.role === "admin");
    if (!admin) {
      admin = {
        id: "admin-1",
        name: "Zone Admin",
        email: ADMIN_CREDENTIALS.email,
        coins: 0,
        totalHours: 0,
        role: "admin",
        createdAt: new Date().toISOString(),
      };
      await updateDb((d) => {
        d.users.push(admin!);
      });
    }
    return NextResponse.json({ user: admin });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email);
  if (!user) {
    return NextResponse.json(
      { error: "No account found. Try signup or use sam@demo.local" },
      { status: 401 }
    );
  }

  return NextResponse.json({ user });
}
