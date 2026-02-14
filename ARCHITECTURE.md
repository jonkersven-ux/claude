# HostIQ — Architecture Document

> The Operating System for Corporate Sports Hospitality

## Product Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                   CLIENTS                            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  Web App     │  │  Host Mobile │  │  Public     │  │
│  │  (Next.js)   │  │  (PWA-ready) │  │  RSVP Page │  │
│  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘  │
└─────────┼────────────────┼─────────────────┼─────────┘
          │                │                 │
          ▼                ▼                 ▼
┌──────────────────────────────────────────────────────┐
│                   API GATEWAY                        │
│              Express + JWT Auth                      │
│           Multi-tenant middleware                    │
│                                                      │
│  ┌──────┐ ┌────────┐ ┌─────────┐ ┌──────────────┐  │
│  │ Auth │ │ Guests │ │ Matches │ │ Invitations  │  │
│  └──────┘ └────────┘ └─────────┘ └──────────────┘  │
│  ┌──────┐ ┌────────┐ ┌─────────┐ ┌──────────────┐  │
│  │Season│ │  ROI   │ │   AI    │ │ Marketplace  │  │
│  └──────┘ └────────┘ └─────────┘ └──────────────┘  │
└──────────────────────┬───────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│  PostgreSQL  │ │ AI Layer │ │    Email      │
│  (Prisma)    │ │(Swappable│ │   Service     │
│              │ │ Provider)│ │              │
└──────────────┘ └──────────┘ └──────────────┘
```

## Monorepo Structure

```
hostiq/
├── apps/
│   ├── api/                      # Express REST API
│   │   └── src/
│   │       ├── server.ts         # Entry point
│   │       ├── app.ts            # Express app config
│   │       ├── middleware/
│   │       │   ├── authenticate.ts   # JWT + tenant guard
│   │       │   ├── error-handler.ts  # Centralized error handling
│   │       │   └── validate.ts       # Zod request validation
│   │       ├── modules/
│   │       │   ├── auth/         # Registration, login, JWT
│   │       │   ├── guests/       # Guest CRUD + search
│   │       │   ├── matches/      # Match CRUD + planning
│   │       │   ├── invitations/  # Invite flow + RSVP
│   │       │   ├── seasons/      # Season management
│   │       │   ├── dashboard/    # Overview + ROI endpoints
│   │       │   └── ai/           # AI service + routes
│   │       └── lib/              # Shared utilities
│   │
│   └── web/                      # Next.js frontend
│       └── src/
│           ├── app/              # App Router pages
│           │   ├── page.tsx          # Landing page
│           │   ├── login/            # Auth pages
│           │   ├── dashboard/        # Main dashboard
│           │   ├── matches/          # Match list + detail
│           │   ├── guests/           # Guest CRM + profiles
│           │   ├── invitations/      # Invitation management
│           │   ├── roi/              # ROI dashboard
│           │   ├── host/             # Host companion (mobile)
│           │   └── settings/         # Account settings
│           ├── components/
│           │   ├── layout/       # Sidebar, app layout
│           │   └── ui/           # KPI cards, badges, tables
│           └── lib/
│               └── api.ts        # API client
│
├── packages/
│   ├── database/                 # Prisma schema + client
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Full database schema
│   │   │   └── seed.ts          # Demo data
│   │   └── src/
│   │       └── index.ts         # Prisma client export
│   │
│   └── shared/                   # Shared constants/types
│       └── src/
│           └── index.ts
│
├── .env.example
├── package.json                  # Workspace root
└── tsconfig.base.json
```

## Database Schema (22 tables)

### Tenant & Auth
- **companies** — Multi-tenant root. Plan, settings, isolation boundary.
- **users** — RBAC: OWNER, ADMIN, MANAGER, MEMBER, HOST.

### Module 1: Season Planning
- **venues** — Sports venues (stadiums, arenas).
- **seasons** — Time-bounded containers (e.g., 2026/2027).
- **seat_blocks** — SKYBOX, BUSINESS_SEAT, VIP_LOUNGE, SUITE.
- **matches** — Fixtures with priority (A_MATCH/HIGH/NORMAL/LOW) and objective.

### Module 2: Guest Intelligence CRM
- **guests** — Full CRM records with commercial value, relationship stage, tags.
- **opportunities** — Pipeline tracking linked to guests.

### Module 3: Invitation & Event Flow
- **invitations** — Full lifecycle: DRAFT → SENT → ACCEPTED → CHECKED_IN.
- **seat_allocations** — Guest-to-seat mapping per match.
- **invitation_templates** — Branded HTML email templates.

### Module 4: Host Companion
- **event_notes** — Live matchday notes (text + voice).
- **follow_up_tasks** — Post-match action items with priority.

### Module 5: ROI & Performance
- **costs** — Categorized spend (SEASON_PASS, CATERING, TRANSPORT, etc.).
- **revenues** — Match-linked revenue with attribution flag.

### Module 6: Marketplace (Phase 2)
- **marketplace_services** — HOST_BOOKING, TRANSPORT, GIFT, EXPERIENCE.
- **marketplace_bookings** — Company bookings for add-on services.

### AI System
- **ai_insights** — Generated recommendations, alerts, email drafts.
- **prompt_templates** — Versioned, per-company customizable prompts.

## API Structure (v1)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Company + owner registration |
| POST | `/auth/login` | JWT login |
| GET | `/auth/me` | Current user + company |
| GET | `/guests` | List guests (search, filter, paginate) |
| GET | `/guests/:id` | Guest detail + history |
| POST | `/guests` | Create guest |
| PATCH | `/guests/:id` | Update guest |
| DELETE | `/guests/:id` | Soft delete |
| GET | `/matches` | List matches (filter by season, status) |
| GET | `/matches/:id` | Match detail + invitations + costs |
| POST | `/matches` | Create match |
| PATCH | `/matches/:id` | Update match |
| GET | `/invitations` | List invitations |
| POST | `/invitations` | Create single invitation |
| POST | `/invitations/batch` | Batch invite (up to 50) |
| PATCH | `/invitations/:id/status` | Update RSVP status |
| POST | `/rsvp/:qrCode` | Public RSVP endpoint |
| GET | `/seasons` | List seasons |
| GET | `/seasons/:id` | Season detail + matches |
| POST | `/seasons` | Create season |
| GET | `/dashboard/overview` | KPIs, funnel, upcoming matches |
| GET | `/dashboard/roi` | Cost breakdown, match perf, deals |
| POST | `/ai/follow-up-email` | Generate follow-up email |
| POST | `/ai/guest-prioritization` | AI guest ranking for match |
| POST | `/ai/conversation-summary` | Summarize event notes |
| GET | `/ai/insights` | List AI insights |
| PATCH | `/ai/insights/:id/dismiss` | Dismiss insight |

## AI System Architecture

```
┌─────────────────────────────────────────┐
│           AI Service Layer              │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  Provider Abstraction            │   │
│  │  ┌──────────┐ ┌──────┐ ┌─────┐  │   │
│  │  │Anthropic │ │OpenAI│ │Azure│  │   │
│  │  └──────────┘ └──────┘ └─────┘  │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  Template Engine                 │   │
│  │  - Load from database            │   │
│  │  - Company override support      │   │
│  │  - Variable interpolation        │   │
│  │  - Versioning                    │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  Domain Functions                │   │
│  │  - generateFollowUpEmail()       │   │
│  │  - generateGuestPrioritization() │   │
│  │  - generateConversationSummary() │   │
│  │  - generateRoiInsights()         │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Prompt Templates (stored in DB)

