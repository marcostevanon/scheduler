import type { Dayjs } from "dayjs";

export class Operation {
  operation: number;
  phase: number;
  machine: string;
  remainingTime: number;
  deliveryDate: Dayjs;
  availableFrom: Dayjs;
  index?: number;

  constructor(operationData: {
    operation: number;
    phase: number;
    machine: string;
    remainingTime: number;
    deliveryDate: Dayjs;
    availableFrom: Dayjs;
    index?: number;
  }) {
    const {
      operation,
      phase,
      machine,
      remainingTime,
      deliveryDate,
      availableFrom,
      index,
    } = operationData;
    this.operation = operation;
    this.phase = phase;
    this.machine = machine;
    this.remainingTime = remainingTime;
    this.deliveryDate = deliveryDate;
    this.availableFrom = availableFrom;
    if (index) this.index = index;
  }

  setIndex(index: number) {
    this.index = index;
  }

  toJSON() {
    const {
      operation,
      phase,
      machine,
      remainingTime,
      deliveryDate,
      availableFrom,
      index,
    } = this;
    return {
      operation,
      phase,
      machine,
      remainingTime,
      deliveryDate: deliveryDate.format("YYYY-MM-DD"),
      availableFrom: availableFrom.format("YYYY-MM-DD"),
      index,
    };
  }
}

export interface AssignedOperation
  extends Omit<Operation, "toJSON" | "setIndex"> {
  assignedSlot: AvailabilitySlotWithDates;
}

interface AvailabilitySlotWithDates {
  startDate: Dayjs;
  endDate: Dayjs;
}
