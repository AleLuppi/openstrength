import { DocumentReference } from "firebase/firestore";
import { doAddDoc, doUpdateDoc } from "@/helpers/database/readwrite";
import { programsCollection } from "@/helpers/database/collections";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";
import { AthleteUser, CoachUser } from "@/helpers/users/user";

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
  programExercises?: ProgramExercise[];

  // Program status
  coach?: CoachUser;
  athlete?: AthleteUser;
  startedOn?: Date;
  finishedOn?: Date;

  // App specific info
  createdOn?: Date;
  lastUpdated?: Date;

  // Computed info
  coachId?: string;
  athleteId?: string;
  isAssigned?: boolean;
  isOngoing?: boolean;
  isCompleted?: boolean;
};

/**
 * Program line properties.
 */
export type ProgramExerciseProps = {
  // Basic program exercise info
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
  exerciseNote?: string;

  // Lines composing exercise
  lines?: ProgramLine[];
};

/**
 * Program line properties.
 */
export type ProgramLineProps = {
  // Basic program line info
  uid?: string;

  // Father program exercise instance
  programExercise?: ProgramExercise;

  // Schedule info
  lineOrder?: number;

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
  programExercises?: ProgramExercise[];

  // Program status
  coach?: CoachUser;
  athlete?: AthleteUser;
  startedOn?: Date;
  finishedOn?: Date;

  // App specific info
  createdOn?: Date;
  lastUpdated?: Date;

  // Get reference users ID
  public get coachId() {
    return this.coach?.uid;
  }
  public get athleteId() {
    return this.athlete?.uid;
  }

  // Check if program is assigned to an athlete
  public get isAssigned() {
    // Program is assigned if athlete is known
    return Boolean(this.athleteId);
  }

  // Check if program is currently in progress by athlete
  public get isOngoing() {
    // Program is ongoing if it has been started but not finished yet
    return Boolean(this.startedOn) && !this.finishedOn;
  }
  public get isCompleted() {
    // Program is ongoing if it has been started but not finished yet
    return Boolean(this.finishedOn);
  }

  constructor({
    uid,
    name,
    description,
    labels,
    programExercises,
    coach,
    athlete,
    startedOn,
    finishedOn,
    createdOn,
    lastUpdated,
  }: ProgramProps = {}) {
    this.uid = uid;
    this.name = name;
    this.description = description;
    this.labels = labels;
    programExercises?.forEach((exercise) => {
      if (!exercise.program) exercise.program = this;
    });
    this.programExercises = programExercises;
    this.coach = coach;
    this.athlete = athlete;
    this.startedOn = startedOn;
    this.finishedOn = finishedOn;
    this.createdOn = createdOn;
    this.lastUpdated = lastUpdated;
  }

  /**
   * Store a new program on database.
   *
   * @param program element that shall be stored.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  saveNew({
    program,
    onSuccess,
    onError,
  }: {
    program?: Program;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    const programToSave = program || this;
    programToSave.createdOn = new Date();
    programToSave.lastUpdated = new Date();
    addDocProgram(programToSave, { onSuccess: onSuccess, onError: onError });
  }

  /**
   * Update an existing program on database.
   *
   * @param program element that shall be updated.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  saveUpdate({
    program,
    onSuccess,
    onError,
  }: {
    program?: Program;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    const programToUpdate = program || this;
    programToUpdate.lastUpdated = new Date();
    updateDocProgram(programToUpdate, {
      onSuccess: onSuccess,
      onError: onError,
    });
  }

  /**
   * Store a new program on database, or update if already exists.
   *
   * @param program element that shall be saved or updated.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  save({
    program,
    onSuccess,
    onError,
  }: {
    program?: Program;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    const programToSave = program || this;
    if (programToSave.uid)
      programToSave.saveUpdate({ onSuccess: onSuccess, onError: onError });
    else programToSave.saveNew({ onSuccess: onSuccess, onError: onError });
  }

  /**
   * Duplicate program.
   *
   * @param shallow avoid copying identifying fields such as uid and parent instance.
   * @returns a new program with duplicate fields.
   */
  duplicate(shallow: boolean = false) {
    return new Program({
      ...this,
      programExercises: this.programExercises?.map((programExercise) =>
        programExercise.duplicate(),
      ),
      ...(shallow && {
        uid: undefined,
        name: undefined,
      }),
    });
  }
}

/**
 * Program exercise entity.
 *
 * @public
 */
export class ProgramExercise {
  // Basic program exercise info
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
  exerciseNote?: string;

  // Lines composing exercise
  lines?: ProgramLine[];

  constructor({
    uid,
    program,
    scheduleWeek,
    scheduleDay,
    scheduleOrder,
    exercise,
    exerciseVariant,
    exerciseNote,
    lines,
  }: ProgramExerciseProps = {}) {
    this.uid = uid;
    this.program = program;
    this.scheduleWeek = scheduleWeek;
    this.scheduleDay = scheduleDay;
    this.scheduleOrder = scheduleOrder;
    this.exercise = exercise;
    this.exerciseVariant = exerciseVariant;
    this.exerciseNote = exerciseNote;
    lines?.forEach((line) => {
      if (!line.programExercise) line.programExercise = this;
    });
    this.lines = lines;
  }

