# PrimeReserve &mdash; Resource Reservation Management System

A production-grade, centralized web application built for **PrimeWave Lab** to coordinate shared physical resources (conference suites, high-precision laboratory test benches, company vehicles, and AV gear), eliminate overlapping bookings, and track real-time resource availability.

Built with **Next.js (App Router)**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, **Tailwind CSS**, and **shadcn/ui**.

---

## 🌟 Key Highlights & Engineering Features

- **Double-Booking Prevention Engine**: Enforces strict mathematical overlap detection wrapped in atomic database transactions (`prisma.$transaction`), eliminating race conditions.
- **Instant Conflict Alerting (HTTP 409)**: Real-time user feedback specifying conflicting times, users, and reasons when booking overlap occurs.
- **Interactive Schedule Timeline**: Hour-by-hour visual timeline of all resources with date-switching, status indicators, and one-click booking triggers.
- **Filterable Resource Catalog**: Multi-criteria search and filtering by Category, Operational Status, and Capacity limits.
- **Admin Management Modal**: Real-time resource onboarding, editing, and maintenance status toggling.
- **Composite Index Optimization**: Optimized compound B-Tree indexing on `[resourceId, startTime, endTime]` for query speeds at scale.
- **Reservation Lifecycle Management**: Confirmations, audit history, and one-click cancellation dialogs to release capacity.

---

## 🏗️ Architecture & Trade-Off Summary

### 1. Concurrency & Conflict Prevention Algorithm
In multi-user environments, race conditions occur when two users attempt to reserve the same resource at overlapping intervals simultaneously.
To guarantee ACID consistency, PrimeReserve executes booking validation and insertion within a **Database Transaction**:

$$\text{Conflict Condition: } (\text{existing.startTime} < \text{newEndTime}) \land (\text{existing.endTime} > \text{newStartTime}) \land (\text{existing.status} \neq \text{'CANCELLED'})$$

- **Implementation**: Handled in both Server Actions (`lib/actions/reservation-actions.ts`) and REST API handlers (`app/api/reservations/route.ts`).
- **HTTP 409 Conflict Response**: If an overlap is detected, the transaction aborts and returns an explicit `ConflictError` containing the exact conflicting booking title, time range, and reserving user.
- **Maintenance Lock**: Resources flagged as `MAINTENANCE` reject all new reservation attempts.

### 2. Database Indexing Trade-Offs
- We established a composite index on `[resourceId, startTime, endTime]`.
- **Trade-Off Rationale**: While adding write overhead during record insertion, it transforms conflict queries from a full-table sequential scan into an indexed index-range scan. For scheduling engines where reads/conflict validations outnumber writes by 20:1, this trade-off is critical for performance.

### 3. Next.js App Router Patterns
- **Server Components (RSC)**: Dashboard, Resource Catalog, and Schedule pages fetch data directly on the server via Prisma without client-side waterfall requests.
- **Client Components**: Granularly scoped to interactive islands (Dialogs, Filter bars, Date-pickers, Form validation via React Hook Form + Zod).
- **Server Actions & Revalidation**: Mutations invoke Server Actions with `revalidatePath` to trigger instant cache invalidation without full page reloads.

---

## 📊 Database Design (Entity-Relationship Diagram)

```mermaid
erDiagram
    users {
        String id PK "cuid"
        String name
        String email UK "unique"
        Role role "ADMIN | MEMBER"
        DateTime createdAt
    }

    resource_categories {
        String id PK "cuid"
        String name UK "unique"
        String description
        DateTime createdAt
    }

    resources {
        String id PK "cuid"
        String name
        String categoryId FK
        Int capacity "Default: 1"
        String location
        ResourceStatus status "AVAILABLE | MAINTENANCE"
        String description
        DateTime createdAt
    }

    reservations {
        String id PK "cuid"
        String title
        String userId FK
        String resourceId FK
        DateTime startTime "Indexed"
        DateTime endTime "Indexed"
        ReservationStatus status "CONFIRMED | CANCELLED"
        String purpose
        DateTime createdAt
        DateTime updatedAt
    }

    resource_categories ||--o{ resources : "classifies (1:N)"
    users ||--o{ reservations : "books (1:N)"
    resources ||--o{ reservations : "reserved_in (1:N)"
```

### Table Specifications:
- `users`: Stores organization personnel with role-based access (`ADMIN`, `MEMBER`).
- `resource_categories`: High-level taxonomy (Conference Rooms, Testing Equipment, Company Fleet, AV Gear).
- `resources`: Physical items with capacity, location, operational health, and category relation.
- `reservations`: Active and past bookings with composite index on `[resourceId, startTime, endTime]`.

