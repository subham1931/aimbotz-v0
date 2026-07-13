import { randomUUID } from "crypto";
import { COIN_CONFIG } from "./config";
import type {
  Booking,
  BookingType,
  CoinLedgerEntry,
  Database,
  Session,
  TicketStatus,
  User,
} from "./types";

export function maskUsername(name: string): string {
  if (!name || name.length < 2) return "PL**";
  const first = name.slice(0, 3).toUpperCase();
  return `${first}**`;
}

export function formatCoins(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function formatCurrency(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function estimateCoins(hours: number): number {
  return Math.round(hours * COIN_CONFIG.coinsPerHour);
}

export function buildQrPayload(booking: {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  durationHours: number;
}): string {
  return JSON.stringify({
    v: 1,
    bookingId: booking.id,
    userId: booking.userId,
    date: booking.date,
    startTime: booking.startTime,
    durationHours: booking.durationHours,
  });
}

export function parseQrPayload(raw: string): {
  bookingId: string;
  userId: string;
  date: string;
  startTime: string;
  durationHours: number;
} | null {
  try {
    const data = JSON.parse(raw);
    if (!data?.bookingId || !data?.userId) return null;
    return data;
  } catch {
    // Allow raw booking ID paste as fallback
    if (raw.startsWith("bk-") || raw.length > 8) {
      return {
        bookingId: raw.trim(),
        userId: "",
        date: "",
        startTime: "",
        durationHours: 0,
      };
    }
    return null;
  }
}

export function createBookingId(): string {
  return `bk-${randomUUID().slice(0, 8)}`;
}

export function createId(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

export function accentClasses(accent: string) {
  const map: Record<
    string,
    { btn: string; glow: string; border: string; text: string }
  > = {
    green: {
      btn: "bg-gradient-to-r from-emerald-600 to-emerald-400 text-black",
      glow: "shadow-[0_0_24px_rgba(16,185,129,0.25)]",
      border: "border-emerald-500/40",
      text: "text-emerald-400",
    },
    yellow: {
      btn: "bg-gradient-to-r from-amber-500 to-[#F5C518] text-black",
      glow: "shadow-[0_0_24px_rgba(245,197,24,0.3)]",
      border: "border-[#F5C518]/40",
      text: "text-[#F5C518]",
    },
    red: {
      btn: "bg-gradient-to-r from-red-800 to-red-500 text-white",
      glow: "shadow-[0_0_24px_rgba(239,68,68,0.25)]",
      border: "border-red-500/40",
      text: "text-red-400",
    },
    orange: {
      btn: "bg-gradient-to-r from-orange-700 to-orange-400 text-black",
      glow: "shadow-[0_0_24px_rgba(249,115,22,0.25)]",
      border: "border-orange-500/40",
      text: "text-orange-400",
    },
    blue: {
      btn: "bg-gradient-to-r from-blue-700 to-cyan-400 text-white",
      glow: "shadow-[0_0_24px_rgba(59,130,246,0.25)]",
      border: "border-blue-500/40",
      text: "text-blue-400",
    },
  };
  return map[accent] ?? map.yellow;
}

export function statusLabel(status: TicketStatus): string {
  const labels: Record<TicketStatus, string> = {
    upcoming: "Upcoming",
    active: "Active",
    completed: "Completed",
    expired: "Expired",
    used: "Used",
  };
  return labels[status];
}

export function getLeaderboard(db: Database) {
  return [...db.users]
    .filter((u) => u.role === "user")
    .sort((a, b) => b.totalHours - a.totalHours || b.coins - a.coins)
    .map((u, i) => ({
      rank: i + 1,
      user: u,
      maskedName: maskUsername(u.name),
      rewardTier:
        i === 0 ? "Gold" : i === 1 ? "Silver" : i === 2 ? "Bronze" : "Player",
      rewardCoins: i === 0 ? 4000 : i === 1 ? 2500 : i === 2 ? 1500 : 0,
    }));
}

export function findUser(db: Database, id: string): User | undefined {
  return db.users.find((u) => u.id === id);
}

export type CreateBookingInput = {
  userId: string;
  stationId: string;
  date: string;
  startTime: string;
  durationHours: number;
  type?: BookingType;
  priceOverride?: number;
};

export function createBookingRecord(
  db: Database,
  input: CreateBookingInput
): Booking {
  const station = db.stations.find((s) => s.id === input.stationId);
  if (!station) throw new Error("Station not found");

  const id = createBookingId();
  const durationHours = input.durationHours;
  const price =
    input.priceOverride ??
    (input.type === "free_voucher" || input.type === "store_redeem"
      ? 0
      : station.pricePerHour * durationHours);
  const coinsEarned = estimateCoins(durationHours);

  const booking: Booking = {
    id,
    userId: input.userId,
    stationId: station.id,
    stationName: station.name,
    date: input.date,
    startTime: input.startTime,
    durationHours,
    price,
    coinsEarned,
    status: "upcoming",
    type: input.type ?? "paid",
    qrPayload: "",
    createdAt: new Date().toISOString(),
  };
  booking.qrPayload = buildQrPayload(booking);
  return booking;
}

export function verifyBooking(
  db: Database,
  bookingId: string
): { booking: Booking; session: Session; user: User } {
  const booking = db.bookings.find((b) => b.id === bookingId);
  if (!booking) throw new Error("Booking not found");
  if (booking.status === "used" || booking.status === "active") {
    throw new Error("Ticket already used or active");
  }
  if (booking.status === "completed" || booking.status === "expired") {
    throw new Error(`Ticket is ${booking.status}`);
  }

  const user = findUser(db, booking.userId);
  if (!user) throw new Error("User not found");

  const now = new Date();
  const ends = new Date(now.getTime() + booking.durationHours * 3600000);

  booking.status = "active";
  booking.verifiedAt = now.toISOString();
  booking.sessionStartedAt = now.toISOString();

  const session: Session = {
    id: createId("sess"),
    bookingId: booking.id,
    userId: user.id,
    userName: user.name,
    stationName: booking.stationName,
    durationHours: booking.durationHours,
    startedAt: now.toISOString(),
    endsAt: ends.toISOString(),
    status: "active",
  };

  db.sessions.unshift(session);
  return { booking, session, user };
}

export function completeSession(db: Database, sessionId: string) {
  const session = db.sessions.find((s) => s.id === sessionId);
  if (!session) throw new Error("Session not found");
  if (session.status === "completed") return session;

  session.status = "completed";
  const booking = db.bookings.find((b) => b.id === session.bookingId);
  if (booking) {
    booking.status = "completed";
    booking.completedAt = new Date().toISOString();

    const user = findUser(db, booking.userId);
    if (user) {
      const earned = booking.coinsEarned;
      user.coins += earned;
      user.totalHours += booking.durationHours;
      const entry: CoinLedgerEntry = {
        id: createId("cl"),
        userId: user.id,
        amount: earned,
        reason: `Session completed — ${booking.stationName} (${booking.durationHours}h)`,
        bookingId: booking.id,
        createdAt: new Date().toISOString(),
      };
      db.coinLedger.unshift(entry);
    }
  }
  return session;
}

export function redeemFreeHour(db: Database, userId: string, stationId: string) {
  const user = findUser(db, userId);
  if (!user) throw new Error("User not found");
  const cost = COIN_CONFIG.coinsPerFreeHour;
  if (user.coins < cost) throw new Error("Insufficient coins");

  user.coins -= cost;
  const entry: CoinLedgerEntry = {
    id: createId("cl"),
    userId,
    amount: -cost,
    reason: `Redeemed ${cost} coins for 1 free hour`,
    createdAt: new Date().toISOString(),
  };
  db.coinLedger.unshift(entry);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = tomorrow.toISOString().slice(0, 10);

  const booking = createBookingRecord(db, {
    userId,
    stationId,
    date,
    startTime: "14:00",
    durationHours: 1,
    type: "free_voucher",
    priceOverride: 0,
  });
  db.bookings.unshift(booking);
  return { booking, user, entry };
}
