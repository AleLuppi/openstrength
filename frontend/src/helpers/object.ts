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
