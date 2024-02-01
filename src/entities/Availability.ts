import type { Dayjs } from "dayjs";

export class Availability {
  date: Dayjs;
  machine: string;
  slots: AvailabilitySlot[];

  constructor({
    date,
    machine,
    slots,
  }: {
    date: Dayjs;
    machine: string;
    slots: AvailabilitySlot[];
  }) {
    this.date = date;
    this.machine = machine;
    this.slots = slots;
  }

  toJSON() {
    return {
      date: this.date.format("YYYY-MM-DD"),
      machine: this.machine,
      slots: this.slots.map((s) => s.toJSON()),
    };
  }
}

export class AvailabilitySlot {
  start: Dayjs;
  end: Dayjs;

  constructor({ start, end }: { start: Dayjs; end: Dayjs }) {
    this.start = start;
    this.end = end;
  }

  toJSON() {
    const { start, end } = this;
    return { start, end };
  }
}
