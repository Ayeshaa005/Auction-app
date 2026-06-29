# Auction House — Full-Stack Live Bidding App

A full-stack auction platform with real-time bidding.

- **Backend:** NestJS + PostgreSQL + Prisma, with a Socket.IO gateway for live bids and JWT auth.
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS, with React Query and a Socket.IO client.

```
Auction_App/
├── backend/            # NestJS API + WebSocket gateway
│   ├── prisma/         # schema.prisma + seed
│   └── src/
│       ├── auth/       # register/login, JWT strategy + guard
│       ├── auctions/   # auction CRUD
│       ├── bids/       # bids service + live-bidding gateway
│       └── prisma/     # PrismaService
├── frontend/           # Next.js app
│   └── src/
│       ├── app/        # routes: /, /auctions/[id], /login, /register
│       ├── components/ # Navbar, Providers
│       ├── context/    # AuthContext
│       └── lib/        # api (axios), socket (socket.io), types
└── docker-compose.yml  # PostgreSQL
```

## Prerequisites

- Node.js 20+ and npm
- Docker (for PostgreSQL) — or your own Postgres instance

## Getting started

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` with database `auction_db` (user/password: `auction`/`auction`), matching `backend/.env`.

### 2. Backend

```bash
cd backend
npm install                 # if not already installed
npm run prisma:migrate      # create tables (first run: name it e.g. "init")
npm run db:seed             # optional demo data (alice@example.com / password123)
npm run start:dev           # API on http://localhost:4000/api
```

### 3. Frontend

```bash
cd frontend
npm install                 # if not already installed
npm run dev                 # app on http://localhost:3000
```

## Environment variables

**backend/.env**

| Variable        | Default                                                              |
| --------------- | ------------------------------------------------------------------- |
| `DATABASE_URL`  | `postgresql://auction:auction@localhost:5432/auction_db?schema=public` |
| `JWT_SECRET`    | `change-me-in-production`                                            |
| `JWT_EXPIRES_IN`| `7d`                                                                |
| `PORT`          | `4000`                                                               |
| `CORS_ORIGIN`   | `http://localhost:3000`                                              |

**frontend/.env.local**

| Variable               | Default                       |
| ---------------------- | ----------------------------- |
| `NEXT_PUBLIC_API_URL`  | `http://localhost:4000/api`   |
| `NEXT_PUBLIC_WS_URL`   | `http://localhost:4000`       |

## How live bidding works

1. The auction detail page opens a Socket.IO connection to the `/bids` namespace (authenticated with the JWT) and emits `joinAuction`.
2. Placing a bid emits `placeBid`. The server validates it in a DB transaction (auction is live, amount beats the current bid, not your own auction).
3. On success the server broadcasts `bidUpdate` to everyone in that auction's room, so all viewers see the new bid instantly.

## API overview

| Method | Route                          | Auth | Description            |
| ------ | ------------------------------ | ---- | ---------------------- |
| POST   | `/api/auth/register`           | —    | Create account         |
| POST   | `/api/auth/login`              | —    | Log in                 |
| GET    | `/api/auctions`                | —    | List auctions          |
| GET    | `/api/auctions/:id`            | —    | Auction detail + bids  |
| POST   | `/api/auctions`                | ✓    | Create auction         |
| PATCH  | `/api/auctions/:id`            | ✓    | Update (owner only)    |
| DELETE | `/api/auctions/:id`            | ✓    | Delete (owner only)    |
| GET    | `/api/auctions/:id/bids`       | —    | Bid history            |

WebSocket (namespace `/bids`): `joinAuction`, `leaveAuction`, `placeBid` → broadcasts `bidUpdate`.

## Notes

- Prisma is pinned to the v6 line for the conventional `url = env("DATABASE_URL")` datasource model.
- Set a strong `JWT_SECRET` before deploying.
