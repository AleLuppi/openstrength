/**
 * Get the unique values in an array.
 *
 * @param array input vector.
 * @param sorted if true, also sort values.
 * @returns a new array with only unique values.
 */
export function arrayUniqueValues<T>(array: T[], sorted: boolean = true): T[] {
  const newArray = [...new Set(array)];
  if (sorted) return newArray.sort();
  return newArray;
}

/**
 * Remove undefined values from array.
 *
 * @param array input vector.
 * @returns a new array with only values different from undefined.
 */
export function arrayFilterUndefined<T>(array: (T | undefined)[]): T[] {
  return array.filter((val) => val != undefined) as T[];
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
export function arraySortObjectsByField<T extends object, R>(
  array: T[],
  field: keyof T,
  transform: (val: T[keyof T]) => R = (val) => val as R,
) {
  return [...array].sort((objA, objB) => {
    if (transform(objA[field]) < transform(objB[field])) return -1;
    else if (transform(objA[field]) > transform(objB[field])) return 1;
    return 0;
  });
}
