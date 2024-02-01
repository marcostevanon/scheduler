import { GenerateSchedule } from "./business-logic/GenerateSchedule";
import { AvailabilityImport } from "./data-import/AvailabilityImport";
import { OperationImport } from "./data-import/OperationImport";

export function plan() {
  // get data
  const operations = OperationImport.getOperations();
  console.log("plan ~ operations:", operations);
  const availabilies = AvailabilityImport.getAvailabilies();
  console.log("plan ~ availabilies:", availabilies);

  // generate schedule
  const schedule = GenerateSchedule.generateSchedule(operations, availabilies);
  console.log(
    "plan ~ programmazione:",
    schedule.map((p) => ({
      ...p,
      availableFrom: p.availableFrom.format("YYYY-MM-DD"),
      deliveryDate: p.deliveryDate.format("YYYY-MM-DD"),
      start: p.assignedSlot.startDate.format("YYYY-MM-DD HH:mm"),
      end: p.assignedSlot.endDate.format("YYYY-MM-DD HH:mm"),
    }))
  );

  // write data on spreadsheet
  // writeData(schedule);
}

// NOTE
// - aggiungere programmazione notturna
