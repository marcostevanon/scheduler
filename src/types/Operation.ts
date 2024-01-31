import type { Dayjs } from "dayjs";
import { AvailabilitySlot } from "./Availability";

export interface Operation {
  operation: number;
  phase: number;
  machine: string;
  remainingTime: number;
  deliveryDate: Dayjs;
  availableFrom: Dayjs;
  index: number;
}

export interface AssignedOperation extends Operation {
  assignedSlot: AvailabilitySlot;
}
