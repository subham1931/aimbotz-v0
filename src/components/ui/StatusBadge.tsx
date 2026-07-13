import type { TicketStatus } from "@/lib/types";
import { statusLabel } from "@/lib/utils";

const styles: Record<TicketStatus, string> = {
  upcoming: "bg-[#F5C518]/15 text-[#F5C518] border-[#F5C518]/40",
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  completed: "bg-white/10 text-white/70 border-white/20",
  expired: "bg-red-500/15 text-red-400 border-red-500/40",
  used: "bg-orange-500/15 text-orange-400 border-orange-500/40",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}
