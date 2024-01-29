/**
 * Get the unique values in an array.
 *
 * @param array input vector.
 * @param sorted if true, also sort values, if function, apply a transformation to values for sorting purposes.
 * @returns a new array with only unique values.
 */
export function arrayUniqueValues<T, R>(
  array: T[],
  sorted: boolean | ((val: T, arr: T[]) => R) = true,
): T[] {
  const newArray = [...new Set(array)];
  if (sorted)
    return arraySort(
      newArray,
      true,
      typeof sorted == "function" ? sorted : undefined,
    );
  return newArray;
}

/**
 * Get the unique values in an array.
 *
 * @param array input vector.
 * @param sorted if true, also sort values.
 * @param [sortBy=(val) => val] optional transformation applied to values before comparing them.
 * @returns a new array with only unique values.
 */
export function arraySort<T, R>(
  array: T[],
  inplace: boolean = false,
  sortBy: (val: T, arr: T[]) => T | R = (val) => val,
): T[] {
  return (inplace ? array : [...array]).sort((elA, elB) => {
    if (sortBy(elA, array) < sortBy(elB, array)) return -1;
    else if (sortBy(elA, array) > sortBy(elB, array)) return 1;
    return 0;
  });
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
 * @param [sortBy=(val) => val] optional transformation applied to values before comparing them.
 * @returns sorted array.
 */
export function arraySortObjectsByField<T extends object, R>(
  array: T[],
  field: keyof T,
  inplace: boolean = false,
  sortBy: (val: T[keyof T], arr: T[]) => R = (val) => val as R,
) {
  return arraySort(array, inplace, (val, arr) => sortBy(val[field], arr));
}
