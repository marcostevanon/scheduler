import type { Dayjs } from "dayjs";
import type { Availability } from "../entities/Availability";
import type { AssignedOperation, Operation } from "../entities/Operation";
import { loadLocalDayJs } from "../utils/DayjsHelper";
import { CalculateIndex } from "./CalculateIndex";

export namespace GenerateSchedule {
  declare const dayjs: Dayjs;
  let _dayjs: any;
  if (typeof dayjs === "undefined") _dayjs = loadLocalDayJs();
  else {
    // @ts-ignore
    dayjs.extend(dayjs_plugin_isSameOrBefore);
    // @ts-ignore
    dayjs.extend(dayjs_plugin_isSameOrAfter);
    _dayjs = dayjs;
  }

  export function generateSchedule(
    operations: Operation[],
    availabilities: Availability[]
  ): AssignedOperation[] {
    // calculate indexes
    const operationsWithIndex =
      CalculateIndex.getOperationsWithIndexes(operations);

    return operationsWithIndex.map((o) => ({
      ...o,
      machine: "machine",
      assignedSlot: {
        startDate: _dayjs().add(1, "day"),
        endDate: _dayjs().add(2, "day"),
      },
    }));
  }

  function assignMachineSlots(
    operations: Operation[],
    availabilies: Availability[]
  ): AssignedOperation[] {
    const assignedOperations: AssignedOperation[] = [];

    // filter out availabilities that are before today (included)
    availabilies = availabilies.filter((a) =>
      _dayjs(a.date).isSameOrAfter(_dayjs().add(1, "day"), "day")
    );

    // I want to assign operations to the first available time range for the machine
    // If the operation is longer than the time range, I want to assign it to the next available time range
    // If the operation is 1hour longer (remainingTime) i want to get the frist available time range that is at least 1 hour long
    // and assign the operation to that time range creating an availability operation object
    // phases are important becouse an operation with phase 20 cannot be scheduled before an operation with phase 10
    // when I assigned an operation to a time range, I want to remove it from the operations array
    let remainingOperations = [...operations];

    for (let j = 0; j < availabilies.length; j++) {
      const availability = availabilies[j];

      let availabiliesAssigned = false;

      while (remainingOperations.length > 0) {
        if (availabiliesAssigned) break;

        const operation = remainingOperations[0];

        if (operation.machine !== availability.machine) break;

        let timeSlotAssignes: boolean = false;
        availability.slots.forEach((timeSlot, timeSlotIndex) => {
          if (timeSlotAssignes) return;

          const sameOpEntries = assignedOperations
            .filter((o) => o.operation === operation.operation)
            .sort((a, b) => b.phase - a.phase);

          const isSaveAvailabilityConfiguration = sameOpEntries.length > 0;
          // && sameOpEntries[0].assignedSlot.startDate.isSame(
          //   availability.date,
          //   "day"
          // );

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
            remainingOperations.splice(0, 1);

            const updatedStartTime = _dayjs(
              assignedOperation.assignedSlot.endDate
            );
            availability.slots[timeSlotIndex].start =
              updatedStartTime.format("HH:mm");

            timeSlotAssignes = true;
            return;
          } else {
            availabiliesAssigned = true;
          }
        });
      }
    }

    return assignedOperations;
  }
}