  /**
   * Duplicate program exercise.
   *
   * @param shallow avoid copying identifying fields such as uid and parent instance.
   * @returns a new program exercise with duplicate fields.
   */
  duplicate(shallow: boolean = false) {
    return new ProgramExercise({
      ...this,
      lines: this.lines?.map((line) => line.duplicate(shallow)),
      ...(shallow && {
        uid: undefined,
        program: undefined,
      }),
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

  // Father program exercise instance
  programExercise?: ProgramExercise;

  // Schedule info
  lineOrder?: number;

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
  // TODO continue from here!!!!!!!!!!!!!!!!!!!
  public get setsValue(): number | undefined {
    if (this.setsBaseValue !== undefined && /^\d*$/.test(this.setsBaseValue)) {
      return parseInt(this.setsBaseValue);
    } else {
      return this.setsComputedValue;
    }
  }

  get setsComputedValue(): number | undefined {
    if (
      this.setsReference !== null &&
      this.setsReference?.setsValue !== undefined
    ) {
      if (
        this.setsOperation !== undefined &&
        /^[+-]\d*$/.test(this.setsOperation)
      ) {
        const operationValue = parseInt(this.setsOperation);
        return this.setsReference.setsValue + operationValue;
      }
    } else {
      return this.setsSupposedValue;
    }
  }

  get setsOperation(): string | undefined {
    if (
      this.setsBaseValue !== undefined &&
      /^.[+-]\d*$/.test(this.setsBaseValue)
    ) {
      const [, operationPart] = this.setsBaseValue.match(/[+-]\d*$/) || [];
      return operationPart || undefined;
    } else {
      return undefined;
    }
  }

  get setsSupposedValue(): number | undefined {
    if (
      this.setsBaseValue !== undefined &&
      /^\d*\/\d*$/.test(this.setsBaseValue)
    ) {
      const [secondNumber, firstNumber] = this.setsBaseValue
        .split("/")
        .map(Number);
      return Math.round((secondNumber + firstNumber) / 2);
    } else if (
      this.setsBaseValue !== undefined &&
      /^\(\d*\)$/.test(this.setsBaseValue)
    ) {
      return parseInt(this.setsBaseValue.slice(1, -1));
    } else {
      return undefined;
    }
  }

  get requireSets(): boolean {
    if (
      this.setsBaseValue !== undefined &&
      /^\\?|\\(\d*\\)|\d*\/\d*$/.test(this.setsBaseValue)
    ) {
      return true;
    } else {
      return false;
    }
  }

  get setsRangeMin(): number | undefined {
    if (
      this.setsBaseValue !== undefined &&
      /^\d*\/\d*$/.test(this.setsBaseValue)
    ) {
      const [, minPart] = this.setsBaseValue.match(/^\d*/) || [];
      return minPart ? parseInt(minPart) : undefined;
    } else {
      return undefined;
    }
  }

  get setsRangeMax(): number | undefined {
    if (
      this.setsBaseValue !== undefined &&
      /^\d*\/\d*$/.test(this.setsBaseValue)
    ) {
      const [, maxPart] = this.setsBaseValue.match(/\/(\d*)$/) || [];
      return maxPart ? parseInt(maxPart) : undefined;
    } else {
      return undefined;
    }
  }

  constructor({
    uid,
    programExercise,
    lineOrder,
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
    this.programExercise = programExercise;
    this.lineOrder = lineOrder;
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

  /**
   * Duplicate program line.
   *
   * @param shallow avoid copying identifying fields such as uid and parent instance.
   * @returns a new program line with duplicate fields.
   */
  duplicate(shallow: boolean = false) {
    return new ProgramLine({
      ...this,
      ...(shallow && {
        uid: undefined,
        programExercise: undefined,
      }),
    });
  }
}

/**
 * Store program on database.
 *
 * @param program element to store on database.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function addDocProgram(
  program: Program,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  const { uid, ...programObj } = flattenProgram(program);
  doAddDoc(programsCollection, programObj, {
    onSuccess: (docRef: DocumentReference) => {
      program.uid = docRef.id;
      onSuccess?.(docRef);
    },
    onError: onError,
  });
}

/**
 * Update program on database.
 *
 * @param program element to update on database.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function updateDocProgram(
  program: Program,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  const { uid, ...programObj } = flattenProgram(program);
  const docId = program.uid;
  if (docId)
    doUpdateDoc(programsCollection, docId, programObj, {
      onSuccess: (docRef: DocumentReference) => {
        onSuccess?.(docRef);
      },
      onError: onError,
    });
  else onError?.();
}

/**
 * Flatten a program to avoid nested class instances
 *
 * @param program instance to flatten.
 * @returns flattened program.
 */
function flattenProgram(program: Program) {
  const { programExercises, coach, athlete, ...programObj } = program;
  const flatProgram = {
    ...programObj,
    coachId: program.coach?.uid,
    athleteId: program.athlete?.uid,
    lines: program.programExercises?.reduce(
      (out: object[], exerciseToSpread) => {
        const { program, exerciseVariant, lines, ...exerciseObj } =
          exerciseToSpread;
        const flatExercise = {
          ...exerciseObj,
          exercise: exerciseToSpread.exerciseVariant?.uid,
        };
        return [
          ...out,
          ...(exerciseToSpread.lines?.map((lineToSpread) => {
            const { uid, programExercise, ...lineObj } = lineToSpread;
            return { ...flatExercise, ...lineObj };
          }) || []),
        ];
      },
      [],
    ),
  };

  return flatProgram;
}
