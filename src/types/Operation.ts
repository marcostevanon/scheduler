import type { Dayjs } from "dayjs";

export interface Operation {
  operation: number;
  phase: number;
  deliveryDate: Dayjs;
  machine: string;
  remainingTime: number;
  availableFrom: Dayjs;
  index: number;
}
