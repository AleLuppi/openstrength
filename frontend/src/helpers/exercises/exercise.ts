import { DocumentReference } from "firebase/firestore";
import {
  doAddDoc,
  doUpdateDoc,
  doDeleteDoc,
} from "@/helpers/database/readwrite";
import { exercisesCollection } from "../database/collections";

/**
 * Define available load types.
 */
export enum ExerciseLoadType {
  reps = "reps",
  weight = "weight",
  time = "time",
}

/**
 * Define the name of the default exercise variant.
 */
export const defaultExerciseVariant = "default";

/**
 * Exercise properties.
 */
export type ExerciseProps = {
  // Basic info
  uid?: string;
  name?: string;

  // Exercise info
  loadType?: ExerciseLoadType;
  muscleGroups?: string[];

  // Variants
  variants?: ExerciseVariant[];
};

/**
 * Variants properties.
 */
export type ExerciseVariantProps = {
  // Basic info
  uid?: string;
  name?: string;

  // Father exercise instance
  exercise?: Exercise;

  // Variant info
  description?: string;
  equipment?: string[];

  // Additional info
  videoUrl?: string;
};

/**
 * Exercise entity.
 *
 * @public
 */
export class Exercise {
  // Basic info
  uid?: string;
  name?: string;

  // Exercise info
  loadType?: ExerciseLoadType;
  muscleGroups?: string[];

  // Variants
  variants?: ExerciseVariant[];

  constructor({
    uid,
    name,
    loadType,
    muscleGroups,
    variants,
  }: ExerciseProps = {}) {
    this.uid = uid;
    this.name = name;
    this.loadType = loadType;
    this.muscleGroups = muscleGroups;
    variants?.forEach((variant) => {
      if (!variant.exercise) variant.exercise = this;
    });
    this.variants = variants;
  }

  /**
   * Add a default variant that has no name.
   *
   * @param force if true, force addition of default variant even if already existent.
   */
  addDefaultVariant(force: boolean = false) {
    if (
      force ||
      !this.variants?.find((variant) => variant.name == defaultExerciseVariant)
    )
      (this.variants = this.variants || []).push(
        new ExerciseVariant({
          uid: this.uid,
          name: defaultExerciseVariant,
          exercise: this,
        }),
      );
  }

  /**
   * Store a new exercise on database.
   *
   * @param exercise element that shall be stored.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  saveNew({
    exercise,
    onSuccess,
    onError,
  }: {
    exercise?: Exercise;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    addDocExercise(exercise || this, {
      onSuccess: onSuccess,
      onError: onError,
    });
  }

  /**
   * Update the exercise on database.
   *
   * @param exercise element that shall be updated.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  saveUpdate({
    exercise,
    onSuccess,
    onError,
  }: {
    exercise?: Exercise;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    updateDocExercise(exercise || this, {
      onSuccess: onSuccess,
      onError: onError,
    });
  }

  /**
   * Remove the exercise from database.
   *
   * @param exercise element that shall be removed.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  remove({
    exercise,
    onSuccess,
    onError,
  }: {
    exercise?: Exercise;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    // Remove each variant, thus remove the exercise
    (exercise || this).variants?.forEach((variant) =>
      variant.remove({ onSuccess: onSuccess, onError: onError }),
    );
  }
}

/**
 * Variant entity.
 *
 * @public
 */
export class ExerciseVariant {
  // Basic info
  uid?: string;
  name?: string;

  // Father exercise instance
  exercise?: Exercise;

  // Variant info
  description?: string;
  equipment?: string[];

  // Additional info
  videoUrl?: string;

  constructor({
    uid,
    name,
    exercise,
    description,
    equipment,
    videoUrl,
  }: ExerciseVariantProps = {}) {
    this.uid = uid;
    this.name = name;
    this.exercise = exercise;
    this.description = description;
    this.equipment = equipment;
    this.videoUrl = videoUrl;
  }

