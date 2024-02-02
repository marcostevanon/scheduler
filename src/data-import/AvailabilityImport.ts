import type { Dayjs } from "dayjs";
import { Availability, AvailabilitySlot } from "../entities/Availability";
import { Spreadsheet, SpreadsheetImport } from "./SpreadsheetImport";

export namespace AvailabilityImport {
  declare const dayjs: Dayjs;
  const _dayjs = typeof dayjs === "undefined" ? require("dayjs") : dayjs;

  type AvailabilityTable = string[][];

  export function getAvailabilies(): Availability[] {
    const availabiliesTable: AvailabilityTable = SpreadsheetImport.getTable(
      Spreadsheet.Availability
    );
    const availabilies = convertTableToObjects(availabiliesTable);
    return availabilies;
  }

  function parseAvailabilityTimeRange(
    date: Dayjs,
    timeRanges: string,
    machine: string
  ): AvailabilitySlot[] {
    const timeSlots = timeRanges
      .split(",")
      .reduce((slots: AvailabilitySlot[], slot: string) => {
        if (!slot || !slot.includes("-")) {
          const errorDate = date.format("YYYY-MM-DD");
          console.warn(
            `Invalid time range "${slot}" for date ${errorDate}, machine "${machine}", skipping`
          );
          return slots;
        }
        const [start, end] = slot.trim().split("-");
        const availabilitySlot = new AvailabilitySlot({
          start: _dayjs(`${date.format("YYYY-MM-DD")} ${start.trim()}`),
          end: _dayjs(`${date.format("YYYY-MM-DD")} ${end.trim()}`),
        });
        slots.push(availabilitySlot);
        return slots;
      }, []);

    return timeSlots;
  }

  function convertTableToObjects(
    availabilityTable: AvailabilityTable
  ): Availability[] {
    const headers = availabilityTable[0].slice(1);
    const availabilities: Availability[] = [];

    for (let i = 1; i < availabilityTable.length; i++) {
      const rowDate = _dayjs(availabilityTable[i][0]) as Dayjs;

      headers.forEach((machine, index) => {
        const timeRanges = availabilityTable[i][index + 1];
        const slots = parseAvailabilityTimeRange(rowDate, timeRanges, machine);
        const availability = new Availability({
          date: rowDate,
          machine,
          slots,
        });
        availabilities.push(availability);
      });
    }

    return availabilities;
  }
}
