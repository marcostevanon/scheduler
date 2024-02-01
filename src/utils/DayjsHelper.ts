export function loadLocalDayJs() {
  const _dayjs = require("dayjs");
  const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
  const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");
  _dayjs.extend(isSameOrBefore);
  _dayjs.extend(isSameOrAfter);
  return _dayjs;
}
