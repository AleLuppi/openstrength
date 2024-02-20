import type { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";

/**
 * Reduce a list of exercises to merge variants according to exercise name.
 *
 * @param exercises list of exercises to reduce.
 * @returns unique exercises with concatenated list of variants.
 */
export function reduceExercises(exercises: Exercise[]) {
  return exercises.reduce(
    (exerciseList: Exercise[], currentExercise: Exercise) => {
      const exercise = exerciseList.find(
        (exercise) => exercise.name == currentExercise.name,
      );
      if (exercise) {
        exercise.variants = (exercise.variants ?? []).concat(
          currentExercise.variants ?? [],
        );
        exercise.variants.forEach((variant) => (variant.exercise = exercise));
        return exerciseList;
      } else {
        exerciseList.push(currentExercise);
        return exerciseList;
      }
    },
    [],
  );
}

/**
 * Sort inplace a list of exercises by their name.
 *
 * @param exercises list of exercises to sort.
 * @param sortVariants if true, sort variants inside each exercise too.
 */
export function sortExercises(
  exercises: Exercise[],
  sortVariants: boolean = false,
) {
  // Sort by name
  exercises.sort((itemA, itemB) => {
    const nameA = (itemA.name ?? "").toLowerCase();
    const nameB = (itemB.name ?? "").toLowerCase();
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });

  // Sort variants if needed
  if (sortVariants)
    exercises.forEach((exercise) => {
      if (exercise.variants) sortExerciseVariants(exercise.variants);
    });
}

/**
 * Sort inplace a list of variants by their name.
 *
 * @param variants list of variants to sort.
 */
export function sortExerciseVariants(variants: ExerciseVariant[]) {
  // Sort by name
  variants.sort((itemA, itemB) => {
    const nameA = (itemA.name ?? "").toLowerCase();
    const nameB = (itemB.name ?? "").toLowerCase();
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });
}

/**
 * Find an exercise from a list according to its name.
 *
 * @param exercises list of available exercises.
 * @param exerciseName name of the exercise to search.
 * @param caseSensitive if true, find exercise with exact name, including characters case.
 * @returns exercise with selected name, if any.
 */
export function getExerciseByName(
  exercises: Exercise[],
  exerciseName: string,
  caseSensitive: boolean = false,
) {
  if (caseSensitive)
    return exercises.find((exercise) => exercise.name == exerciseName);
  return exercises.find(
    (exercise) => exercise.name?.toLowerCase() == exerciseName.toLowerCase(),
  );
}

/**
 * Find a variant from a list according to its name.
 *
 * @param variants list of available exercise variants.
 * @param variantName name of the variant to search.
 * @param caseSensitive if true, find variant with exact name, including characters case.
 * @returns variant with selected name, if any.
 */
export function getExerciseVariantByName(
  variants: ExerciseVariant[],
  variantName: string,
  caseSensitive: boolean = false,
) {
  if (caseSensitive)
    return variants.find((variant) => variant.name == variantName);
  return variants.find(
    (variant) => variant.name?.toLowerCase() == variantName.toLowerCase(),
  );
}
