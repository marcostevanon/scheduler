import { GenerateSchedule } from "./business-logic/GenerateSchedule";
import { DataExport } from "./data-export/WriteData";
import { AvailabilityImport } from "./data-import/AvailabilityImport";
import { OperationImport } from "./data-import/OperationImport";

export function plan() {
  // get data
  const operations = OperationImport.getOperations();
  const availabilies = AvailabilityImport.getAvailabilies();

  // generate schedule
  const schedule = GenerateSchedule.generateSchedule(
    operations,
    availabilies
  ).sort((a, b) => a.assignedSlot.start.diff(b.assignedSlot.start));
  console.log(
    "plan:",
    schedule.map((p) => p.toJSON())
  );

  // write data on spreadsheet
  DataExport.writeData(schedule);
}

// Notes
// - add night operation feature