---

## 🚀 Step-by-Step Local Setup

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+ (LTS)
- **PostgreSQL**: v14+ (Local instance, Docker, Supabase, Neon, or Railway)
- **Git**

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/your-username/resource-reservation-system.git
cd resource-reservation-system
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
# PostgreSQL Database Connection URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reservation_db?schema=public"

# Application Settings
NEXT_PUBLIC_APP_NAME="PrimeReserve - Resource Reservation Management System"
```

### 4. Automated Database Migration & Setup Workflow
PrimeReserve includes fully automated database migration and seeding scripts:

```bash
# Automated All-In-One Setup (Generates Prisma Client, Applies Migrations, & Seeds Data)
npm run db:setup

# OR run individual migration workflow steps:
npm run prisma:generate     # 1. Generate strongly-typed Prisma Client
npm run db:deploy           # 2. Automatically apply versioned PostgreSQL migrations (prisma/migrations)
npm run db:seed             # 3. Populate database with realistic mock data

# Optional commands during active development:
npm run db:migrate          # Create a new Prisma migration during schema development
npm run db:push             # Directly push schema changes without migration history
npm run db:studio           # Launch Prisma Studio GUI database browser on port 5555
```

### 6. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Automated Testing Suite (11 Core Rules & Conflict Prevention)

PrimeReserve includes an automated verification test suite covering all 11 business rules and conflict-prevention constraints from the PrimeWave Lab assessment brief:

```bash
# Run the automated verification test suite
npm test
```

#### Verified Acceptance Criteria:
1. **Rule 1**: Rejection when start time equals end time (`start == end`).
2. **Rule 2**: Rejection when start time is after end time (`start > end`).
3. **Rule 3**: Duration constraints (minimum 15 minutes, maximum 24 hours).
4. **Rule 4**: Overlap rejection across all vectors (partial, enclosed, enclosing intervals).
5. **Rule 5**: Half-open boundary allowance (10:00–11:00 and 11:00–12:00 succeed without conflict).
6. **Rule 6**: Multi-resource isolation (identical times allowed on different resources).
7. **Rule 7**: Slot release on cancellation (`CANCELLED` status does not block new bookings).
8. **Rule 8**: Maintenance protection (inactive/maintenance resources reject bookings).
9. **Rule 9**: Server-side validation (malformed payloads, missing IDs, or short titles rejected).
10. **Rule 10**: Resource attribute validation (capacity $\ge 1$, category, location).
11. **Rule 11**: HTTP 409 `ConflictError` with descriptive error payload and conflicting reservation metadata.

---

## 🔬 Testing the Conflict Prevention API Directly

You can verify the double-booking algorithm using `curl` or Postman:

#### Test 1: Successful Reservation
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hardware Validation",
    "userId": "<USER_ID>",
    "resourceId": "<RESOURCE_ID>",
    "startTime": "2026-10-15T14:00:00Z",
    "endTime": "2026-10-15T16:00:00Z",
    "purpose": "Scope probe calibration"
  }'
```
*Expected: HTTP 201 Created*

#### Test 2: Conflicting Overlap Reservation (Double-Booking Trigger)
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Overlapping Team Sync",
    "userId": "<ANOTHER_USER_ID>",
    "resourceId": "<SAME_RESOURCE_ID>",
    "startTime": "2026-10-15T15:00:00Z",
    "endTime": "2026-10-15T17:00:00Z"
  }'
