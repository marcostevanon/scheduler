import type { Dayjs } from "dayjs";
import {
  availabilityRaw as availabilityRawLocal,
  operationsRaw as operationsRawLocal,
} from "./Data";
import { Operation } from "./types/Operation";

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
  return typeof dayjs !== "undefined" ? dayjs : require("dayjs");
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
      deliveryDate: _dayjs(),
      machine: "",
      remainingTime: 0,
      availableFrom: _dayjs(),
      index: 0,
    };
    headers.forEach((header, index) => {
      if (header === "deliveryDate" || header === "availableFrom") {
        // @ts-ignore
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

function parseAvailabilityTimeRange(timeRange: string) {
  const timeSlots = timeRange.split(",").map((slot) => {
    const [start, end] = slot.trim().split("-");
    return { availabilityStart: start.trim(), availabilityEnd: end.trim() };
  });

  return timeSlots;
}

function createAvailabilityArray(table: AvailabilityRawTable) {
  const headers = table[0].slice(1);
  const availabilityArray: {
    [key: string]: {
      machine: string;
      timeSlots: { availabilityStart: string; availabilityEnd: string }[];
    };
  }[] = [];

  for (let i = 1; i < table.length; i++) {
    const date = table[i][0];
    const dateObject = {
      [date]: {
        machine: "",
        timeSlots: [],
      },
    };

    headers.forEach((machine, index) => {
      const availability = table[i][index + 1];
      const timeSlots = parseAvailabilityTimeRange(availability);
      dateObject[date] = {
        machine,
        timeSlots: timeSlots as any,
      };
    });

    availabilityArray.push(dateObject);
  }

  return availabilityArray;
}

function prepareAvailability(availabilityRaw: AvailabilityRawTable) {
  return createAvailabilityArray(availabilityRaw);
}

function calculateIndex(operation: Operation, operations: Operation[]): number {
  const deliveryDate = _dayjs(operation.deliveryDate);
  const availableFrom = _dayjs(operation.availableFrom);
  const remainingTimeInHours = calculateRemainingHours(operation, operations);
  const indexInHours =
    deliveryDate.diff(availableFrom, "hour") - remainingTimeInHours;
  return indexInHours;
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

export function plan() {
  const { operationsRaw, availabilityRaw } = getTableData();

  const operations = prepareOperations(operationsRaw);
  const availability = prepareAvailability(availabilityRaw);

  availability.forEach((availabilitySlot) => {
    const date = Object.keys(availabilitySlot)[0];
    const { machine, timeSlots } = availabilitySlot[date];
    console.log(_dayjs(date).format("YYYY-MM-DD"), machine, timeSlots);
  });

  const operationsWithIndex = operations.map((operation) => {
    const index = calculateIndex(operation, operations);
    return { ...operation, index };
  });

  console.log(
    operationsWithIndex.map((op) => ({
      ...op,
      deliveryDate: op.deliveryDate.format("YYYY-MM-DD HH:mm"),
      availableFrom: op.availableFrom.format("YYYY-MM-DD HH:mm"),
    }))
  );
}

// calculate index

// const programmazione = assignMachineSlots(operazioni, disponibilta);
// console.log(programmazione);

// let programmazione = []

// for (let i = 1; i < disponibilta.length; i++) {
//   const elementoDisp = disponibilta[i]
//   console.log(elementoDisp)

//   for (let j = 1; j < operazioni.length; j++) {
//     const elementoOp = operazioni[j]
//     console.log(elementoOp)

//     // ordina per indice

//     const macchinaOp = 2 //elementoOp[3]
//     console.log(macchinaOp)

//     const disponibilitaMacchinaCorrent = elementoDisp[macchinaOp]

//     console.log(disponibilitaMacchinaCorrent)

//     // calcola programmazione (momentjs)

//     // aggiungi programmazione

//     // rimuovi elementoOp da array operazioni
//   }
// }

// programmazione.push({
//   operazione: '',
//   fase: '',
//   macchina: '',
//   dataInizio: new Date(),
//   dataFine: new Date(),
// })

// stamparlo nel foglio

// function assignMachineSlots(operations, availability) {
//   const machineSlots = {};

//   operations.forEach((operation) => {
//     const machine = operation.Machine;
//     const indexMST = operation["Index MST"];
//     const requiredTime = operation.Time;

//     if (
//       !machineSlots[machine] ||
//       indexMST < machineSlots[machine]["Index MST"]
//     ) {
//       machineSlots[machine] = {
//         indexMST,
//         availabilitySlot: null,
//         requiredTime,
//       };
//     }
//   });

//   availability.forEach((availabilitySlot) => {
//     const date = Object.keys(availabilitySlot)[0];
//     const { machine, availabilityStart, availabilityEnd } =
//       availabilitySlot[date];

//     if (machineSlots[machine]) {
//       const { indexMST, requiredTime } = machineSlots[machine];
//       const availabilityStartObj = new Date(date + " " + availabilityStart);
//       const availabilityEndObj = new Date(date + " " + availabilityEnd);

//       // Check if the availability slot is valid for the required time
//       if (
//         availabilityEndObj - availabilityStartObj >=
//         requiredTime * 60 * 60 * 1000
//       ) {
//         machineSlots[machine].availabilitySlot = {
//           date,
//           availabilityStart,
//           availabilityEnd,
//         };
//       }
//     }
//   });

//   const resultArray = Object.entries(machineSlots).map(([machine, slots]) => {
//     return { machine, ...slots };
//   });

//   return resultArray;
// }

// function calculateIndex(operations) {
//   const oreTrascorse =
//     (new Date(dataConsegna) - new Date(dataProgrammazione)) / (1000 * 60 * 60);
//   return oreTrascorse - oreResidue;
// }

// function calcolaIndice() {
//   // (data consegna - data della programmazione(o data disponibiltà)) *24
//   //   - ore residue totali (di tutte le fasi del OP considerato)
//   // NB nel caso una fase è già stata lavorata, non considero quel tempo per il calcolo del nuovo indice (dovrebbe essere implicita quando rimuovo le fasi già lavorate)
// }

// // NOTE
// // - aggiungere programmazione notturna
