import { DocumentReference } from "firebase/firestore";
import {
  doAddDoc,
  doUpdateDoc,
  doDeleteDoc,
} from "@/helpers/database/readwrite";
import { programsCollection } from "@/helpers/database/collections";
import { User, CoachUser, AthleteUser, UserRole } from "@/helpers/users/user";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";
import { MaxLift } from "@/helpers/maxlifts/maxlift";

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
  repsReference?: ProgramLine | MaxLift;
  loadBaseValue?: string;
  loadReference?: ProgramLine | MaxLift;
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

  /**
   * Remove the program from database.
   *
   * @param program element that shall be removed.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  remove({
    program,
    onSuccess,
    onError,
  }: {
    program?: Program;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    // Ensure program is mapped onto a database document
    const programToDelete = program || this;
    if (!programToDelete.uid) {
      onError?.();
      return;
    }

    // Delete the program
    doDeleteDoc(programsCollection, programToDelete.uid, {
      onSuccess: onSuccess,
      onError: onError,
    });
  }

  /**
   * Get all lines of a program.
   *
   * @returns list of all lines in a program.
   */
  getLines() {
    return this.programExercises?.reduce(
      (allLines: ProgramLine[], programExercise) =>
        programExercise.lines
          ? [...allLines, ...programExercise.lines]
          : allLines,
      [],
    );
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
  repsReference?: ProgramLine | MaxLift;
  loadBaseValue?: string;
  loadReference?: ProgramLine | MaxLift;
  rpeBaseValue?: string;
  rpeReference?: ProgramLine;

  // Additional line info
  note?: string;
  requestFeedbackText?: boolean;
  requestFeedbackVideo?: boolean;

  // TODO computed properties

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
      (out: { [key: string]: any }[], exerciseToSpread) => {
        const { uid, program, exerciseVariant, lines, ...exerciseObj } =
          exerciseToSpread;
        const flatExercise = {
          ...exerciseObj,
          exercise: exerciseToSpread.exerciseVariant?.uid,
        };
        return [
          ...out,
          ...(exerciseToSpread.lines?.map((lineToSpread) => {
            const { programExercise, ...lineObj } = lineToSpread;
            const referenceAndType = {
              setsReference: lineToSpread.setsReference?.uid,
              repsReference: lineToSpread.repsReference?.uid,
              repsReferenceType: (lineToSpread.repsReference
                ? lineToSpread.repsReference instanceof MaxLift
                  ? "maxlift"
                  : "line"
                : undefined) as "maxlift" | "line" | undefined,
              loadReference: lineToSpread.loadReference?.uid,
              loadReferenceType: (lineToSpread["loadReference"]
                ? lineToSpread.loadReference instanceof MaxLift
                  ? "maxlift"
                  : "line"
                : undefined) as "maxlift" | "line" | undefined,
              rpeReference: lineToSpread.rpeReference?.uid,
            };
            return {
              ...flatExercise,
              ...lineObj,
              ...referenceAndType,
            };
          }) || []),
        ];
      },
      [],
    ),
  };

  return flatProgram;
}

/**
 * Create a program instance from a flat program object.
 *
 * This function expands a flattened version of a program into an actual Program instance.
 * The Program instance has some dependencies to other classes defined elsewhere.
 * One can pass clues to this method to resolve these outside class instances, but it
 * might not be always possible. Therefore, one may need to take care of assignment
 * outside of this function.
 * The arguments that could not be properly assigned are:
 *  - Program.coach (try to infer from coachId)
 *  - Program.athlete (try to infer from athleteId)
 *  - Program.programExercises[number].exercise (try to infer from lines[number].exercise)
 *  - Program.programExercises[number].variant (try to infer from lines[number].exercise)
 *  - Program.programExercises[number].lines[number].loadReference/repsReference/setsReference/rpeReference
 *      (try to infer from lines[number].loadReference/repsReference/setsReference/rpeReference when MaxLift type)
 *
 * @param flatProgram program flattened to key-value pairs object, as per flatting method.
 * @param users optional list of users to try resolve user-related exernal references.
 * @param exercises optional list of exercises to try resolve exercise-related external references.
 * @param maxlifts optional list of max lifts to try resolve maxlift-related external references.
 * @param storeUnresolved if provided, store unassigned references inside the variable.
 * @returns program instance.
 */
