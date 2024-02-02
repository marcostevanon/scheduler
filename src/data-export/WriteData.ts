import type { AssignedOperation } from "../entities/Operation";

export namespace DataExport {
  export function writeData(schedule: AssignedOperation[]) {
    if (typeof SpreadsheetApp === "undefined") return;

    const sheet = SpreadsheetApp.getActive().getSheetByName("Programmazione");
    if (!sheet) {
      console.error("'Programmazione' sheet not found");
      return;
    }

    const headers = [
      "OP",
      "FASE",
      "Macchina",
      "Tempo",
      "Data Consegna",
      "Disponibile da",
      "Inizio",
      "Fine",
    ];
    const data = schedule.map((p) => [
      p.code,
      p.phase,
      p.machine,
      p.timeLeft,
      p.deliveryDate.format("YYYY-MM-DD"),
      p.availableFrom.format("YYYY-MM-DD"),
      p.assignedSlot.start.format("YYYY-MM-DD HH:mm"),
      p.assignedSlot.end.format("YYYY-MM-DD HH:mm"),
    ]);
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  }
}
