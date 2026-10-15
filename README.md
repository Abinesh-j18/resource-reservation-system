<div align="center">

# PrimeReserve

### Enterprise Resource Scheduling & Conflict Prevention System

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](#license)

<p align="center">
  A production-ready, centralized resource management platform designed to streamline corporate asset allocation, eliminate scheduling collisions through ACID concurrency control, and provide real-time visibility across shared physical infrastructure.
</p>

</div>

---

## 🌟 Executive Overview

In multi-team organizations, coordinating high-demand physical resources—such as executive conference suites, precision laboratory testing benches, calibration hardware, and fleet vehicles—frequently results in scheduling conflicts, administrative overhead, and operational bottlenecks.

**PrimeReserve** provides a unified, enterprise-grade solution that guarantees:
- **Zero Double-Bookings**: Atomic concurrency controls reject overlapping reservations in real time.
- **Immediate Conflict Intelligence**: Instant feedback identifying colliding reservations, booking owners, and time boundaries.
- **Operational Transparency**: Interactive hour-by-hour timeline schedule offering real-time visibility across all organizational assets.
- **Continuous Availability**: Resilient dual-mode architecture that operates natively against PostgreSQL with automated fallback capabilities.

---

## 🚀 Key Platform Capabilities

### 1. Intelligent Scheduling Engine
* **ACID Overlap Elimination**: Utilizes half-open time intervals `[start, end)` inside serialized transactions to prevent parallel booking collisions.
* **Precise Boundary Bookings**: Correctly allows back-to-back reservations (e.g., 10:00 AM – 11:00 AM and 11:00 AM – 12:00 PM) without false-positive rejections.
* **Multi-Resource Concurrency**: Permits simultaneous bookings across distinct assets during identical time windows.
* **Duration Constraints**: Enforces customizable booking limits (minimum 15 minutes, maximum 24 hours per session).

### 2. Operational Observability & Timeline
* **Interactive Timeline Matrix**: Visual hour-by-hour schedule grid across all departments and equipment categories.
* **Executive Metrics Dashboard**: Real-time KPI counters tracking active inventory, today's utilization, currently occupied assets, and upcoming bookings.
* **Live Operational Badges**: Color-coded status pills indicating whether an asset is *Available*, *In Use*, or *Under Maintenance*.

### 3. Dynamic Asset Management
* **Multi-Criteria Asset Catalog**: Filterable by category, operational status, and capacity thresholds.
* **Individual Asset Dossiers**: Dedicated specification views (`/resources/[id]`) presenting technical specs, locations, and queued bookings.
* **Maintenance Safeguards**: Administrative maintenance toggles immediately freeze scheduling on equipment undergoing servicing or calibration.
* **Non-Destructive Cancellation**: Soft cancellation frees capacity immediately while retaining historical audit logs for compliance.

### 4. Enterprise API & Integration
* Comprehensive REST API supporting full CRUD operations across resources and reservations.
* Returns standard HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, and `409 Conflict`).

---

## ⚡ Concurrency & Reliability Architecture

### Overlap Detection Mathematical Model
Collision validation is evaluated inside an atomic transaction using half-open temporal intervals:

$$\text{Overlap} \iff (\text{ExistingStart} < \text{NewEnd}) \land (\text{ExistingEnd} > \text{NewStart}) \land (\text{ExistingStatus} \neq \text{'CANCELLED'})$$

### Query Optimization
* **Compound Indexing**: Schema utilizes composite B-Tree indexes on `(resourceId, startTime, endTime)` to convert full-table scans into high-speed index range scans.
* **Transaction Isolation**: Wraps validation and insert queries within `prisma.$transaction` to guarantee serializable consistency under concurrent load.
* **Server-Side Validation**: All client payloads are strictly validated using Zod runtime schemas before database execution.

---

## 🔌 API Reference Overview

### Resources
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/resources` | Retrieve complete resource catalog with category relations |
| `POST` | `/api/resources` | Provision a new resource asset |
| `GET` | `/api/resources/:id` | Retrieve single resource specifications and active schedule |
| `PATCH` | `/api/resources/:id` | Update metadata, capacity, location, or maintenance status |
| `DELETE` | `/api/resources/:id` | Decommission a resource record |

### Reservations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/reservations` | Retrieve reservations (filterable by `resourceId`, `userId`, `status`) |
| `POST` | `/api/reservations` | Create reservation with atomic collision detection |
| `GET` | `/api/reservations/:id` | Retrieve reservation details by ID |
| `PATCH` | `/api/reservations/:id` | Update reservation parameters or cancel (`status: "CANCELLED"`) |
| `DELETE` | `/api/reservations/:id` | Remove a reservation record |

#### HTTP 409 Conflict Payload Example
When an overlapping reservation attempt occurs, the API returns HTTP 409 with full contextual metadata:
```json
{
  "success": false,
  "error": "Scheduling conflict: \"Apex Executive Boardroom\" is already reserved for \"Quarterly Business Review\" by Sarah Connor from 10:00 AM to 11:30 AM.",
  "conflictingReservation": {
    "id": "cmv6xjnpw...",
    "title": "Quarterly Business Review",
    "userName": "Sarah Connor",
    "startTime": "2026-10-16T10:00:00.000Z",
    "endTime": "2026-10-16T11:30:00.000Z"
  }
}
```

