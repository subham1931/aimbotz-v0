/** Business rules — keep coin conversion configurable, never hardcode in UI copy alone */
export const COIN_CONFIG = {
  /** Coins earned per hour of verified play */
  coinsPerHour: 50,
  /** Coins required to redeem 1 free hour of game time */
  coinsPerFreeHour: 150,
  /** Leaderboard / reward cycle length in days */
  rewardCycleDays: 7,
  /** Next cycle reset (ISO). Updated by admin or cron in production */
  nextResetAt: (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 59, 0);
    return d.toISOString();
  })(),
} as const;

export const BRAND = {
  name: "AimBotz",
  nameParts: ["AIM", "BOTZ"] as const,
  tagline: "PLAY. EARN. LEVEL UP.",
  heroHeadline: "BOOK YOUR NEXT GAME SESSION",
} as const;

export const ADMIN_CREDENTIALS = {
  email: "admin@aimbotz.local",
  password: "admin123",
} as const;
