"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const Data_1 = require("./Data");
const operationsColumnMapping = {
    OP: "operation",
    FASE: "phase",
    "Data Consegna": "deliveryDate",
    Macchina: "machine",
    Tempo: "time",
    "Disponibile da": "availableFrom",
};
function columnMapping(tableArray, columnMapping) {
    const [headers, ...dataRows] = tableArray;
    const renamedHeaders = headers.map((header) => columnMapping[header] || header);
    const renamedArray = [renamedHeaders, ...dataRows];
    return renamedArray;
}
function convertOperationTableToObjects(tableArray) {
    const headers = tableArray[0];
    return tableArray.slice(1).map((row) => {
        const obj = {
            operation: 0,
            phase: 0,
            deliveryDate: "",
            machine: "",
            time: 0,
            availableFrom: "",
        };
        headers.forEach((header, index) => {
            if (header === "deliveryDate" || header === "availableFrom") {
                // @ts-ignore
                obj[header] = (0, dayjs_1.default)(row[index]);
            }
            else {
                // @ts-ignore
                obj[header] = row[index];
            }
        });
        return obj;
    });
}
function prepareOperations(operationsRaw) {
    const operationsRenamed = columnMapping(operationsRaw, operationsColumnMapping);
    const operations = convertOperationTableToObjects(operationsRenamed);
    return operations;
}
function plan() {
    // const operazioniRaw = SpreadsheetApp.getActive().getSheetByName('Operazioni').getDataRange().getValues()
    // const disponibiltaRaw = SpreadsheetApp.getActive().getSheetByName('Disponibilità').getDataRange().getValues()
    const operations = prepareOperations(Data_1.operationsRaw);
    console.log("plan ~ operations:", operations);
    // const disponibilta = createAvailabilityArray(disponibiltaRaw);
    // console.log("operazioni", operazioni);
    // console.log("disponibilta", JSON.stringify(disponibilta, null, 2));
    // const programmazione = assignMachineSlots(operazioni, disponibilta);
    // console.log(programmazione);
    // const dateA = dayjs();
    // console.log(dateA);
    // console.log(
    //   "index",
    //   operazioni.map((item) =>
    //     calculateIndex(
    //       item["Data Consegna"],
    //       item["Disponibile da"],
    //       item["Tempo"]
    //     )
    //   )
    // );
    // calcola Indice
    // transposizione dati in oggetti per entrambi i fogli
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
}
plan();
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
// function parseAvailabilityTimeRange(timeRange) {
//   const [start, end] = timeRange.split("-");
//   return { availabilityStart: start.trim(), availabilityEnd: end.trim() };
// }
// function createAvailabilityArray(table) {
//   const headers = table[0].slice(1);
//   const availabilityArray = [];
//   for (let i = 1; i < table.length; i++) {
//     const date = table[i][0];
//     const dateObject = {};
//     headers.forEach((machine, index) => {
//       const availability = table[i][index + 1]; // Adjust the index to skip the 'EMPTY' column
//       const { availabilityStart, availabilityEnd } =
//         parseAvailabilityTimeRange(availability);
//       dateObject[date] = {
//         machine,
//         availabilitySlot: { date, availabilityStart, availabilityEnd },
//       };
//     });
//     availabilityArray.push(dateObject);
//   }
//   return availabilityArray;
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
