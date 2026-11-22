# Bidium

Online auction platform: sellers create auctions with lots (photos, videos,
details, categories), buyers bid in real time or buy lots instantly, winners
pay through Stripe and track delivery. Administrators approve auctions, manage
users and see statistics.

## Stack

- **Next.js 14** (App Router for pages and REST API, Pages Router for NextAuth and Socket.io)
- **TypeScript**, **Tailwind CSS**, shadcn/ui, React Query, react-hook-form + Zod
- **MongoDB** through **Prisma**
- **Socket.io** for live bidding, **Stripe** for payments, **Cloudinary** for media,
  **NextAuth** (credentials, Google, GitHub), nodemailer for e-mail verification
- **Vitest** for unit tests

## Getting started

```bash
npm ci
cp .env .env.local   # then fill in the secrets listed below
npx prisma generate
npx prisma db push
npm run dev          # http://localhost:3000
```

Environment variables (`.env.local`):

| Variable                                                                                                     | Purpose                                                           |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `DATABASE_URL`                                                                                               | MongoDB connection string (replica set required for transactions) |
| `NEXTAUTH_SECRET`, `JWT_SECRET`                                                                              | Session and e-mail verification tokens                            |
| `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`                               | OAuth providers                                                   |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`                                                                 | Payments; run `npm run stripe:webhook` locally                    |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER_NAME` | Media storage                                                     |
| `EMAIL_USER`, `EMAIL_PASSWORD` (optional `SMTP_HOST`, `SMTP_PORT`)                                           | Verification e-mails                                              |
| `NEXT_PUBLIC_BASE_URL`                                                                                       | Public URL of the app                                             |

Scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`,
`npm test` (`npm run test:watch`).

## Architecture

```
app/
  (public)/, (private)/   pages and their local components, hooks and schemas
  api/                    REST route handlers: parse the request, call a service, return JSON
  queries/                React Query hooks (the only place the client talks to the API)
  providers/              socket, auth user, React Query, i18n, locale, toasts
  _shared/
    domain/               pure business rules shared by client and server
                          (lot schedule, auction/lot status, bidding rules)
    socket/               typed Socket.io event contract
    types/, schemas/      shared types and form schemas
server/
  http/                   withAuth / withErrorHandling decorators, HttpError,
                          request validation, media route factory
  schemas/                Zod schemas of every request body and query
  auth/                   AccessPolicy: who may manage an auction, admin checks
  services/               business logic: auctions (catalogue pagination), lots,
                          media (photo/video strategy), bids and finalization,
                          payments + Stripe webhook, auth, users, orders, stats
  realtime/               Socket.io gateway: session auth, lot rooms, event
                          publisher, server-side finalization scheduler
pages/api/                NextAuth handler and Socket.io bootstrap
lib/                      Prisma client singleton
tests/                    Vitest unit tests (domain, services, HTTP layer, realtime)
```

Request flow: `route.ts` → `withAuth` (session, role, error mapping) →
`parseBody`/`parseQuery` (Zod) → service (authorization through
`AccessPolicy`, Prisma) → JSON. WebSocket bids go through
`server/realtime/bid-gateway.ts` into the same `BidService`, so REST and
real-time bidding share one set of rules.

### Bidding rules

Implemented in `app/_shared/domain/bidding.ts` and enforced by
`BidService.place`:

- the auction must be published and approved and the lot's time slot open;
- the owner of the auction cannot bid, nor can the current top bidder;
- a bid must be at least the start bid, or the top bid plus the minimum increment;
- the bidder is always the authenticated user.

A lot is finalized by the server (`BidService.finalizeLot`) when the last bid
has been silent for 15 seconds or the slot has ended: the top bid becomes the
winner and the lot is marked as sold. The server re-arms a timer after every
bid; clients may additionally call `POST /api/auction/:id/lot/:id/finalize`,
which is validated and idempotent. Everybody in the lot room receives
`bidCreated`, `bidRejected` and `lotFinalized` events.

## Tests and CI

`npm test` runs the unit tests in `tests/`. Services are tested with fake
Prisma delegates injected through their constructors, so no database is
needed. GitHub Actions runs lint, type check, tests and the production build on
every push and pull request to `dev`.
