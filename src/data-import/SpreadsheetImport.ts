import { availabilityRawLocal, operationsRawLocal } from "../Data";

export enum Spreadsheet {
  Operations = "Operazioni",
  Availability = "Disponibilità",
}

export namespace SpreadsheetImport {
  export function getTable(tableName: Spreadsheet) {
    if (typeof SpreadsheetApp !== "undefined") {
      const spreadsheet = SpreadsheetApp.getActive();
      const sheet = spreadsheet.getSheetByName(tableName);

      if (!sheet) {
        throw new Error("Spreadsheet not found");
      }

      return sheet.getDataRange().getValues();
    } else {
      switch (tableName) {
        case Spreadsheet.Availability:
          return availabilityRawLocal;
        case Spreadsheet.Operations:
        default:
          return operationsRawLocal;
      }
    }
  }
}
