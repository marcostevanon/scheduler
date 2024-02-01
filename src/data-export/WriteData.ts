// import type { AssignedOperation } from "../entities/Operation";

// export function writeData(schedule: AssignedOperation[]) {
//   const spreadsheet = SpreadsheetApp.getActive();
//   const sheet = spreadsheet.getSheetByName("Programmazione");
//   if (!sheet) {
//     console.log("Sheet not found");
//     return;
//   }

//   const headers = [
//     "OP",
//     "FASE",
//     "Macchina",
//     "Tempo",
//     "Data Consegna",
//     "Disponibile da",
//     "Inizio",
//     "Fine",
//   ];
//   const data = schedule.map((p) => [
//     p.operation,
//     p.phase,
//     p.machine,
//     p.remainingTime,
//     p.deliveryDate.format("YYYY-MM-DD"),
//     p.availableFrom.format("YYYY-MM-DD"),
//     p.assignedSlot.startDate.format("YYYY-MM-DD HH:mm"),
//     p.assignedSlot.endDate.format("YYYY-MM-DD HH:mm"),
//   ]);
//   sheet.clear();
//   sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
//   sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
// }
