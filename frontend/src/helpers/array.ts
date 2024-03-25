/**
 * Get the unique values in an array.
 *
 * @param array input vector.
 * @param [sorted=true] if true, also sort values, if function, apply a transformation to values for sorting purposes.
 * @param [deep=false] if true, compare deep object values instead of loose instance comparison.
 * @returns a new array with only unique values.
 */
export function arrayUniqueValues<T, R>(
  array: T[],
  sorted: boolean | ((val: T, arr: T[]) => R) = true,
  deep = false,
): T[] {
  const newArray = deep
    ? Object.values(
        Object.fromEntries(array.map((v) => [JSON.stringify(v), v])),
      )
    : [...new Set(array)];
  if (sorted)
    return arraySort(
      newArray,
      true,
      typeof sorted == "function" ? sorted : undefined,
    );
  return newArray;
}

/**
 * Sort the values of an array.
 *
 * @param array input vector.
 * @param inplace if true, sort array in place, otherwise create a new array.
 * @param [sortBy=(val) => val] optional transformation applied to values before comparing them.
 * @returns a new array with sorted values.
 */
export function arraySort<T, R>(
  array: T[],
  inplace = false,
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
 * @param [inplace=false] if true, sort array inplace.
 * @param [sortBy=(val) => val] optional transformation applied to values before comparing them.
 * @returns sorted array.
 */
export function arraySortObjectsByField<T extends object, R>(
  array: T[],
  field: keyof T,
  inplace = false,
  sortBy: (val: T[keyof T], arr: T[]) => R = (val) => val as R,
) {
  return arraySort(array, inplace, (val, arr) => sortBy(val[field], arr));
}

/**
 * Transform an array of pairs into an object.
 *
 * @param array input array of pairs.
 * @param [unique=false] if true, ensure list of values only contains unique values.
 * @returns object having the first value in pairs as keys, and second value in pairs values (array).
 */
export function arrayOfPairsToObject<K extends string | number | symbol, V>(
  array: [K, V][],
  unique = false,
): { [key in K]: V[] } {
  return array.reduce((out, [key, value]) => {
    if (unique) out[key] = arrayUniqueValues([...(out[key] ?? []), value]);
    else out[key] = (out[key] ?? []).concat([value]);
    return out;
  }, {} as { [key in K]: V[] });
}

/**
 * Zip two or more arrays into group of values in a single array.
 *
 * @param [pad=false] if true, preserve longest array length, otherwise stick with shortest length.
 * @param arrays any number of arrays to zip.
 * @returns an array containing list of values from each input arrays in order.
 */
export function arrayZip<T>(arrays: T[][], pad = false): T[][] {
  const length = Math[pad ? "max" : "min"](...arrays.map((arr) => arr.length));

  return Array(length)
    .fill(undefined)
    .map((_, i) => arrays.map((a) => a[i]));
}

/**
 * Push a value to a possibly undefined array.
 *
 * @param array possibly undefined array.
 * @param value value to push.
 * @returns array instance with inserted value.
 */
export function arrayPushToNullable<T>(array: T[] | undefined, value: T): T[] {
  const outArray = array || [];
  return outArray.concat([value]);
}

/**
 * Concat values to a possibly undefined array.
 *
 * @param array possibly undefined array.
 * @param values values to concat.
 * @returns array instance with inserted values.
 */
export function arrayConcatToNullable<T>(
  array: T[] | undefined,
  values: T[],
): T[] {
  const outArray = array || [];
  return outArray.concat(values);
}

/**
 * Preserve a single value in a list of subsequent equal values in array.
 *
 * @param arr array that shall be cleaned.
 * @returns array with cleaned subsequent values.
 */
export function arrayUniqueSubsequentValues<T>(arr: T[]): T[] {
  return arr.reduce((out: T[], val) => {
    if (out.length == 0 || val != out.at(-1)) out.push(val);
    return out;
  }, []);
}
