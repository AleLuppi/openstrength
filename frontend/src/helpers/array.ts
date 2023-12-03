/**
 * Get the unique values in an array.
 *
 * @param array input vector.
 * @param sorted if true, also sort values.
 * @returns a new array with only unique values.
 */
export function arrayUniqueValues(array: any[], sorted: boolean = true) {
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
export function arrayCompare(arrayA: any[], arrayB: any[]) {
  return JSON.stringify(arrayA) === JSON.stringify(arrayB);
}

/**
 * Sort an array of objects according to a specific field.
 *
 * @param array list of objects that shall be sorted.
 * @param field object's key whose paired value will be used to sort.
 * @returns sorted array.
 */
export function arraySortObjectsByField<T extends object>(
  array: T[],
  field: keyof T,
) {
  return [...array].sort((objA, objB) => {
    if (objA[field] < objB[field]) return -1;
    else if (objA[field] > objB[field]) return 1;
    return 0;
  });
}
