export const Role = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const ResourceStatus = {
  AVAILABLE: "AVAILABLE",
  MAINTENANCE: "MAINTENANCE",
} as const;
export type ResourceStatus = (typeof ResourceStatus)[keyof typeof ResourceStatus];

export const ReservationStatus = {
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
} as const;
export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];
