import type { Dayjs } from "dayjs";
import type { AvailabilitySlot } from "./Availability";

export class Operation {
  code: number;
  phase: number;
  machine: string;
  timeLeft: number;
  deliveryDate: Dayjs;
  availableFrom: Dayjs;
  index?: number;

  constructor(operationData: {
    code: number;
    phase: number;
    machine: string;
    timeLeft: number;
    deliveryDate: Dayjs;
    availableFrom: Dayjs;
    index?: number;
  }) {
    const {
      code,
      phase,
      machine,
      timeLeft,
      deliveryDate,
      availableFrom,
      index,
    } = operationData;
    this.code = code;
    this.phase = phase;
    this.machine = machine;
    this.timeLeft = timeLeft;
    this.deliveryDate = deliveryDate;
    this.availableFrom = availableFrom;
    if (index) this.index = index;
  }

  setIndex(index: number) {
    this.index = index;
  }

  toJSON() {
    const {
      code,
      phase,
      machine,
      timeLeft: timeLeft,
      deliveryDate,
      availableFrom,
      index,
    } = this;
    return {
      code,
      phase,
      machine,
      timeLeft,
      index,
      deliveryDate: deliveryDate.format("YYYY-MM-DD"),
      availableFrom: availableFrom.format("YYYY-MM-DD"),
    };
  }
}

export class AssignedOperation extends Operation {
  assignedSlot: AvailabilitySlot;

  constructor(operationData: {
    code: number;
    phase: number;
    machine: string;
    timeLeft: number;
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
      code,
      phase,
      machine,
      timeLeft: timeLeft,
      deliveryDate,
      availableFrom,
      index,
      assignedSlot,
    } = this;
    return {
      code,
      phase,
      machine,
      timeLeft,
      index,
      deliveryDate: deliveryDate.format("YYYY-MM-DD"),
      availableFrom: availableFrom.format("YYYY-MM-DD"),
      start: assignedSlot.start.format("YYYY-MM-DD HH:mm"),
      end: assignedSlot.end.format("YYYY-MM-DD HH:mm"),
    };
  }
}
