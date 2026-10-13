import { Role, ResourceStatus, ReservationStatus } from "./types";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

export interface DemoCategory {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface DemoResource {
  id: string;
  name: string;
  categoryId: string;
  category: DemoCategory;
  capacity: number;
  location: string;
  status: "AVAILABLE" | "MAINTENANCE";
  description: string;
  createdAt: Date;
  reservations: DemoReservation[];
}

export interface DemoReservation {
  id: string;
  title: string;
  userId: string;
  user: DemoUser;
  resourceId: string;
  resource?: {
    id: string;
    name: string;
    location: string;
    capacity: number;
    category?: { id: string; name: string };
  };
  startTime: Date;
  endTime: Date;
  status: "CONFIRMED" | "CANCELLED";
  purpose: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// 1. Initial Users
const initialUsers: DemoUser[] = [
  { id: "usr_alex", name: "Alex Chen", email: "alex.chen@primewave.io", role: Role.ADMIN, createdAt: new Date() },
  { id: "usr_sarah", name: "Sarah Connor", email: "sarah.connor@primewave.io", role: Role.MEMBER, createdAt: new Date() },
  { id: "usr_david", name: "David Miller", email: "david.miller@primewave.io", role: Role.MEMBER, createdAt: new Date() },
  { id: "usr_maya", name: "Maya Patel", email: "maya.patel@primewave.io", role: Role.MEMBER, createdAt: new Date() },
];

// 2. Initial Categories
const catRooms: DemoCategory = {
  id: "cat_conf_rooms",
  name: "Conference Rooms",
  description: "Collaborative meeting suites, huddle pods, and all-hands presentation halls.",
  createdAt: new Date(),
};
const catLabs: DemoCategory = {
  id: "cat_testing_labs",
  name: "Testing Equipment & Labs",
  description: "Calibrated hardware, RF analyzers, cleanrooms, and automated testing rigs.",
  createdAt: new Date(),
};
const catFleet: DemoCategory = {
  id: "cat_company_fleet",
  name: "Company Fleet",
  description: "Zero-emission electric vehicles and transport vans for client visits and dispatch.",
  createdAt: new Date(),
};
const catAV: DemoCategory = {
  id: "cat_av_gear",
  name: "AV & Production Gear",
  description: "Studio 4K cameras, wireless lavalier microphones, and portable stage lighting.",
  createdAt: new Date(),
};

const initialCategories: DemoCategory[] = [catRooms, catLabs, catFleet, catAV];

// Calculate dynamic today dates
const now = new Date();

// Past
const pastStart = new Date(now);
pastStart.setDate(pastStart.getDate() - 1);
pastStart.setHours(10, 0, 0, 0);
const pastEnd = new Date(pastStart);
pastEnd.setHours(12, 0, 0, 0);

// Current (Occupying Apex Boardroom right now)
const currentStart = new Date(now);
currentStart.setHours(currentStart.getHours() - 1);
const currentEnd = new Date(now);
currentEnd.setHours(currentEnd.getHours() + 1);

// Future 1 (Orion Pod today +2 hours)
const future1Start = new Date(now);
future1Start.setHours(future1Start.getHours() + 2, 0, 0, 0);
const future1End = new Date(future1Start);
future1End.setHours(future1Start.getHours() + 2);

// Future 2 (Tomorrow morning in Keysight Rig)
const future2Start = new Date(now);
future2Start.setDate(future2Start.getDate() + 1);
future2Start.setHours(9, 30, 0, 0);
const future2End = new Date(future2Start);
future2End.setHours(12, 0, 0, 0);

// Future 3 (Tomorrow afternoon for Fleet Vehicle)
const future3Start = new Date(now);
future3Start.setDate(future3Start.getDate() + 1);
future3Start.setHours(14, 0, 0, 0);
const future3End = new Date(future3Start);
future3End.setHours(17, 30, 0, 0);

// Sample Cancelled reservation
const cancelledStart = new Date(now);
cancelledStart.setDate(cancelledStart.getDate() + 2);
cancelledStart.setHours(11, 0, 0, 0);
const cancelledEnd = new Date(cancelledStart);
cancelledEnd.setHours(12, 0, 0, 0);

// 3. Initial Resources
const initialResources: DemoResource[] = [
  {
    id: "res_apex_boardroom",
    name: "Apex Executive Boardroom",
    categoryId: catRooms.id,
    category: catRooms,
    capacity: 20,
    location: "Tower A, 4th Floor, Suite 401",
    status: ResourceStatus.AVAILABLE,
    description: "Equipped with dual 85-inch 4K HDR displays, Zoom Rooms appliance, and 360-degree beamforming mics.",
    createdAt: new Date(),
    reservations: [],
  },
  {
    id: "res_orion_pod",
    name: "Orion Ideation Pod",
    categoryId: catRooms.id,
    category: catRooms,
    capacity: 6,
    location: "Building B, 2nd Floor, Pod 2B",
    status: ResourceStatus.AVAILABLE,
    description: "Acoustic dampening glass, digital whiteboard, and wireless AirPlay/Miracast receiver.",
    createdAt: new Date(),
    reservations: [],
  },
  {
    id: "res_nexus_hall",
    name: "Nexus Town Hall",
    categoryId: catRooms.id,
    category: catRooms,
    capacity: 120,
    location: "Building A, Ground Floor Atrium",
    status: ResourceStatus.AVAILABLE,
    description: "Auditorium seating with full line-array PA system, laser projector, and live broadcast switcher.",
    createdAt: new Date(),
    reservations: [],
  },
  {
    id: "res_keysight_rig",
    name: "Keysight 50GHz Oscilloscope Rig",
    categoryId: catLabs.id,
    category: catLabs,
    capacity: 2,
    location: "Hardware Lab 2, Bench 07",
    status: ResourceStatus.AVAILABLE,
    description: "Infiniium UXR-Series high-bandwidth oscilloscope with calibrated differential probes.",
    createdAt: new Date(),
    reservations: [],
  },
  {
    id: "res_spectrum_analyzer",
    name: "Rohde & Schwarz RF Spectrum Analyzer",
    categoryId: catLabs.id,
    category: catLabs,
    capacity: 1,
    location: "RF Shielded Room, Station 1",
    status: ResourceStatus.MAINTENANCE,
    description: "Precision electromagnetic compliance analyzer. Currently undergoing ISO annual recalibration.",
    createdAt: new Date(),
    reservations: [],
  },
  {
    id: "res_anechoic_chamber",
    name: "Anechoic Testing Chamber",
    categoryId: catLabs.id,
    category: catLabs,
    capacity: 4,
    location: "Sub-level B1, Acoustic Wing",
    status: ResourceStatus.AVAILABLE,
    description: "Fully isolated sound-absorbing chamber for high-precision acoustic validation.",
    createdAt: new Date(),
    reservations: [],
  },
  {
    id: "res_tesla_model_y",
    name: "Tesla Model Y (Fleet EV-01)",
    categoryId: catFleet.id,
    category: catFleet,
    capacity: 5,
    location: "North Parking Lot, Stall EV-12",
    status: ResourceStatus.AVAILABLE,
    description: "All-wheel drive electric SUV with toll transponder and client transport clearance.",
    createdAt: new Date(),
    reservations: [],
  },
  {
    id: "res_ford_transit_van",
    name: "Ford Transit Cargo Van",
    categoryId: catFleet.id,
    category: catFleet,
    capacity: 3,
    location: "Logistics Bay 3",
    status: ResourceStatus.AVAILABLE,
    description: "Heavy payload van for delivery of prototype equipment and hardware exhibition setups.",
    createdAt: new Date(),
    reservations: [],
  },
];

// 4. Initial Reservations
const initialReservations: DemoReservation[] = [
  {
    id: "resv_sprint_retro",
    title: "Sprint 42 Retrospective",
    userId: initialUsers[1].id,
    user: initialUsers[1],
    resourceId: initialResources[0].id,
    startTime: pastStart,
    endTime: pastEnd,
    status: ReservationStatus.CONFIRMED,
    purpose: "Bi-weekly retrospective and action item assignment.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "resv_exec_review",
    title: "Executive Strategic Review",
    userId: initialUsers[0].id,
    user: initialUsers[0],
    resourceId: initialResources[0].id,
    startTime: currentStart,
    endTime: currentEnd,
    status: ReservationStatus.CONFIRMED,
    purpose: "Quarterly budget allocation and organizational roadmap review.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "resv_arch_sync",
    title: "Architecture Spike Sync",
    userId: initialUsers[2].id,
    user: initialUsers[2],
    resourceId: initialResources[1].id,
    startTime: future1Start,
    endTime: future1End,
    status: ReservationStatus.CONFIRMED,
    purpose: "Discussion on database indexing and transaction isolation tiers.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "resv_pcb_debug",
    title: "PCB High-Speed Bus Debugging",
    userId: initialUsers[3].id,
    user: initialUsers[3],
    resourceId: initialResources[3].id,
    startTime: future2Start,
    endTime: future2End,
    status: ReservationStatus.CONFIRMED,
    purpose: "Jitter analysis and eye-diagram validation for board rev 2.1.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "resv_fleet_demo",
    title: "Field Deployment & Customer Demo",
    userId: initialUsers[1].id,
    user: initialUsers[1],
    resourceId: initialResources[6].id,
    startTime: future3Start,
    endTime: future3End,
    status: ReservationStatus.CONFIRMED,
    purpose: "On-site installation and testing at partner facility.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "resv_video_filming",
    title: "Marketing Video Filming",
    userId: initialUsers[2].id,
    user: initialUsers[2],
    resourceId: initialResources[2].id,
    startTime: cancelledStart,
    endTime: cancelledEnd,
    status: ReservationStatus.CANCELLED,
    purpose: "Rescheduled due to guest speaker availability.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Global in-memory storage for resilient demo mode
class DemoStore {
  users = [...initialUsers];
  categories = [...initialCategories];
  resources = [...initialResources];
  reservations = [...initialReservations];

  getResources() {
    return this.resources.map((res) => ({
      ...res,
      reservations: this.reservations.filter((r) => r.resourceId === res.id),
    }));
  }

  getResourceById(id: string) {
    const res = this.resources.find((r) => r.id === id);
    if (!res) return null;
    return {
      ...res,
      reservations: this.reservations
        .filter((r) => r.resourceId === res.id)
        .map((r) => ({
          ...r,
          user: this.users.find((u) => u.id === r.userId) || r.user,
        })),
    };
  }

  getUsers() {
    return [...this.users];
  }

  getCategories() {
    return [...this.categories];
  }

  getReservations() {
    return this.reservations.map((r) => {
      const res = this.resources.find((res) => res.id === r.resourceId);
      const user = this.users.find((u) => u.id === r.userId) || r.user;
      return {
        ...r,
        resource: res
          ? {
              id: res.id,
              name: res.name,
              location: res.location,
              capacity: res.capacity,
              category: res.category,
            }
          : undefined,
        user,
      };
    });
  }

  createReservation(data: {
    title: string;
    userId: string;
    resourceId: string;
    startTime: Date;
    endTime: Date;
    purpose?: string | null;
  }) {
    const user = this.users.find((u) => u.id === data.userId) || this.users[0];
    const resource = this.resources.find((r) => r.id === data.resourceId);

    const newRes: DemoReservation = {
      id: `resv_${Date.now()}`,
      title: data.title,
      userId: data.userId,
      user,
      resourceId: data.resourceId,
      resource: resource
        ? {
            id: resource.id,
            name: resource.name,
            location: resource.location,
            capacity: resource.capacity,
            category: resource.category,
          }
        : undefined,
      startTime: data.startTime,
      endTime: data.endTime,
      status: ReservationStatus.CONFIRMED,
      purpose: data.purpose || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.reservations.push(newRes);
    return newRes;
  }

  cancelReservation(id: string) {
    const res = this.reservations.find((r) => r.id === id);
    if (res) {
      res.status = ReservationStatus.CANCELLED;
      res.updatedAt = new Date();
    }
    return res;
  }

  createResource(data: {
    name: string;
    categoryId: string;
    capacity: number;
    location: string;
    status: "AVAILABLE" | "MAINTENANCE";
    description?: string | null;
  }) {
    const category =
      this.categories.find((c) => c.id === data.categoryId) || this.categories[0];

    const newResource: DemoResource = {
      id: `res_${Date.now()}`,
      name: data.name,
      categoryId: data.categoryId,
      category,
      capacity: data.capacity,
      location: data.location,
      status: data.status,
      description: data.description || "",
      createdAt: new Date(),
      reservations: [],
    };

    this.resources.push(newResource);
    return newResource;
  }

  updateResource(
    id: string,
    data: {
      name?: string;
      categoryId?: string;
      capacity?: number;
      location?: string;
      status?: "AVAILABLE" | "MAINTENANCE";
      description?: string | null;
    }
  ) {
    const res = this.resources.find((r) => r.id === id);
    if (!res) return null;

    if (data.name) res.name = data.name;
    if (data.capacity) res.capacity = data.capacity;
    if (data.location) res.location = data.location;
    if (data.status) res.status = data.status;
    if (data.description !== undefined) res.description = data.description || "";
    if (data.categoryId) {
      res.categoryId = data.categoryId;
      res.category =
        this.categories.find((c) => c.id === data.categoryId) || res.category;
    }

    return res;
  }

  toggleResourceStatus(id: string, status: "AVAILABLE" | "MAINTENANCE") {
    const res = this.resources.find((r) => r.id === id);
    if (res) {
      res.status = status;
    }
    return res;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var demoStore: DemoStore | undefined;
}

export const demoStore = global.demoStore || new DemoStore();

if (process.env.NODE_ENV !== "production") {
  global.demoStore = demoStore;
}
