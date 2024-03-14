import { ProgramFeedback } from "@/helpers/programs/models";
import { Program } from "@/helpers/programs/program";
import { doAddDoc, doUpdateDoc } from "@/helpers/database/readwrite";
import {
  dbCollections,
  dbSubcollections,
} from "@/helpers/database/collections";
import type { DocumentReference } from "firebase/firestore";
import { arrayPushToNullable } from "../array";

/**
 * Save the feedback of a program in database.
 *
 * @param feedback current feedback for a program.
 * @param program program or program ID to select where to store feedback.
 * @param onSuccess function to execute when write operation is successful.
 * @param onError function to execute when write operation fails.
 * @returns true if feedback save is requested, false otherwise (don't know program ID).
 */
export function saveFeedback(
  feedback: ProgramFeedback,
  program?: Program | string,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: Function;
    onError?: Function;
  } = {},
): boolean {
  if (!feedback.program && program instanceof Program)
    feedback.program = program;

  // Get program id
  const programId =
    feedback.program?.uid ??
    (program instanceof Program ? program?.uid : program);
  if (!programId) return false;

  // Create object to store
  const { program: _, uid, ...feedbackToStore } = feedback;

  // Save feedback under selected program
  const storageLocation = `${dbCollections.programs}/${programId}/${dbSubcollections.programFeedbacks}`;
  if (uid) {
    feedbackToStore.updatedOn = arrayPushToNullable(
      feedbackToStore.updatedOn,
      new Date(),
    );
    doUpdateDoc(storageLocation, uid, feedbackToStore, {
      onSuccess: onSuccess,
      onError: onError,
    });
  } else {
    doAddDoc(storageLocation, feedbackToStore, {
      addCurrentTimestamp: "createdOn",
      onSuccess: (docRef: DocumentReference) => {
        feedback.uid = docRef.id;
        onSuccess?.();
      },
      onError: onError,
    });
  }
  return true;
}
