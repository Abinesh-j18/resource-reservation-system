import { PrismaClient } from "@prisma/client";
import { Role, ResourceStatus, ReservationStatus } from "../lib/types";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding for PrimeReserve...");

  // Clean existing tables in topological order
  await prisma.reservation.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.resourceCategory.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users
  console.log("👤 Creating seed users...");
  const admin = await prisma.user.create({
    data: {
      name: "Alex Chen",
      email: "alex.chen@primewave.io",
      role: Role.ADMIN,
    },
  });

  const member1 = await prisma.user.create({
    data: {
      name: "Sarah Connor",
      email: "sarah.connor@primewave.io",
      role: Role.MEMBER,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: "David Miller",
      email: "david.miller@primewave.io",
      role: Role.MEMBER,
    },
  });

  const member3 = await prisma.user.create({
    data: {
      name: "Maya Patel",
      email: "maya.patel@primewave.io",
      role: Role.MEMBER,
    },
  });

  // 2. Seed Categories
  console.log("🏢 Creating resource categories...");
  const catRooms = await prisma.resourceCategory.create({
    data: {
      name: "Conference Rooms",
      description: "Collaborative meeting suites, huddle pods, and all-hands presentation halls.",
    },
  });

  const catLab = await prisma.resourceCategory.create({
    data: {
      name: "Testing Equipment & Labs",
      description: "Calibrated hardware, RF analyzers, cleanrooms, and automated testing rigs.",
    },
  });

  const catFleet = await prisma.resourceCategory.create({
    data: {
      name: "Company Fleet",
      description: "Zero-emission electric vehicles and transport vans for client visits and dispatch.",
    },
  });

  const catAV = await prisma.resourceCategory.create({
    data: {
      name: "AV & Production Gear",
      description: "Studio 4K cameras, wireless lavalier microphones, and portable stage lighting.",
    },
  });

  // 3. Seed Resources
  console.log("📦 Creating resources...");
  const resApex = await prisma.resource.create({
    data: {
      name: "Apex Executive Boardroom",
      categoryId: catRooms.id,
      capacity: 20,
      location: "Tower A, 4th Floor, Suite 401",
      status: ResourceStatus.AVAILABLE,
      description: "Equipped with dual 85-inch 4K HDR displays, Zoom Rooms appliance, and 360-degree beamforming mics.",
    },
  });

  const resOrion = await prisma.resource.create({
    data: {
      name: "Orion Ideation Pod",
      categoryId: catRooms.id,
      capacity: 6,
      location: "Building B, 2nd Floor, Pod 2B",
      status: ResourceStatus.AVAILABLE,
      description: "Acoustic dampening glass, digital whiteboard, and wireless AirPlay/Miracast receiver.",
    },
  });

  const resNexus = await prisma.resource.create({
    data: {
      name: "Nexus Town Hall",
      categoryId: catRooms.id,
      capacity: 120,
      location: "Building A, Ground Floor Atrium",
      status: ResourceStatus.AVAILABLE,
      description: "Auditorium seating with full line-array PA system, laser projector, and live broadcast switcher.",
    },
  });

  const resRig = await prisma.resource.create({
    data: {
      name: "Keysight 50GHz Oscilloscope Rig",
      categoryId: catLab.id,
      capacity: 2,
      location: "Hardware Lab 2, Bench 07",
      status: ResourceStatus.AVAILABLE,
      description: "Infiniium UXR-Series high-bandwidth oscilloscope with calibrated differential probes.",
    },
  });

  const resSpectrum = await prisma.resource.create({
    data: {
      name: "Rohde & Schwarz RF Spectrum Analyzer",
      categoryId: catLab.id,
      capacity: 1,
      location: "RF Shielded Room, Station 1",
      status: ResourceStatus.MAINTENANCE,
      description: "Precision electromagnetic compliance analyzer. Currently undergoing ISO annual recalibration.",
    },
  });

  const resChamber = await prisma.resource.create({
    data: {
      name: "Anechoic Testing Chamber",
      categoryId: catLab.id,
      capacity: 4,
      location: "Sub-level B1, Acoustic Wing",
      status: ResourceStatus.AVAILABLE,
      description: "Fully isolated sound-absorbing chamber for high-precision acoustic validation.",
    },
  });

  const resFleetEV = await prisma.resource.create({
    data: {
      name: "Tesla Model Y (Fleet EV-01)",
      categoryId: catFleet.id,
      capacity: 5,
      location: "North Parking Lot, Stall EV-12",
      status: ResourceStatus.AVAILABLE,
      description: "All-wheel drive electric SUV with toll transponder and client transport clearance.",
    },
  });

  const resVan = await prisma.resource.create({
    data: {
      name: "Ford Transit Cargo Van",
      categoryId: catFleet.id,
      capacity: 3,
      location: "Logistics Bay 3",
      status: ResourceStatus.AVAILABLE,
      description: "Heavy payload van for delivery of prototype equipment and hardware exhibition setups.",
    },
  });

  // 4. Seed Realistic Reservations (Past, Current, Future)
  console.log("📅 Creating sample confirmed reservations...");
  const now = new Date();

  // Past reservation (Yesterday)
  const pastStart = new Date(now);
  pastStart.setDate(pastStart.getDate() - 1);
  pastStart.setHours(10, 0, 0, 0);
  const pastEnd = new Date(pastStart);
  pastEnd.setHours(12, 0, 0, 0);

  await prisma.reservation.create({
    data: {
      title: "Sprint 42 Retrospective",
      userId: member1.id,
      resourceId: resApex.id,
      startTime: pastStart,
      endTime: pastEnd,
      status: ReservationStatus.CONFIRMED,
      purpose: "Bi-weekly retrospective and action item assignment.",
    },
  });

  // Active / Current reservation (Occupying Apex Boardroom right now)
  const currentStart = new Date(now);
  currentStart.setHours(currentStart.getHours() - 1);
  const currentEnd = new Date(now);
  currentEnd.setHours(currentEnd.getHours() + 1);

  await prisma.reservation.create({
    data: {
      title: "Executive Strategic Review",
      userId: admin.id,
      resourceId: resApex.id,
      startTime: currentStart,
      endTime: currentEnd,
      status: ReservationStatus.CONFIRMED,
      purpose: "Quarterly budget allocation and organizational roadmap review.",
    },
  });

  // Future reservation 1 (Later today in Orion Pod)
  const futureStart1 = new Date(now);
  futureStart1.setHours(now.getHours() + 2, 0, 0, 0);
  const futureEnd1 = new Date(futureStart1);
  futureEnd1.setHours(futureStart1.getHours() + 2);

  await prisma.reservation.create({
    data: {
      title: "Architecture Spike Sync",
      userId: member2.id,
      resourceId: resOrion.id,
      startTime: futureStart1,
      endTime: futureEnd1,
      status: ReservationStatus.CONFIRMED,
      purpose: "Discussion on database indexing and transaction isolation tiers.",
    },
  });

  // Future reservation 2 (Tomorrow morning in Keysight Rig)
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(9, 30, 0, 0);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(12, 0, 0, 0);

  await prisma.reservation.create({
    data: {
      title: "PCB High-Speed Bus Debugging",
      userId: member3.id,
      resourceId: resRig.id,
      startTime: tomorrowStart,
      endTime: tomorrowEnd,
      status: ReservationStatus.CONFIRMED,
      purpose: "Jitter analysis and eye-diagram validation for board rev 2.1.",
    },
  });

  // Future reservation 3 (Tomorrow afternoon for Fleet Vehicle)
  const fleetStart = new Date(now);
  fleetStart.setDate(fleetStart.getDate() + 1);
  fleetStart.setHours(14, 0, 0, 0);
  const fleetEnd = new Date(fleetStart);
  fleetEnd.setHours(17, 30, 0, 0);

  await prisma.reservation.create({
    data: {
      title: "Field Deployment & Customer Demo",
      userId: member1.id,
      resourceId: resFleetEV.id,
      startTime: fleetStart,
      endTime: fleetEnd,
      status: ReservationStatus.CONFIRMED,
      purpose: "On-site installation and testing at partner facility.",
    },
  });

  // Sample Cancelled reservation (to demonstrate audit trail)
  const cancelledStart = new Date(now);
  cancelledStart.setDate(cancelledStart.getDate() + 2);
  cancelledStart.setHours(11, 0, 0, 0);
  const cancelledEnd = new Date(cancelledStart);
  cancelledEnd.setHours(12, 0, 0, 0);

  await prisma.reservation.create({
    data: {
      title: "Marketing Video Filming",
      userId: member2.id,
      resourceId: resNexus.id,
      startTime: cancelledStart,
      endTime: cancelledEnd,
      status: ReservationStatus.CANCELLED,
      purpose: "Rescheduled due to guest speaker availability.",
    },
  });

  console.log("✅ Seed completed successfully with 4 users, 4 categories, 8 resources, and 6 reservations!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
