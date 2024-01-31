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
  // @ts-ignore
  dayjs.extend(dayjs_plugin_isSameOrBefore);
  return dayjs;
}

function loadLocalDayJs() {
  const _dayjs = require("dayjs");
  const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
  _dayjs.extend(isSameOrBefore);
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
    const [start, end] = slot ? slot.trim().split("-") : ["", ""];
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

      const availability: Availability = { date, machine, timeSlots };

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

function assignMachineSlots(
  operations: Operation[],
  availabilies: Availability[]
): AssignedOperation[] {
  const assignedOperations: AssignedOperation[] = [];

  // I want to assign operations to the first available time range for the machine
  // If the operation is longer than the time range, I want to assign it to the next available time range
  // If the operation is 1hour longer (remainingTime) i want to get the frist available time range that is at least 1 hour long
  // and assign the operation to that time range creating an availability operation object
  // phases are important becouse an operation with phase 20 cannot be scheduled before an operation with phase 10
  // when I assigned an operation to a time range, I want to remove it from the operations array
  let remainingOperations = [...operations];

  for (let j = 0; j < availabilies.length; j++) {
    const availability = availabilies[j];

    for (let i = 0; i < remainingOperations.length; i++) {
      const operation = remainingOperations[i];

      if (operation.machine !== availability.machine) continue;

      let timeSlotAssignes: boolean = false;
      availability.timeSlots.forEach((timeSlot, timeSlotIndex) => {
        if (timeSlotAssignes) return;

        const sameOpEntries = assignedOperations
          .filter((o) => o.operation === operation.operation)
          .sort((a, b) => b.phase - a.phase);

        const isSaveAvailabilityConfiguration =
          sameOpEntries.length > 0 &&
          sameOpEntries[0].assignedSlot.startDate.isSame(
            availability.date,
            "day"
          );

        const { start, end } = timeSlot;
        const slotStart = _dayjs(`${availability.date} ${start}`);
        const slotEnd = _dayjs(`${availability.date} ${end}`);
        const operationStart = isSaveAvailabilityConfiguration
          ? _dayjs(sameOpEntries[0].assignedSlot.endDate)
          : slotStart;
        const operationEnd = isSaveAvailabilityConfiguration
          ? _dayjs(sameOpEntries[0].assignedSlot.endDate).add(
              operation.remainingTime,
              "hour"
            )
          : slotStart.add(operation.remainingTime, "hour");

        if (operationEnd.isSameOrBefore(slotEnd)) {
          const assignedOperation: AssignedOperation = {
            ...operation,
            machine: availability.machine,
            assignedSlot: {
              startDate: operationStart,
              endDate: operationEnd,
            },
          };
          assignedOperations.push(assignedOperation);
          remainingOperations.splice(i, 1);

          const updatedStartTime = _dayjs(
            assignedOperation.assignedSlot.endDate
          );
          availability.timeSlots[timeSlotIndex].start =
            updatedStartTime.format("HH:mm");

          timeSlotAssignes = true;
          return;
        }
      });
    }
  }

  return assignedOperations;
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
  console.log(
    "plan ~ programmazione:",
    programmazione.map((p) => ({
      ...p,
      availableFrom: p.availableFrom.format("YYYY-MM-DD"),
      deliveryDate: p.deliveryDate.format("YYYY-MM-DD"),
      start: p.assignedSlot.startDate.format("YYYY-MM-DD HH:mm"),
      end: p.assignedSlot.endDate.format("YYYY-MM-DD HH:mm"),
      assignedSlot: undefined,
    }))
  );

  const spreadsheet = SpreadsheetApp.getActive();
  const sheet = spreadsheet.getSheetByName("Programmazione");
  if (!sheet) {
    console.log("Sheet not found");
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
  const data = programmazione.map((p) => [
    p.operation,
    p.phase,
    p.machine,
    p.remainingTime,
    p.deliveryDate.format("YYYY-MM-DD HH:mm"),
    p.availableFrom.format("YYYY-MM-DD HH:mm"),
    p.assignedSlot.startDate.format("YYYY-MM-DD HH:mm"),
    p.assignedSlot.endDate.format("YYYY-MM-DD HH:mm"),
  ]);
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
}

// NOTE
// - aggiungere programmazione notturna
