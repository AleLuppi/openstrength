import { DocumentReference } from "firebase/firestore";
import { doAddDoc, doUpdateDoc } from "@/helpers/database/readwrite";
import { programsCollection } from "@/helpers/database/collections";
import { Exercise, ExerciseVariant } from "../exercises/exercise";

/**
 * Training program properties.
 */
export type ProgramProps = {
  // Basic program info
  uid?: string;
  name?: string;
  description?: string;
  labels?: string[];

  // Program composition
  lines?: ProgramLine[];

  // Program status
  coachId?: string;
  athleteId?: string;
  startedOn?: Date;
  finishedOn?: Date;

  // App specific info
  createdOn?: Date;
  lastUpdated?: Date;

  // Computed info
  isOngoing?: boolean;
};

/**
 * Program line properties.
 */
export type ProgramLineProps = {
  // Basic program line info
  uid?: string;

  // Father program instance
  program?: Program;

  // Schedule info
  scheduleWeek?: string | number;
  scheduleDay?: string | number;
  scheduleOrder?: string | number;

  // Exercise-related info
  exercise?: Exercise;
  exerciseVariant?: ExerciseVariant;

  // Line-specific info
  setsBaseValue?: string;
  setsReference?: ProgramLine;
  repsBaseValue?: string;
  repsReference?: ProgramLine;
  loadBaseValue?: string;
  loadReference?: ProgramLine;
  rpeBaseValue?: string;
  rpeReference?: ProgramLine;

  // Additional line info
  note?: string;
  requestFeedbackText?: boolean;
  requestFeedbackVideo?: boolean;

  // Computed line-specific info
  setsRequire?: boolean;
  setsOperation?: string;
  setsRangeMin?: number;
  setsRangeMax?: number;
  setsValue?: number;
  setsSupposedValue?: number;
  setsComputedValue?: number;
  repsRequire?: boolean;
  repsOperation?: string;
  repsRangeMin?: number;
  repsRangeMax?: number;
  repsValue?: number;
  repsSupposedValue?: number;
  repsComputedValue?: number;
  loadRequire?: boolean;
  loadOperation?: string;
  loadRangeMin?: number;
  loadRangeMax?: number;
  loadValue?: number;
  loadSupposedValue?: number;
  loadComputedValue?: number;
  rpeRequire?: boolean;
  rpeOperation?: string;
  rpeRangeMin?: number;
  rpeRangeMax?: number;
  rpeValue?: number;
  rpeSupposedValue?: number;
  rpeComputedValue?: number;
};

/**
 * Training program entity.
 *
 * @public
 */
export class Program {
  // Basic program info
  uid?: string;
  name?: string;
  description?: string;
  labels?: string[];

  // Program composition
  lines?: ProgramLine[];

  // Program status
  coachId?: string;
  athleteId?: string;
  startedOn?: Date;
  finishedOn?: Date;

  // App specific info
  createdOn?: Date;
  lastUpdated?: Date;

  // Check if program is currently in progress by athlete
  public get isOngoing() {
    // Program is ongoing if it has been started but not finished yet
    return Boolean(this.startedOn) && !this.finishedOn;
  }

  constructor({
    uid,
    name,
    description,
    labels,
    lines,
    coachId,
    athleteId,
    startedOn,
    finishedOn,
    createdOn,
    lastUpdated,
  }: ProgramProps = {}) {
    this.uid = uid;
    this.name = name;
    this.description = description;
    this.labels = labels;
    this.lines = lines;
    this.coachId = coachId;
    this.athleteId = athleteId;
    this.startedOn = startedOn;
    this.finishedOn = finishedOn;
    this.createdOn = createdOn;
    this.lastUpdated = lastUpdated;
  }

  saveNew({
    // TODO
    program,
    onSuccess,
    onError,
  }: {
    program?: Program;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    addDocProgram(program || this, { onSuccess: onSuccess, onError: onError });
  }

  saveUpdate({
    // TODO
    program,
    onSuccess,
    onError,
  }: {
    program?: Program;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    updateDocProgram(program || this, {
      onSuccess: onSuccess,
      onError: onError,
    });
  }
}

/**
 * Program line entity.
 *
 * @public
 */
export class ProgramLine {
  // Basic program line info
  uid?: string;

  // Father program instance
  program?: Program;

  // Schedule info
  scheduleWeek?: string | number;
  scheduleDay?: string | number;
  scheduleOrder?: string | number;

  // Exercise-related info
  exercise?: Exercise;
  exerciseVariant?: ExerciseVariant;

  // Line-specific info
  setsBaseValue?: string;
  setsReference?: ProgramLine;
  repsBaseValue?: string;
  repsReference?: ProgramLine;
  loadBaseValue?: string;
  loadReference?: ProgramLine;
  rpeBaseValue?: string;
  rpeReference?: ProgramLine;

  // Additional line info
  note?: string;
  requestFeedbackText?: boolean;
  requestFeedbackVideo?: boolean;

  // TODO computed properties

  constructor({
    uid,
    program,
    scheduleWeek,
    scheduleDay,
    scheduleOrder,
    exercise,
    exerciseVariant,
    setsBaseValue,
    setsReference,
    repsBaseValue,
    repsReference,
    loadBaseValue,
    loadReference,
    rpeBaseValue,
    rpeReference,
    note,
    requestFeedbackText,
    requestFeedbackVideo,
  }: ProgramLineProps = {}) {
    this.uid = uid;
    this.program = program;
    this.scheduleWeek = scheduleWeek;
    this.scheduleDay = scheduleDay;
    this.scheduleOrder = scheduleOrder;
    this.exercise = exercise;
    this.exerciseVariant = exerciseVariant;
    this.setsBaseValue = setsBaseValue;
    this.setsReference = setsReference;
    this.repsBaseValue = repsBaseValue;
    this.repsReference = repsReference;
    this.loadBaseValue = loadBaseValue;
    this.loadReference = loadReference;
    this.rpeBaseValue = rpeBaseValue;
    this.rpeReference = rpeReference;
    this.note = note;
    this.requestFeedbackText = requestFeedbackText;
    this.requestFeedbackVideo = requestFeedbackVideo;
  }
}

/**
 * Store program on database.
 *
 * @param program program info to store on database.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function addDocProgram(
  program: Program,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  const { uid: _, ...programObj } = program;
  doAddDoc(programsCollection, programObj, {
    addUserId: true,
    onSuccess: (docRef: DocumentReference) => {
      onSuccess?.();
      program.uid = docRef.id;
    },
    onError: onError,
  });
}

/**
 * Update program on database.
 *
 * @param program program to store on database.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function updateDocProgram(
  user: Program,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  const { uid: docId, ...programObj } = user;
  programObj.lastUpdated = new Date();
  if (docId)
    doUpdateDoc(programsCollection, docId, programObj, {
      addUserId: true,
      onSuccess: (docRef: DocumentReference) => {
        onSuccess?.(docRef);
      },
      onError: onError,
    });
  else onError?.();
}
