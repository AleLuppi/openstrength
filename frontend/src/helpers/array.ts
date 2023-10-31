/**
 * Get the unique values in an array.
 *
 * @param array input vector.
 * @param sorted if true, also sort values.
 * @returns a new array with only unique values.
 */
export function uniqueValues(array: any[], sorted: boolean = true) {
  const newArray = [...new Set(array)];
  if (sorted) return newArray.sort();
  return newArray;
}
