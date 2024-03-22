import { MaxLift, MaxLiftType } from 'src/helpers/maxlifts/maxlift';
import { arraySortObjectsByField, arrayUniqueValues } from 'src/helpers/array';
import { objectSortKeysByList } from '../object';

/**
 * Get a object having exercise name and max lift type as key, and MaxLift instance as value.
 * @param maxlifts list of max lifts.
 * @returns object of indexed max lifts.
 */
export function separateMaxliftPerExerciseAndType(maxlifts: MaxLift[]) {
  const sortedMaxlifts = arraySortObjectsByField(
    maxlifts,
    'performedOn'
  ).reverse();
  return sortedMaxlifts.reduce(
    (out: { [key: string]: { [type in MaxLiftType]?: MaxLift } }, maxlift) => {
      if (!maxlift.exercise?.name || !maxlift.type) return out;
      if (!out[maxlift.exercise.name])
        out[maxlift.exercise.name] = {
          [maxlift.type]: maxlift,
        };
      if (!out[maxlift.exercise.name][maxlift.type])
        out[maxlift.exercise.name][maxlift.type] = maxlift;
      out[maxlift.exercise.name] = objectSortKeysByList(
        out[maxlift.exercise.name],
        Object.values(MaxLiftType),
        true
      );
      return out;
    },
    {}
  );
}

/**
 * Compare two lists of maxlifts and get the differences.
 *
 * Note: maxlifts are not compared by instance, rather by exercise and
 * maxlift type they refer to.
 *
 * @param maxliftsOne first list of maxlifts.
 * @param maxliftsTwo second list of maxlifts.
 * @returns maxlifts in first list only, maxlifts in second list only, and pairs of matching maxlifts.
 */
export function compareMaxliftLists(
  maxliftsOne: MaxLift[],
  maxliftsTwo: MaxLift[]
): [MaxLift[], MaxLift[], [MaxLift, MaxLift][]] {
  // Prepare outputs
  const maxliftsInOne: MaxLift[] = [];
  const maxliftsInTwo: MaxLift[] = [];
  const maxliftsMatch: [MaxLift, MaxLift][] = [];

  // Separate maxlifts
  const separatedOne = separateMaxliftPerExerciseAndType(maxliftsOne);
  const separatedTwo = separateMaxliftPerExerciseAndType(maxliftsTwo);

  // Compare maxlifts
  arrayUniqueValues(
    Object.keys(separatedOne).concat(Object.keys(separatedTwo))
  ).forEach((exercise) => {
    const types1 = separatedOne[exercise];
    const types2 = separatedTwo[exercise];
    Object.values(MaxLiftType).forEach((type) => {
      const maxlift1 = types1?.[type];
      const maxlift2 = types2?.[type];
      if (maxlift1 && !maxlift2) maxliftsInOne.push(maxlift1);
      else if (maxlift2 && !maxlift1) maxliftsInTwo.push(maxlift2);
      else if (maxlift1 && maxlift2) maxliftsMatch.push([maxlift1, maxlift2]);
    });
  });

  return [maxliftsInOne, maxliftsInTwo, maxliftsMatch];
}
