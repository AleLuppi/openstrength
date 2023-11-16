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

/**
 * Check if the values inside two arrays are all equal (type not checked).
 *
 * @param arrayA first array to compare.
 * @param arrayB second array to compare.
 * @returns true if the values inside arrays are equal, false otherwise.
 */
export function compareArrays(arrayA: any[], arrayB: any[]) {
  return JSON.stringify(arrayA) === JSON.stringify(arrayB);
}