```
*Expected: HTTP 409 Conflict with descriptive payload:*
```json
{
  "success": false,
  "error": "Scheduling conflict: \"Apex Executive Boardroom\" is already reserved for \"Hardware Validation\" from 02:00 PM to 04:00 PM.",
  "conflictingReservation": { ... }
}
```

---

## 📹 Scripted Outline for 3–5 Minute Demonstration Video

| Time Stamp | Section | Scripted Actions & Talking Points |
| :--- | :--- | :--- |
| **0:00 – 0:45** | **Introduction & Problem Context** | • Introduce yourself and PrimeReserve.<br>• Summarize PrimeWave Lab's business scenario: growing company facing scheduling confusion, overlapping bookings, and lack of visibility into equipment availability.<br>• Introduce the tech stack: Next.js App Router, TypeScript, PostgreSQL, Prisma, Tailwind CSS. |
| **0:45 – 1:45** | **Dashboard & High-Level KPIs** | • Walk through `/` (Dashboard).<br>• Highlight KPIs: Active Resources, Today's Confirmed Bookings, Currently In-Use Resources, and Upcoming Bookings.<br>• Point out the live status badges and Quick Reservation trigger. |
| **1:45 – 2:45** | **Resource Catalog & Filtering** | • Navigate to `/resources`.<br>• Demonstrate dynamic filtering: filter by Category (Conference Rooms, Labs, Fleet), Capacity thresholds, and Availability status.<br>• Show the Admin Resource Modal: creating a new resource and toggling a resource to "Under Maintenance" to prevent bookings. |
| **2:45 – 3:45** | **Double-Booking Prevention (The Core Logic)** | • Open `/schedule` to show the visual hour-by-hour timeline view.<br>• Select a resource and create a confirmed booking (e.g., 2:00 PM – 4:00 PM).<br>• Attempt to create a second reservation for the exact same resource overlapping the slot (e.g., 3:00 PM – 5:00 PM).<br>• **Showcase the Conflict Alert**: explain how the atomic transaction caught the overlap (`existing.start < newEnd AND existing.end > newStart`) and returned an HTTP 409 Conflict. |
| **3:45 – 4:30** | **Reservations Table & Cancellation Lifecycle** | • Navigate to `/reservations`.<br>• Show tabular view with filters (Upcoming, Past, Confirmed, Cancelled).<br>• Open booking details modal.<br>• Click "Cancel Reservation", show confirmation modal, and verify the time slot is immediately released for others. |
| **4:30 – 5:00** | **Engineering Architecture & Conclusion** | • Highlight key engineering decisions: Prisma ACID transactions, composite index on `[resourceId, startTime, endTime]`, Zod runtime validation, and responsive mobile-first UI.<br>• Conclude with readiness for deployment and thank the PrimeWave Lab review team. |

---

## 📁 Repository File Tree

```
├── app/
│   ├── api/
│   │   ├── reservations/
│   │   │   └── route.ts             # REST API for reservations (HTTP 409 Conflict)
│   │   └── resources/
│   │       └── route.ts             # REST API for resource catalog
│   ├── reservations/
│   │   └── page.tsx                 # My Reservations view with history & cancel
│   ├── resources/
│   │   └── page.tsx                 # Resource Catalog page with dynamic filters
│   ├── schedule/
│   │   └── page.tsx                 # Interactive visual schedule timeline view
│   ├── globals.css                  # Tailwind styles and custom palette tokens
│   ├── layout.tsx                   # Root application layout with navigation
│   └── page.tsx                     # Operations Dashboard with KPIs & quick booking
├── components/
│   ├── dashboard/
│   │   ├── kpi-cards.tsx            # KPI stat metric cards
│   │   └── quick-booking.tsx        # Quick booking triggers & upcoming feeds
│   ├── layout/
│   │   ├── footer.tsx               # System footer
│   │   └── navbar.tsx               # Global top navigation with brand & status
│   ├── reservations/
│   │   ├── cancel-dialog.tsx        # Cancellation confirmation modal
│   │   ├── conflict-alert.tsx       # HTTP 409 conflict & validation banner
│   │   ├── reservation-dialog.tsx   # Reservation booking form modal
│   │   └── reservations-table-view.tsx # Filterable reservations data table
│   ├── resources/
│   │   ├── resource-card.tsx        # Resource display card with live status
│   │   ├── resource-dialog.tsx      # Admin modal to create/edit resources
│   │   └── resource-filters.tsx     # Filter toolbar (category, status, capacity)
│   ├── schedule/
│   │   └── timeline-view.tsx        # Interactive hour-by-hour timeline grid
│   └── ui/                          # Reusable Radix UI & shadcn primitives
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
├── lib/
│   ├── actions/
│   │   ├── reservation-actions.ts   # Server Actions for reservations
│   │   └── resource-actions.ts      # Server Actions for resources & maintenance
│   ├── prisma.ts                    # Singleton Prisma database client
│   ├── reservation-service.ts       # Double-booking conflict prevention algorithm
│   ├── utils.ts                     # UI class mergers & date utilities
│   └── validations.ts               # Zod validation schemas
├── prisma/
│   ├── schema.prisma                # Normalized PostgreSQL schema & composite indexes
│   └── seed.ts                      # Multi-category, multi-resource seed script
├── .env.example                     # Environment template
├── next.config.mjs                  # Next.js configuration
├── package.json                     # Project manifest and scripts
├── postcss.config.mjs               # PostCSS configuration
├── tailwind.config.ts               # Tailwind CSS theme configuration
├── tsconfig.json                    # Strict TypeScript configuration
└── README.md                        # Documentation, ER diagram & video outline
```

---

## 📄 License
Developed for the **PrimeWave Lab Software Engineering Internship Technical Assessment**.
All rights reserved.
