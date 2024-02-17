import { inspect } from "util";

/**
 * Check if an object has no key-value pairs.
 *
 * @param obj object whose emptiness should be checked.
 * @returns true if object is empty, false otherwise.
 */
export function objectIsEmpty(obj: Object) {
  return Object.keys(obj).length === 0;
}

/**
 * Get a copy of an object where undefined keys are filtered out.
 *
 * @param obj object that shall be filtered.
 * @returns filtered version of the object.
 */
export function objectFilterOutUndefined(obj: { [key: string]: any }) {
  const ret: { [key: string]: any } = {};
  Object.keys(obj)
    .filter((key) => obj[key] !== undefined)
    .forEach((key) => (ret[key] = obj[key]));
  return ret;
}

/**
 * Sort key-value pairs in object according to a specific list of keys order.
 *
 * @param obj object that shall be sorted.
 * @param list list of keys to sort object by.
 * @param ignoreUndefined if true, ignore undefined values, otherwise keep them.
 * @returns object with sorted key-value pairs.
 */
export function objectSortKeysByList(
  obj: { [key: string]: any },
  list: string[],
  ignoreUndefined: boolean = false,
) {
  const out: typeof obj = {};
  list.forEach((key) => {
    if (!ignoreUndefined || obj[key] != undefined) out[key] = obj[key];
  });
  return out;
}

/**
 * Assign values from source object to destination, while avoiding overwrite fields that are undefined on source.
 *
 * @param objA destination object that shall be updated.
 * @param objB source object that provides values.
 */
export function objectAssignNotUndefined(
  objA: { [key: string]: any },
  objB: { [key: string]: any },
) {
  Object.assign(objA, objectFilterOutUndefined(objB));
}

/**
 * Map object keys according to a specified function.
 *
 * @param obj object whose keys shall be mapped.
 * @param updateFunc keys update method.
 * @returns new object with mapped keys.
 */
export function objectMapKeys<T extends object>(
  obj: T,
  updateFunc: (key: keyof T, index: number) => keyof T,
) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v], i) => [updateFunc(k as keyof T, i), v]),
  );
}

/**
 * Map object values according to a specified function.
 *
 * @param obj object whose values shall be mapped.
 * @param updateFunc values update method.
 * @returns new object with mapped values.
 */
export function objectMapValues<T extends object, R>(
  obj: T,
  updateFunc: (
    value: T[keyof T] extends infer V ? V : never,
    key: keyof T,
    index: number,
  ) => R,
) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v], i) => [k, updateFunc(v, k as keyof T, i)]),
  );
}

/**
 * Pop a specific key from object.
 *
 * @param obj object to pop key from.
 * @param key key that shall be popped.
 * @returns value associated to just popped key.
 */
export function objectPop<T extends object>(obj: T, key?: keyof T) {
  const popKey = (key ?? Object.keys(obj).at(-1)) as keyof T;
  const val = obj[popKey];
  delete obj[popKey];
  return val;
}

/**
 * Deep compare two objects, including keys order.
 *
 * @param objA first object to compare.
 * @param objB second object to compare.
 * @returns value associated to just popped key.
 */
export function objectDeepCompare(objA: object, objB: object) {
  return JSON.stringify(inspect(objA)) === JSON.stringify(inspect(objB));
}

/**
 * Create a deep copy of an object.
 *
 * @param obj object to copy.
 * @returns copied object.
 */
export function objectDeepCopy<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