export function unflattenProgram(
  flatProgram: ReturnType<typeof flattenProgram>,
  users?: (User | CoachUser | AthleteUser)[],
  exercises?: Exercise[],
  maxlifts?: MaxLift[],
  storeUnresolved?: {
    coach?: [Program, string];
    athlete?: [Program, string];
    exercises?: [ProgramExercise, string][];
    maxlifts?: [
      ProgramLine,
      {
        loadReference?: string;
        repsReference?: string;
      },
    ][];
  },
): Program {
  // Get all program exercises and lines
  const programExercises: ProgramExercise[] = [];
  flatProgram.lines?.forEach((fullLineInfo) => {
    const {
      exercise,
      scheduleWeek,
      scheduleDay,
      scheduleOrder,
      exerciseNote,
      setsReference,
      repsReference,
      repsReferenceType,
      loadReference,
      loadReferenceType,
      rpeReference,
      ...lineInfo
    } = fullLineInfo;
    const currentExercise = programExercises.find(
      (programExercise) =>
        programExercise.scheduleWeek == scheduleWeek &&
        programExercise.scheduleDay == scheduleDay &&
        programExercise.scheduleOrder == scheduleOrder,
    );
    if (currentExercise)
      (currentExercise.lines = currentExercise.lines || []).push(
        new ProgramLine({
          programExercise: currentExercise,
          ...lineInfo,
        }),
      );
    else {
      const currentVariant = exercises
        ?.reduce(
          (out: ExerciseVariant[], oneExercise) =>
            out.concat(oneExercise.variants ?? []),
          [],
        )
        .find((variant) => variant.uid == exercise);
      programExercises.push(
        new ProgramExercise({
          scheduleWeek: scheduleWeek,
          scheduleDay: scheduleDay,
          scheduleOrder: scheduleOrder,
          exerciseNote: exerciseNote,
          exercise: currentVariant?.exercise,
          exerciseVariant: currentVariant,
          lines: [new ProgramLine({ ...lineInfo })],
        }),
      );
      if (storeUnresolved && !currentVariant && exercise)
        (storeUnresolved.exercises = storeUnresolved.exercises || []).push([
          programExercises.at(-1)!,
          exercise,
        ]);
    }
  });

  // Correct references in program lines
  const programLines = programExercises.reduce(
    (out: { [key: string]: ProgramLine }, programExercise) => {
      const currLines =
        programExercise.lines?.reduce(
          (out: { [key: string]: ProgramLine }, line) => {
            if (line.uid) out[line.uid] = line;
            return out;
          },
          {},
        ) ?? {};
      return { ...out, ...currLines };
    },
    {},
  );
  flatProgram.lines?.forEach((fullLineInfo) => {
    const currLine = programLines[fullLineInfo.uid];
    if (!currLine) return;
    currLine.loadReference =
      fullLineInfo.loadReferenceType === "maxlift"
        ? maxlifts?.find((maxlift) => maxlift.uid == fullLineInfo.loadReference)
        : fullLineInfo.loadReferenceType === "line"
        ? programLines[fullLineInfo.loadReference]
        : undefined;
    currLine.repsReference =
      fullLineInfo.repsReferenceType === "maxlift"
        ? maxlifts?.find((maxlift) => maxlift.uid == fullLineInfo.repsReference)
        : fullLineInfo.repsReferenceType === "line"
        ? programLines[fullLineInfo.repsReference]
        : undefined;
    currLine.setsReference = programLines[fullLineInfo.setsReference];
    currLine.rpeReference = programLines[fullLineInfo.rpeReference];
    if (
      storeUnresolved &&
      !currLine.loadReference &&
      fullLineInfo.loadReferenceType === "maxlift" &&
      fullLineInfo.loadReference
    )
      (storeUnresolved.maxlifts = storeUnresolved.maxlifts || []).push([
        currLine,
        { loadReference: fullLineInfo.loadReference },
      ]);
    if (
      storeUnresolved &&
      !currLine.repsReference &&
      fullLineInfo.repsReferenceType === "maxlift" &&
      fullLineInfo.repsReference
    )
      (storeUnresolved.maxlifts = storeUnresolved.maxlifts || []).push([
        currLine,
        { repsReference: fullLineInfo.repsReference },
      ]);
  });

  // Build up complete program
  const outProgram = new Program({
    uid: flatProgram.uid,
    name: flatProgram.name,
    description: flatProgram.description,
    labels: flatProgram.labels,
    coach: users?.find(
      (user) =>
        user.role === UserRole.coach && user.uid === flatProgram.coachId,
    ) as CoachUser,
    athlete: users?.find(
      (user) =>
        user.role === UserRole.athlete && user.uid === flatProgram.athleteId,
    ) as AthleteUser,
    startedOn: flatProgram.startedOn,
    finishedOn: flatProgram.finishedOn,
    createdOn: flatProgram.createdOn,
    lastUpdated: flatProgram.lastUpdated,
    programExercises: programExercises,
  });
  if (storeUnresolved && !outProgram.coach && flatProgram.coachId)
    storeUnresolved.coach = [outProgram, flatProgram.coachId];
  if (storeUnresolved && !outProgram.athlete && flatProgram.athleteId)
    storeUnresolved.athlete = [outProgram, flatProgram.athleteId];
  return outProgram;
}
