import type { Dayjs } from "dayjs";
import { availabilityRawLocal, operationsRawLocal } from "./Data";
import { Availability, AvailabilitySlot } from "./types/Availability";
import { AssignedOperation, Operation } from "./types/Operation";

declare const dayjs: Dayjs;

const _dayjs = getDayjs();

const operationsColumnMapping: Record<string, keyof Operation> = {
  OP: "operation",
  FASE: "phase",
  "Data Consegna": "deliveryDate",
  Macchina: "machine",
  Tempo: "remainingTime",
  "Disponibile da": "availableFrom",
};

type OperationRawTable = (string | number)[][];
type AvailabilityRawTable = string[][];

function getDayjs() {
  return typeof dayjs !== "undefined" ? loadDayJs() : loadLocalDayJs();
}

function loadDayJs() {
  return dayjs;
}

function loadLocalDayJs() {
  const _dayjs = require("dayjs");
  const isBetween = require("dayjs/plugin/isBetween");
  const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");
  _dayjs.extend(isBetween);
  _dayjs.extend(isSameOrAfter);
  return _dayjs;
}

function getTableData(): {
  operationsRaw: OperationRawTable;
  availabilityRaw: AvailabilityRawTable;
} {
  if (typeof SpreadsheetApp !== "undefined") {
    const spreadsheet = SpreadsheetApp.getActive();
    const operationsSheet = spreadsheet.getSheetByName("Operazioni");
    const availabilitySheet = spreadsheet.getSheetByName("Disponibilità");

    if (!operationsSheet || !availabilitySheet) {
      console.log("Sheet not found");
      return { operationsRaw: [], availabilityRaw: [] };
    }

    const operationsRaw = operationsSheet.getDataRange().getValues();
    const availabilityRaw = availabilitySheet.getDataRange().getValues();
    return { operationsRaw, availabilityRaw };
  } else {
    return {
      operationsRaw: operationsRawLocal,
      availabilityRaw: availabilityRawLocal,
    };
  }
}

function columnMapping(
  tableArray: OperationRawTable,
  columnMapping: Record<string, string>
) {
  const [headers, ...dataRows] = tableArray;
  const renamedHeaders = headers.map(
    (header) => columnMapping[header] || header
  );
  const renamedArray = [renamedHeaders, ...dataRows];
  return renamedArray;
}

function convertOperationTableToObjects(tableArray: OperationRawTable) {
  const headers = tableArray[0] as (keyof Operation)[];
  return tableArray.slice(1).map((row) => {
    const obj: Operation = {
      operation: 0,
      phase: 0,
      machine: "",
      remainingTime: 0,
      deliveryDate: _dayjs(),
      availableFrom: _dayjs(),
      index: 0,
    };
    headers.forEach((header, index) => {
      if (header === "deliveryDate" || header === "availableFrom") {
        obj[header] = _dayjs(row[index]);
      } else {
        // @ts-ignore
        obj[header] = row[index];
      }
    });
    return obj;
  });
}

function prepareOperations(operationsRaw: OperationRawTable): Operation[] {
  const operationsRenamed = columnMapping(
    operationsRaw,
    operationsColumnMapping
  );
  const operations = convertOperationTableToObjects(operationsRenamed);
  return operations;
}

function parseAvailabilityTimeRange(timeRange: string): AvailabilitySlot[] {
  const timeSlots = timeRange.split(",").map((slot) => {
    const [start, end] = slot.trim().split("-");
    return { start: start.trim(), end: end.trim() };
  });

  return timeSlots;
}

function prepareAvailability(
  availabilityRaw: AvailabilityRawTable
): Availability[] {
  const headers = availabilityRaw[0].slice(1);
  const availabilities: Availability[] = [];

  for (let i = 1; i < availabilityRaw.length; i++) {
    const date = _dayjs(availabilityRaw[i][0]).format("YYYY-MM-DD");

    headers.forEach((machine, index) => {
      const availabilityRow = availabilityRaw[i][index + 1];
      const timeSlots = parseAvailabilityTimeRange(availabilityRow);

      const availability: Availability = {
        date: date,
        machine: machine,
        timeSlots: timeSlots,
      };

      availabilities.push(availability);
    });
  }

  return availabilities;
}

function calculateRemainingHours(
  operation: Operation,
  operations: Operation[]
): number {
  const sameOpEntries = operations.filter(
    (o) => o.operation === operation.operation
  );
  const totalRemainingHours = sameOpEntries.reduce(
    (total, o) => total + o.remainingTime,
    0
  );

  return totalRemainingHours;
}

function calculateIndex(operation: Operation, operations: Operation[]): number {
  const deliveryDate = _dayjs(operation.deliveryDate);
  const availableFrom = _dayjs(operation.availableFrom);
  const remainingTimeInHours = calculateRemainingHours(operation, operations);
  const indexInHours =
    deliveryDate.diff(availableFrom, "hour") - remainingTimeInHours;
  return indexInHours;
}

export function plan() {
  // get data
  const { operationsRaw, availabilityRaw } = getTableData();

  // prepare data
  const operations = prepareOperations(operationsRaw);
  const availability = prepareAvailability(availabilityRaw);

  // calculate index
  const operationsWithIndex = operations.map((operation) => {
    const index = calculateIndex(operation, operations);
    return { ...operation, index };
  });

  // sort by index and phase
  const operationsSorted = operationsWithIndex.sort((a, b) => {
    if (a.index === b.index) {
      return a.phase - b.phase;
    }
    return a.index - b.index;
  });

  // assign machine slots and remove from operations array
  const programmazione = assignMachineSlots(operationsSorted, availability);
  console.log("plan ~ programmazione:", programmazione);

  // print in the new sheet
}

function assignMachineSlots(
  operations: Operation[],
  availabilies: Availability[]
): AssignedOperation[] {
  const assignedOperations: AssignedOperation[] = [];

  availabilies.forEach((availabily) => {
    availabily.date;
    availabily.machine;
    availabily.timeSlots;

    const operationsCopy = [...operations];
    // I want to assign operations to the first available time range for the machine
    // If the operation is longer than the time range, I want to assign it to the next available time range
    // If the operation is 1hour longer (remainingTime) i want to get the frist available time range that is at least 1 hour long
    // and assign the operation to that time range creating an availability operation object
    // phases are important becouse an operation with phase 20 cannot be scheduled before an operation with phase 10
    // when I assigned an operation to a time range, I want to remove it from the operations array
  });

  return assignedOperations;
}

// print in the new sheet

// NOTE
// - aggiungere programmazione notturna
