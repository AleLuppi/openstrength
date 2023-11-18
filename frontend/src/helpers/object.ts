/**
 * Get a copy of an object where undefined keys are filtered out.
 *
 * @param obj object that shall be filtered.
 * @returns filtered version of the object.
 */
export function filterOutUndefined(obj: { [key: string]: any }) {
  const ret: { [key: string]: any } = {};
  Object.keys(obj)
    .filter((key) => obj[key] !== undefined)
    .forEach((key) => (ret[key] = obj[key]));
  return ret;
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
  Object.assign(objA, filterOutUndefined(objB));
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
export function objectMapValues<T extends object>(
  obj: T,
  updateFunc: (
    value: T[keyof T] extends infer V ? V : never,
    key: keyof T,
    index: number,
  ) => any,
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
