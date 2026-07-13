# AimBotz — Arcade Booking Platform

Responsive booking + loyalty web app for a physical gaming arcade. Users book hourly slots, receive QR tickets, earn coins from verified play, and redeem free hours or store rewards. Staff scan tickets in an admin dashboard.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- `qrcode.react` for ticket QR generation
- `html5-qrcode` for admin camera scanning
- File-backed JSON store (`data/db.json`) for demo persistence

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

| Role   | Email                  | Password  |
|--------|------------------------|-----------|
| Player | `sam@demo.local`       | (none)    |
| Admin  | `admin@aimbotz.local`  | `admin123`|

## Coin rules (configurable)

Edit `src/lib/config.ts`:

- `coinsPerHour` — earned after a session is completed
- `coinsPerFreeHour` — cost to redeem 1 free hour voucher

## Routes

- `/` — Homepage
- `/book` — Booking wizard + QR ticket
- `/tickets` — My tickets (fullscreen QR)
- `/rewards` — Coin balance & redeem
- `/leaderboard` — Full leaderboard + countdown
- `/store` — Coin store
- `/admin` — Staff dashboard
- `/admin/scan` — QR scanner + verify
- `/admin/sessions` — Today's sessions

## Flow

1. Player logs in → books a station → gets QR ticket
2. Staff opens `/admin/scan` → scans QR → **Verify & Start Session**
3. Ticket becomes **Active** (single-use; re-scan rejected)
4. Staff marks session **Complete** → coins credited to player ledger
