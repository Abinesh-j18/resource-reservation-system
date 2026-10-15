# PrimeReserve — Enterprise Resource Reservation Management System

**PrimeReserve** is a high-performance, full-stack resource reservation and scheduling platform engineered to coordinate shared corporate and technical physical assets (executive conference suites, RF and acoustic testing labs, calibration rigs, and corporate fleet vehicles) with zero scheduling collisions.

Built with **Next.js 14 (App Router)**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, **Tailwind CSS**, and **shadcn/ui**.

---

## 🌟 System Highlights & Key Features

* **ACID Double-Booking Prevention Engine**: Enforces mathematical interval overlap checking inside atomic PostgreSQL transactions (`prisma.$transaction`), completely eliminating race conditions.
* **Instant Conflict Diagnostics (HTTP 409)**: Real-time conflict feedback identifying the exact conflicting reservation title, reserving user, and existing time boundaries.
* **Interactive Hour-by-Hour Timeline Grid**: Visual timeline view allowing real-time schedule inspection across all resources with day-by-day navigation and instant slot selection.
* **Multi-Criteria Resource Catalog**: Instant search and filtering by Category (Conference Rooms, Labs, Fleet Vehicles), Operational Status, and Minimum Capacity limits.
* **Dedicated Resource Specification View**: Dynamic routes (`/resources/[id]`) displaying physical location, capacity, technical specifications, and upcoming reservation queues.
* **Direct Booking Form**: Standalone reservation form (`/reservations/new`) with client-side datetime validation, duration boundary enforcement, and server validation.
* **Maintenance & Operational Safeguards**: Administrative maintenance toggles that prevent bookings on resources undergoing service or calibration.
* **Non-Destructive Soft Cancellation**: Reservation cancellations preserve historical audit trails while freeing the time slot for immediate re-booking.
* **Composite Query Optimization**: Compound B-Tree indexing on `(resourceId, startTime, endTime)` for fast collision lookups at scale.
* **Resilient Dual-Mode Operation**: Runs natively on PostgreSQL with seamless fallback to an in-memory store for offline demonstrations.

---

## 🏗️ Technical Architecture & Concurrency Model

### 1. Mathematical Overlap Prevention Algorithm
To prevent double bookings in multi-user concurrent environments, PrimeReserve uses **half-open intervals** $[start, end)$. Two reservations overlap if and only if:

$$\text{Overlap} \iff (\text{ExistingStart} < \text{NewEnd}) \land (\text{ExistingEnd} > \text{NewStart}) \land (\text{ExistingStatus} \neq \text{'CANCELLED'})$$

This mathematical formula guarantees that:
* Partially overlapping, enclosed, or enclosing reservations are strictly rejected.
* Exact boundary connections (e.g., 10:00 AM – 11:00 AM and 11:00 AM – 12:00 PM) succeed cleanly without false conflicts.
* Concurrent reservations for *different* resources during the exact same timeframe succeed independently.

### 2. Transaction Isolation & Performance Indexing
* **Database Transactions**: All booking validations and inserts run inside a serialized transaction block, preventing parallel double-booking race conditions.
* **Composite B-Tree Indexes**: The database schema enforces a compound index on `[resourceId, startTime, endTime]`. Conflict queries perform an indexed range scan instead of a full sequential scan.

### 3. Full-Stack Architecture
* **React Server Components (RSC)**: Dashboard metrics, catalog lists, and schedules are rendered on the server for minimal client bundle size and optimal initial page load.
* **Server Actions**: Mutations utilize Next.js Server Actions with granular cache revalidation (`revalidatePath`).
* **Zod Runtime Validation**: Every client input and API request is validated against strict schemas before hitting the database.

---

