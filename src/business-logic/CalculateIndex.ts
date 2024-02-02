import type { Dayjs } from "dayjs";
import type { Operation } from "../entities/Operation";

export namespace CalculateIndex {
  declare const dayjs: Dayjs;
  const _dayjs = typeof dayjs === "undefined" ? require("dayjs") : dayjs;

  export function getOperationsWithIndexes(
    operations: Operation[]
  ): Operation[] {
    return operations
      .map((operation) => {
        const index = calculateIndex(operation, operations);
        operation.setIndex(index);
        return operation;
      })
      .sort((a, b) => {
        if (a.index === b.index) {
          return a.phase - b.phase;
        }
        return a.index! - b.index!;
      });
  }

  function calculateIndex(
    operation: Operation,
    operations: Operation[]
  ): number {
    const deliveryDate = _dayjs(operation.deliveryDate);
    const availableFrom = _dayjs(operation.availableFrom);
    const remainingTimeInHours = calculateTotalRemainingHours(
      operation,
      operations
    );
    const indexInHours =
      deliveryDate.diff(availableFrom, "hour") - remainingTimeInHours;
    return indexInHours;
  }

  function calculateTotalRemainingHours(
    operation: Operation,
    operations: Operation[]
  ): number {
    const sameOpEntries = operations.filter((o) => o.code === operation.code);
    const totalRemainingHours = sameOpEntries.reduce(
      (total, o) => total + o.timeLeft,
      0
    );

    return totalRemainingHours;
  }
}