---

## 🛠️ Quick Start & Installation

### Prerequisites
* **Node.js**: `v18.18+` or `v20+` (LTS recommended)
* **PostgreSQL**: `v14+` (Local, Docker, or Cloud Managed)
* **npm** or **pnpm**

### 1. Clone & Install
```bash
git clone https://github.com/Abinesh-j18/resource-reservation-system.git
cd resource-reservation-system
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
# PostgreSQL Connection URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reservation_db?schema=public"

# Application Title
NEXT_PUBLIC_APP_NAME="PrimeReserve - Enterprise Resource Reservation System"
```

### 3. Database Initialization
```bash
# Automated deployment: generates Prisma client, executes migrations, and seeds initial data
npm run db:setup
```

*Useful Database Scripts:*
- `npm run db:deploy` &mdash; Apply versioned PostgreSQL migrations.
- `npm run db:seed` &mdash; Populate database with sample corporate dataset.
- `npm run db:studio` &mdash; Open Prisma Studio database management GUI on `http://localhost:5555`.

### 4. Launch Application
```bash
# Start development server
npm run dev

# Or build for production
npm run build
npm run start
```
The application will be live at **`http://localhost:3000`**.

---

## 🧪 Automated Testing & Verification

The project includes automated test suites validating business rules, edge cases, and end-to-end HTTP routes:

```bash
# 1. Run core business rules & conflict prevention test suite
npm test

# 2. Run live HTTP End-to-End API integration test suite
npm run test:e2e

# 3. Run ESLint code quality audit
npm run lint
```

### Automated Test Coverage
✔ **Time Bounds**: Rejection when start time equals or precedes end time (`start >= end`).  
✔ **Duration Limits**: Minimum 15 minutes, maximum 24 hours strictly enforced.  
✔ **Conflict Engine**: Full collision rejection across partial, enclosing, and nested intervals.  
✔ **Boundary Accuracy**: Half-open intervals allow exact touches without false rejections.  
✔ **Multi-Resource Isolation**: Simultaneous bookings on separate assets execute concurrently.  
✔ **Lifecycle Slot Release**: Cancelling an active booking immediately frees the slot.  
✔ **Maintenance Lockdown**: Equipment under scheduled maintenance blocks new reservations.  
✔ **Server Validation**: Malformed payloads, negative capacities, and invalid dates are rejected.  
✔ **HTTP 409 Metadata**: Detailed collision payload returns conflicting user, title, and time bounds.  

---

## 📁 Repository Structure

```
├── app/
│   ├── api/
│   │   ├── reservations/        # REST endpoints (/api/reservations & [id])
│   │   └── resources/           # REST endpoints (/api/resources & [id])
│   ├── dashboard/page.tsx       # Dedicated Executive Dashboard route
│   ├── reservations/
│   │   ├── new/page.tsx         # Standalone booking interface
│   │   └── page.tsx             # Reservation management and cancellation table
│   ├── resources/
│   │   ├── [id]/page.tsx        # Resource detail specification & upcoming queue
│   │   └── page.tsx             # Filterable Resource Catalog
│   ├── schedule/page.tsx        # Interactive hour-by-hour timeline schedule
│   ├── error.tsx                # Enterprise error boundary
│   ├── loading.tsx              # Skeleton loading state
│   ├── not-found.tsx            # Custom 404 handler
│   ├── layout.tsx               # Root application shell & navigation
│   └── page.tsx                 # Operations overview dashboard
├── components/
│   ├── dashboard/               # KPI metric cards and quick reservation triggers
│   ├── layout/                  # Navbar, responsive mobile drawer, and footer
│   ├── reservations/            # Reservation forms, tables, cancel dialogs, conflict alerts
│   ├── resources/               # Resource catalog cards, admin modals, filters
│   ├── schedule/                # Timeline matrix and schedule slots
│   └── ui/                      # Base UI primitives (buttons, dialogs, badges, inputs)
├── lib/
│   ├── actions/                 # Next.js Server Actions for reservations and resources
│   ├── demo-data.ts             # Resilient offline repository fallback
│   ├── prisma.ts                # Singleton Prisma client instance
│   ├── reservation-service.ts   # Core overlap algorithm & transaction engine
│   ├── utils.ts                 # Formatting helpers and class mergers
│   └── validations.ts           # Zod schemas for runtime validation
├── prisma/
│   ├── migrations/              # Versioned PostgreSQL migration history
│   ├── schema.prisma            # Production PostgreSQL schema definition
│   └── seed.ts                  # Enterprise seeder script
├── tests/
│   ├── verify-rules.ts          # Business rules & overlap test suite (npm test)
│   └── verify-live-e2e.ts       # Live HTTP integration test suite (npm run test:e2e)
├── .eslintrc.json               # ESLint configuration
├── package.json                 # Project dependencies and lifecycle scripts
├── tailwind.config.ts           # Tailwind CSS theme configuration
└── tsconfig.json                # TypeScript strict configuration
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
