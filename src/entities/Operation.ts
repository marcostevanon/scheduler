import type { Dayjs } from "dayjs";
import type { AvailabilitySlot } from "./Availability";

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
      index,
      deliveryDate: deliveryDate.format("YYYY-MM-DD"),
      availableFrom: availableFrom.format("YYYY-MM-DD"),
    };
  }
}

export class AssignedOperation extends Operation {
  assignedSlot: AvailabilitySlot;

  constructor(operationData: {
    operation: number;
    phase: number;
    machine: string;
    remainingTime: number;
    deliveryDate: Dayjs;
    availableFrom: Dayjs;
    index?: number;
    assignedSlot: AvailabilitySlot;
  }) {
    super(operationData);
    this.assignedSlot = operationData.assignedSlot;
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
      assignedSlot,
    } = this;
    return {
      operation,
      phase,
      machine,
      remainingTime,
      index,
      deliveryDate: deliveryDate.format("YYYY-MM-DD"),
      availableFrom: availableFrom.format("YYYY-MM-DD"),
      start: assignedSlot.start.format("YYYY-MM-DD HH:mm"),
      end: assignedSlot.end.format("YYYY-MM-DD HH:mm"),
    };
  }
}
