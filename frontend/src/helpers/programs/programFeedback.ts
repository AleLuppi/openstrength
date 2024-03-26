import type { ProgramFeedback } from "@/helpers/programs/models";
import { Program } from "@/helpers/programs/program";
import { doAddDoc, doGetDocs, doUpdateDoc } from "@/helpers/database/readwrite";
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
    onSuccess?: (...x: any) => void;
    onError?: (...x: any) => void;
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
        onSuccess?.(docRef);
      },
      onError: onError,
    });
  }
  return true;
}

/**
 * Save the feedback of a program in database.
 *
 * @param program program or program ID to select where to store feedback.
 * @param onSuccess function to execute when write operation is successful.
 * @param onError function to execute when write operation fails.
 * @returns true if feedback save is requested, false otherwise (don't know program ID).
 */
export async function loadLatestFeedback(
  program: Program | string,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: (feedback: ProgramFeedback) => void;
    onError?: (...x: any) => void;
  } = {},
): Promise<ProgramFeedback | undefined> {
  const programId = program instanceof Program ? program.uid : program;
  if (!programId) return;
  let feedback: ProgramFeedback | undefined = undefined;
  await doGetDocs(
    `${dbCollections.programs}/${programId}/${dbSubcollections.programFeedbacks}`,
    undefined,
    {
      ordering: ["-createdOn"],
      numDocs: 1,
      onSuccess: (docVal: { [key: string]: ProgramFeedback }) => {
        feedback = Object.values(docVal)[0];
        feedback.uid = Object.keys(docVal)[0];
        onSuccess?.(feedback);
      },
      onError: onError,
    },
  );

  // Convert possible null values to undefined
  if (feedback) {
    (feedback as any).feedbacks = (feedback as ProgramFeedback).feedbacks.map(
      (fb) => (fb === null ? undefined : fb),
    );
  }

  return feedback;
}