  /**
   * Remove the variant from database.
   *
   * @param variant element that shall be removed.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  remove({
    variant,
    onSuccess,
    onError,
  }: {
    variant?: ExerciseVariant;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    // Ensure variant is mapped onto a database document
    const variantToDelete = variant || this;
    if (!variantToDelete.uid) {
      onError?.();
      return;
    }

    // Delete the variant
    doDeleteDoc(exercisesCollection, variantToDelete.uid, {
      onSuccess: onSuccess,
      onError: onError,
    });
  }
}

/**
 * Store exercise on database.
 *
 * @param exercise element to store on database.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function addDocExercise(
  exercise: Exercise,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  exercise.variants?.forEach((variant) =>
    addDocExerciseVariant(variant, exercise, {
      onSuccess: onSuccess,
      onError: onError,
    }),
  );
}

/**
 * Store exercise variant on database.
 *
 * @param exerciseVariant element to store on database.
 * @param exercise force a parent exercise for the variant.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function addDocExerciseVariant(
  exerciseVariant: ExerciseVariant,
  exercise?: Exercise,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  const extendedVariantObj = extractExerciseVariantInfo(
    exerciseVariant,
    exercise,
  );
  doAddDoc(exercisesCollection, extendedVariantObj, {
    addUserId: true,
    onSuccess: (docRef: DocumentReference) => {
      onSuccess?.(docRef);
      exerciseVariant.uid = docRef.id;
    },
    onError: onError,
  });
}

/**
 * Update exercise on database.
 *
 * @param exercise element to update on database.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function updateDocExercise(
  exercise: Exercise,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  // Update existing variants, or create a new document for new variants
  exercise.variants?.forEach((variant) => {
    if (variant.uid)
      updateDocExerciseVariant(variant, exercise, {
        onSuccess: onSuccess,
        onError: onError,
      });
    else
      addDocExerciseVariant(variant, exercise, {
        onSuccess: onSuccess,
        onError: onError,
      });
  });
}

/**
 * Update exercise variant on database.
 *
 * @param exerciseVariant element to update on database.
 * @param exercise force a parent exercise for the variant.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function updateDocExerciseVariant(
  exerciseVariant: ExerciseVariant,
  exercise?: Exercise,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  const extendedVariantObj = extractExerciseVariantInfo(
    exerciseVariant,
    exercise,
  );
  const docId = exerciseVariant.uid;
  if (docId)
    doUpdateDoc(exercisesCollection, docId, extendedVariantObj, {
      addUserId: true,
      onSuccess: (docRef: DocumentReference) => {
        onSuccess?.(docRef);
      },
      onError: onError,
    });
  else onError?.();
}

/**
 * Extract the variant info ready to be stored on DB.
 *
 * @param exerciseVariant element from which info shall be extracted.
 * @param exercise force a parent exercise for the variant.
 * @returns an object containing all the variant info.
 */
function extractExerciseVariantInfo(
  exerciseVariant: ExerciseVariant,
  exercise?: Exercise,
) {
  const { uid: _0, name: _1, exercise: _2, ...variantObj } = exerciseVariant;
  const variantExercise =
    exercise ?? exerciseVariant.exercise ?? new Exercise();
  const { uid: _3, name: _4, variants: _5, ...exerciseObj } = variantExercise;
  const fullVariantObj = {
    ...variantObj,
    ...exerciseObj,
    variant: exerciseVariant.name,
    exercise: variantExercise.name,
  };

  return fullVariantObj;
}

/**
 * Pack the variant info coming from DB.
 *
 * @param exerciseVariant element from which info shall be extracted.
 * @param exercise force a parent exercise for the variant.
 * @returns an object containing all the variant info.
 */
export function packExerciseVariantInfo(
  fullVariantObj: ExerciseProps &
    ExerciseVariantProps & { variant?: string; exercise?: string },
  uid?: string,
) {
  return new Exercise({
    name: fullVariantObj.exercise,
    loadType: fullVariantObj.loadType,
    muscleGroups: fullVariantObj.muscleGroups,
    variants: [
      new ExerciseVariant({
        uid: uid,
        name: fullVariantObj.variant,
        description: fullVariantObj.description,
        equipment: fullVariantObj.equipment,
        videoUrl: fullVariantObj.videoUrl,
      }),
    ],
  });
}

/**
 * Reduce a list of exercises to merge variants according to exercise name.
 *
 * @param exercises list of exercises to reduce.
 * @returns unique exercises with concatenated list of variants.
 */
export function reduceExercises(exercises: Exercise[]) {
  return exercises.reduce((prev: Exercise[], curr: Exercise) => {
    const exercise = prev.find((exercise) => exercise.name == curr.name);
    if (exercise) {
      exercise.variants = (exercise.variants ?? []).concat(curr.variants ?? []);
      return prev;
    } else {
      prev.push(curr);
      return prev;
    }
  }, []);
}
