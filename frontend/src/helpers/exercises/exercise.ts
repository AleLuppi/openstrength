import { DocumentReference } from "firebase/firestore";
import { doAddDoc, doUpdateDoc } from "@/helpers/database/readwrite";
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
  const { uid: _, name: __, variants: ___, ...exerciseObj } = exercise;
  exercise.variants?.forEach((variant) => {
    const { uid: _, name: __, ...variantObj } = variant;
    const extendedVariantObj = {
      ...variantObj,
      ...exerciseObj,
      variant: variant.name,
      exercise: exercise.name,
    };
    doAddDoc(exercisesCollection, extendedVariantObj, {
      onSuccess: (docRef: DocumentReference) => {
        onSuccess?.();
        variant.uid = docRef.id;
        if (!variant.name) exercise.uid = docRef.id;
      },
      onError: onError,
    });
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
  // TODO update only interesting variants, or create a new document for new variants
  const { uid: _, name: __, variants: ___, ...exerciseObj } = exercise;
  exercise.variants?.forEach((variant) => {
    const { uid: docId, name: __, ...variantObj } = variant;
    const extendedVariantObj = {
      ...variantObj,
      ...exerciseObj,
      variant: variant.name,
      exercise: exercise.name,
    };
    if (docId)
      doUpdateDoc(exercisesCollection, docId, extendedVariantObj, {
        onSuccess: (docRef: DocumentReference) => {
          onSuccess?.(docRef);
        },
        onError: onError,
      });
    else onError?.();
  });
}
