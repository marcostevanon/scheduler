import type { Dayjs } from "dayjs";
import { Operation } from "../entities/Operation";
import { Spreadsheet, SpreadsheetImport } from "./SpreadsheetImport";

const operationsMap: Record<string, keyof Operation> = {
  OP: "operation",
  FASE: "phase",
  "Data Consegna": "deliveryDate",
  Macchina: "machine",
  Tempo: "remainingTime",
  "Disponibile da": "availableFrom",
};

export namespace OperationImport {
  declare const dayjs: Dayjs;
  let _dayjs: any;
  if (typeof dayjs === "undefined") _dayjs = require("dayjs");
  else {
    // @ts-ignore
    dayjs.extend(dayjs_plugin_isSameOrBefore);
    // @ts-ignore
    dayjs.extend(dayjs_plugin_isSameOrAfter);
    _dayjs = dayjs;
  }

  type OperationTable = (string | number)[][];

  export function getOperations(): Operation[] {
    const operationsTable: OperationTable = SpreadsheetImport.getTable(
      Spreadsheet.Operations
    );
    const operationsRenamed = headersMapping(operationsTable, operationsMap);
    const operations = convertTableToObjects(operationsRenamed);
    return operations;
  }

  function headersMapping(
    operationsTable: OperationTable,
    operationsMap: Record<string, string>
  ) {
    const [headers, ...dataRows] = operationsTable;
    const renamedHeaders = headers.map(
      (header) => operationsMap[header] || header
    );
    const renamedArray = [renamedHeaders, ...dataRows];
    return renamedArray;
  }

  function convertTableToObjects(tableArray: OperationTable): Operation[] {
    const headers = tableArray[0] as (keyof Operation)[];
    return tableArray.slice(1).map((row) => {
      const operationData: Partial<Operation> = Object.fromEntries(
        headers.map((header, index) => {
          if (header === "deliveryDate" || header === "availableFrom") {
            return [header, _dayjs(row[index])];
          } else {
            return [header, row[index]];
          }
        })
      );

      return new Operation(operationData as Operation);
    });
  }
}
