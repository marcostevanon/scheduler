import type { Dayjs } from "dayjs";
import { Availability, AvailabilitySlot } from "../entities/Availability";
import { AssignedOperation, Operation } from "../entities/Operation";
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
    // filter out availabilities that are before today (included)
    availabilities = availabilities.filter((a) =>
      _dayjs(a.date).isSameOrAfter(_dayjs().add(1, "day"), "day")
    );

    // Optimization, delete availabilities of machines that doesn't exist among operations and with empty slots
    const machines = operations.map((o) => o.machine);
    availabilities = availabilities
      .filter((a) => machines.includes(a.machine))
      .filter((a) => a.slots.length > 0);

    const assignedOperations = generateAssignements(operations, availabilities);

    return assignedOperations;
  }

  function getOperationWithLowerIndexes(operations: Operation[]): Operation[] {
    return operations.reduce((result, operation, index) => {
      // first is always lower because of the sort
      if (index === 0) {
        result.push(operation);
        return result;
      }

      if (operation.index === result[0].index) {
        result.push(operation);
      }

      return result;
    }, []);
  }

  function generateAssignements(
    operations: Operation[],
    availabilities: Availability[]
  ): AssignedOperation[] {
    const assignedOperations: AssignedOperation[] = [];

    let remainingOperations = [...operations];

    while (remainingOperations.length > 0) {
      remainingOperations =
        CalculateIndex.getOperationsWithIndexes(remainingOperations);

      // get all operation with lower index
      const operationsToSchedule =
        getOperationWithLowerIndexes(remainingOperations);

      for (let j = 0; j < availabilities.length; j++) {
        const availability = availabilities[j];

        let cannotAssignOperation = false;
        while (operationsToSchedule.length > 0) {
          if (cannotAssignOperation) break;

          const operation = operationsToSchedule[0];

          // exite while loop if operation.machine don't match availaility.machine
          if (operation.machine !== availability.machine) break;

          availability.slots.forEach((timeSlot) => {
            // get assigned operation and check if this operation is already assigned
            const alreadyAssignedOperation = assignedOperations.find(
              (o) => o.operation === operation.operation
            );

            const assignedSlot =
              alreadyAssignedOperation &&
              alreadyAssignedOperation.assignedSlot.end.isSame(
                timeSlot.start,
                "day"
              )
                ? new AvailabilitySlot({
                    start: alreadyAssignedOperation.assignedSlot.end,
                    end: _dayjs(alreadyAssignedOperation.assignedSlot.end).add(
                      operation.remainingTime,
                      "hour"
                    ),
                  })
                : new AvailabilitySlot({
                    start: timeSlot.start,
                    end: _dayjs(timeSlot.start).add(
                      operation.remainingTime,
                      "hour"
                    ),
                  });

            if (
              assignedSlot.end.isSame(timeSlot.end) ||
              assignedSlot.end.isBefore(timeSlot.end)
            ) {
              // means that assignedSlot is inside availability slot
              const assignedOperation = new AssignedOperation({
                ...operation.toPlainObject(),
                assignedSlot,
              });

              // replace start time of current time slot with end time of assigned operation
              timeSlot.start = _dayjs(assignedOperation.assignedSlot.end);
              // not sure if it works

              assignedOperations.push(assignedOperation);
              const operationIndex = remainingOperations.findIndex(
                (o) =>
                  o.operation === operation.operation &&
                  o.phase === operation.phase
              );
              remainingOperations.splice(operationIndex, 1);
              operationsToSchedule.shift();
              return;
            } else {
              console.log("cannot assign availabilitity for operation");
              cannotAssignOperation = true;
            }
          });
        }
      }
    }
    return assignedOperations;
  }
}
