import { Suspense } from "react";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const db = await readDb();
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-white/50">Loading…</div>
      }
    >
      <BookingWizard stations={db.stations} />
    </Suspense>
  );
}