## 📊 Database Architecture

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

    resource_categories ||--o{ resources : "categorizes (1:N)"
    users ||--o{ reservations : "books (1:N)"
    resources ||--o{ reservations : "allocated_to (1:N)"
```

### Schema Details:
* **`users`**: Personnel directory supporting role-based permissions (`ADMIN`, `MEMBER`).
* **`resource_categories`**: Hierarchical grouping (e.g., Conference Rooms, Testing Equipment & Labs, Company Fleet).
* **`resources`**: Physical assets with capacity constraints, location data, operational status, and foreign key relations.
* **`reservations`**: Scheduled bookings linked to users and resources, indexed across time intervals.

---

## 🔌 REST API Specification

### Resources Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/resources` | List all resources with category and reservation details. |
| `POST` | `/api/resources` | Create a new resource (requires admin privileges). |
| `GET` | `/api/resources/:id` | Fetch detailed specifications and schedule for a single resource. |
| `PATCH` | `/api/resources/:id` | Update resource metadata, capacity, location, or maintenance status. |
| `DELETE` | `/api/resources/:id` | Delete a resource record. |

### Reservations Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/reservations` | List reservations (filterable by `resourceId`, `userId`, `status`). |
| `POST` | `/api/reservations` | Create a reservation with atomic double-booking collision checks. |
| `GET` | `/api/reservations/:id` | Fetch reservation details by ID. |
| `PATCH` | `/api/reservations/:id` | Update reservation parameters or cancel (`status: "CANCELLED"`). |
| `DELETE` | `/api/reservations/:id` | Hard-delete a reservation record. |

#### Conflict Response Payload (HTTP 409)
```json
{
  "success": false,
  "error": "Scheduling conflict: \"Apex Executive Boardroom\" is already reserved for \"Quarterly Business Review\" by Sarah Connor from 10:00 AM to 11:30 AM.",
  "conflictingReservation": {
    "id": "cmv6xjnr...",
    "title": "Quarterly Business Review",
    "userName": "Sarah Connor",
    "startTime": "2026-10-16T10:00:00.000Z",
    "endTime": "2026-10-16T11:30:00.000Z"
  }
}
```

---

## 🚀 Setup & Installation

### 1. Prerequisites
* **Node.js**: v18.18+ or v20+ (LTS)
* **PostgreSQL**: v14+ (Local instance, Docker, or hosted cloud provider)
* **npm** or **pnpm**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Abinesh-j18/resource-reservation-system.git
cd resource-reservation-system

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory (based on `.env.example`):
```env
# PostgreSQL Database Connection URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reservation_db?schema=public"

# Application Title
NEXT_PUBLIC_APP_NAME="PrimeReserve - Resource Reservation System"
```

### 4. Database Initialization & Automated Migrations
```bash
# Automated setup (Generates Prisma Client, runs migrations, and seeds initial data)
npm run db:setup

# Additional database utilities:
npm run db:deploy           # Apply pending PostgreSQL migrations
npm run db:seed             # Seed database with sample users and resources
npm run db:studio           # Launch visual Prisma Studio database manager on port 5555
```

### 5. Running the Application
```bash
# Start development server
npm run dev

# Or build and launch production server
npm run build
npm run start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Automated Test Suites

The system includes automated unit, validation, and live integration test suites:

```bash
# Run business rules and conflict algorithm verification (11 core test vectors)
npm test

# Run live HTTP API end-to-end integration tests against running server
npm run test:e2e

# Run linter verification
npm run lint
```

### Verified Test Cases:
1. Rejects reservations where `startTime == endTime`.
2. Rejects reservations where `startTime > endTime`.
3. Enforces duration boundaries (minimum 15 minutes, maximum 24 hours).
4. Detects and rejects overlapping intervals for the same resource.
5. Permits boundary bookings (e.g., 10:00–11:00 and 11:00–12:00 without false conflicts).
6. Allows concurrent bookings for different resources at identical times.
7. Verifies slot release upon reservation cancellation.
8. Rejects bookings on resources under maintenance.
9. Enforces Zod schema runtime validation on all inputs.
10. Validates resource attributes (capacity $\ge 1$, valid category, location).
11. Returns HTTP 409 Conflict with structured conflicting metadata.

---

## 📁 Project Directory Structure

```
├── app/
│   ├── api/
│   │   ├── reservations/        # REST endpoints (/api/reservations & /api/reservations/[id])
│   │   └── resources/           # REST endpoints (/api/resources & /api/resources/[id])
│   ├── dashboard/page.tsx       # Dedicated Executive Dashboard route
│   ├── reservations/
│   │   ├── new/page.tsx         # Dedicated New Reservation booking form
│   │   └── page.tsx             # Reservation management and cancellation table
│   ├── resources/
│   │   ├── [id]/page.tsx        # Resource detail specification & upcoming queue
│   │   └── page.tsx             # Filterable Resource Catalog
│   ├── schedule/page.tsx        # Interactive hour-by-hour timeline schedule
│   ├── error.tsx                # Error boundary
│   ├── loading.tsx              # Loading skeleton
│   ├── not-found.tsx            # Custom 404 page
│   ├── layout.tsx               # Root application layout with navigation
│   └── page.tsx                 # Main application dashboard
├── components/
│   ├── dashboard/               # KPI metric cards and quick reservation triggers
│   ├── layout/                  # Navbar, responsive mobile drawer, and footer
│   ├── reservations/            # Reservation forms, tables, cancel dialogs, conflict alerts
│   ├── resources/               # Resource catalog cards, admin modals, filters
│   ├── schedule/                # Timeline grid and calendar slots
│   └── ui/                      # Base UI primitives (buttons, dialogs, badges, inputs)
├── lib/
│   ├── actions/                 # Next.js Server Actions for reservations and resources
│   ├── demo-data.ts             # Realistic offline fallback repository
│   ├── prisma.ts                # Singleton Prisma client
│   ├── reservation-service.ts   # Core overlap algorithm & transaction handling
│   ├── utils.ts                 # Formatting helpers and class mergers
│   └── validations.ts           # Zod schemas for runtime validation
├── prisma/
│   ├── migrations/              # Versioned PostgreSQL migration history
│   ├── schema.prisma            # Production PostgreSQL schema definition
│   └── seed.ts                  # Database seeder script
├── tests/
│   ├── verify-rules.ts          # Business rules & overlap test suite (npm test)
│   └── verify-live-e2e.ts       # Live HTTP integration test suite (npm run test:e2e)
├── .eslintrc.json               # ESLint configuration
├── package.json                 # Project dependencies and operational scripts
├── tailwind.config.ts           # Tailwind CSS configuration
└── tsconfig.json                # TypeScript strict configuration
```

---

## 📄 License
MIT License. Created by [Abinesh-j18](https://github.com/Abinesh-j18).
