export type TicketStatus = "upcoming" | "active" | "completed" | "expired" | "used";

export type BookingType = "paid" | "free_voucher" | "store_redeem";

export interface Station {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Small accent label e.g. HOURLY / FEATURED */
  tag?: string;
  /** Large center headline e.g. price or offer */
  highlight?: string;
  pricePerHour: number;
  icon: string;
  accent: "green" | "yellow" | "red" | "orange" | "blue";
  image?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  coins: number;
  totalHours: number;
  role: "user" | "admin";
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  stationId: string;
  stationName: string;
  date: string;
  startTime: string;
  durationHours: number;
  price: number;
  coinsEarned: number;
  status: TicketStatus;
  type: BookingType;
  qrPayload: string;
  createdAt: string;
  verifiedAt?: string;
  completedAt?: string;
  sessionStartedAt?: string;
}

export interface CoinLedgerEntry {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  bookingId?: string;
  createdAt: string;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  coinCost: number;
  category: "hours" | "merch" | "snacks" | "vouchers";
  accent: "green" | "yellow" | "red" | "orange" | "blue";
  stock: number;
  image?: string;
}

export interface Session {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  stationName: string;
  durationHours: number;
  startedAt: string;
  endsAt: string;
  status: "active" | "completed";
}

export interface Database {
  users: User[];
  bookings: Booking[];
  coinLedger: CoinLedgerEntry[];
  sessions: Session[];
  storeItems: StoreItem[];
  stations: Station[];
  nextResetAt: string;
}
