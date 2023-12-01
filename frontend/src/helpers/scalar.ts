// ----- Functions related to Date -----

/**
 * Clean a date from its timezone offset.
 *
 * @param date if provided, date to clean from timezone, otherwise new date instance.
 * @returns the date cleaned from the user timezone.
 */
export function dateGetWithoutTimezone(date?: Date | string) {
  const dateToClean = date ? new Date(date) : new Date();
  return new Date(
    dateToClean.getTime() - dateToClean.getTimezoneOffset() * 60000,
  );
}
