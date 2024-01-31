import type { Dayjs } from "dayjs";

export interface Availability {
  date: string;
  machine: string;
  timeSlots: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  start: string;
  end: string;
}
