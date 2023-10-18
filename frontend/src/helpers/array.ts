/**
 * Get the unique values in an array.
 *
 * @param array input vector.
 * @returns a new array with only unique values.
 */
export function uniqueValues(array: any[]) {
  return array.filter((value, index, array) => array.indexOf(value) === index);
}