| Slug | Purpose | Temperature |
|------|---------|-------------|
| `follow-up-email` | Post-match personalized follow-up | 0.7 |
| `guest-prioritization` | Rank guests for optimal match allocation | 0.4 |
| `conversation-summary` | Distill matchday notes into actions | 0.3 |
| `roi-insight` | Generate natural language ROI analysis | 0.5 |

## Multi-Tenancy Model

- Every table with business data includes a `companyId` foreign key
- Middleware extracts `companyId` from JWT and injects into request
- All queries are scoped: `WHERE companyId = :tenantId`
- No cross-tenant data access is possible at the query layer
- Row-level security can be added at the Postgres level for defense-in-depth

## Security Considerations

1. **Authentication**: bcrypt password hashing (12 rounds), JWT with expiry
2. **Authorization**: Role-based (OWNER > ADMIN > MANAGER > MEMBER > HOST)
3. **Tenant isolation**: Enforced at middleware + query level
4. **Input validation**: Zod schemas on every mutation endpoint
5. **SQL injection**: Prevented by Prisma parameterized queries
6. **XSS**: React auto-escapes, Helmet headers on API
7. **CORS**: Restricted to configured frontend origin
8. **Rate limiting**: To be added (express-rate-limit)
9. **Secrets**: Environment variables, never in code
10. **Audit trail**: Timestamps on all records, soft deletes

## Monetization Model (Embedded in Architecture)

| Feature | Starter (€299/mo) | Professional (€799/mo) | Enterprise (Custom) |
|---------|-------------------|----------------------|-------------------|
| Users | 5 | 15 | Unlimited |
| Venues | 1 | 3 | Unlimited |
| Guests | 100 | Unlimited | Unlimited |
| AI Features | — | Follow-up emails, summaries | Full AI suite |
| ROI Dashboard | Basic | Full | Advanced analytics |
| Host App | — | Yes | Yes |
| Integrations | — | — | HubSpot, Salesforce, SSO |
| API Access | — | — | Yes |
| Marketplace | — | — | Yes |

Plan enforcement is embedded in the `Company.plan` field and `maxSeats`/`maxUsers` limits.

## Scaling Roadmap (1,000+ companies)

### Phase 1: Foundation (Current)
- Monolith API, single Postgres instance
- Suitable for 0–100 companies

### Phase 2: Optimization (100–500 companies)
- Connection pooling (PgBouncer)
- Redis caching for dashboard queries
- Background job queue (BullMQ) for emails, AI generation
- CDN for static assets
- Read replicas for reporting queries

### Phase 3: Scale (500–2,000 companies)
- Horizontal API scaling (stateless, behind load balancer)
- Database partitioning by company_id
- Dedicated AI processing queue
- Event-driven architecture (webhooks, pub/sub)
- Monitoring: Datadog/Grafana

### Phase 4: Enterprise (2,000+ companies)
- Optional database-per-tenant for enterprise customers
- Regional deployment (EU, UK, US)
- SOC 2 / ISO 27001 compliance
- Custom SLA tiers
- White-label capability
