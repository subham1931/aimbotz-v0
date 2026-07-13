function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold uppercase text-[#F5C518]">
        {title}
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/65">
        {children}
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <LegalPage title="FAQ">
      <p>
        <strong className="text-white">How do I book?</strong> Choose a station
        on Book a Slot, pick date &amp; duration, confirm — you get a QR ticket
        instantly.
      </p>
      <p>
        <strong className="text-white">How do coins work?</strong> After staff
        scans your ticket and your session completes, you earn coins per hour
        played. Redeem them for free hours or store items.
      </p>
      <p>
        <strong className="text-white">Can I reuse a QR?</strong> No. Each ticket
        is single-use once verified at the counter.
      </p>
    </LegalPage>
  );
}
