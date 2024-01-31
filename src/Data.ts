export const operationsRawLocal = [
  ["OP", "FASE", "Data Consegna", "Macchina", "Tempo", "Disponibile da"],
  [1, 10, new Date("2024-02-10").toISOString(), "mu170", 1, new Date().toISOString()],
  [1, 20, new Date("2024-02-10").toISOString(), "mu180", 2, new Date().toISOString()],
  // [3, 30, new Date("2024-02-11").toISOString(), "mu180", 1, new Date().toISOString()],
  // [3, 40, new Date("2024-02-11").toISOString(), "mu170", 2, new Date().toISOString()],
];

export const availabilityRawLocal = [
  ["", "mu170", "mu180"],
  [new Date("2024-02-02").toISOString(), "06:00-21:00", "06:00-06:30"],
  [new Date("2024-02-03").toISOString(), "06:00-21:00", "06:00-21:00"],
  // [new Date("2024-02-04").toISOString(), "06:00-21:00,21:00-22:00", "06:00-21:00,21:00-22:00"],
  // [new Date("2024-02-05").toISOString(), "06:00-21:00,21:00-22:00", "06:00-21:00,21:00-22:00"],
  // [new Date("2024-02-06").toISOString(), "06:00-21:00,21:00-22:00", "06:00-21:00,21:00-22:00"],
  // [new Date("2024-02-07").toISOString(), "06:00-21:00,21:00-22:00", "06:00-21:00,21:00-22:00"],
];
