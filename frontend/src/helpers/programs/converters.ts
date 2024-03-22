import {
  Program,
  ProgramLine,
  ProgramFrozenView,
  ProgramFrozenLine,
  ProgramCompactView,
} from 'src/helpers/programs/program';
import { orderProgramExercises } from 'src/helpers/programs/linesManagement';
import { MaxLift } from 'src/helpers/maxlifts/maxlift';
import { uid } from 'quasar';

/**
 * Get the displayable name of a selected reference.
 *
 * @param reference reference whose name shall be retrieved.
 */
function getReferenceDisplayName(reference: ProgramLine | MaxLift | undefined) {
  // Handle unknown case
  if (!reference) return undefined;

  // Handle program line or max lift
  if (reference instanceof ProgramLine)
    return (
      'W' +
      (reference.programExercise?.scheduleWeek
        ?.toString()
        .slice(undefined, 2) ?? '-') +
      'D' +
      (reference.programExercise?.scheduleDay?.toString().slice(undefined, 2) ??
        '-') +
      'L' +
      (reference.lineOrder != undefined ? reference.lineOrder + 1 : '-')
    );
  else return reference.type ?? ''; // TODO i18n
}

/**
 * Converts a program line to a schema string (load reps x sets @rpe).
 *
 * @param line program line that shall be converted.
 * @returns schema as a string.
 */
export function convertLineToSchema(line: ProgramLine): string {
  const referencedLoadText = line.loadReference
    ? getReferenceDisplayName(line.loadReference)
    : undefined;
  const referencedRepsText = line.repsReference
    ? getReferenceDisplayName(line.repsReference)
    : undefined;
  const referencedSetsText = line.setsReference
    ? getReferenceDisplayName(line.setsReference)
    : undefined;
  const referencedRpeText = line.rpeReference
    ? getReferenceDisplayName(line.rpeReference)
    : undefined;

  // Determine schema for load
  let schemaLoad = '';
  if (
    referencedLoadText != undefined &&
    referencedLoadText != '1RM' &&
    line.loadReference instanceof MaxLift
  ) {
    schemaLoad = line.loadBaseValue
      ? line.loadBaseValue + ' (' + referencedLoadText + ')'
      : '';
  } else if (
    referencedLoadText != undefined &&
    line.loadReference instanceof ProgramLine
  ) {
    schemaLoad = line.loadBaseValue
      ? referencedLoadText + ' ' + line.loadBaseValue
      : '';
  } else {
    schemaLoad = line.loadBaseValue ? line.loadBaseValue : '';
  }

  // Determine schema for reps
  let schemaReps = '';
  if (referencedRepsText != undefined) {
    schemaReps = line.repsBaseValue
      ? referencedRepsText + line.repsBaseValue
      : '';
  } else {
    schemaReps = line.repsBaseValue ? line.repsBaseValue : '';
  }

  // Determine schema for sets
  let schemaSets = '';
  if (referencedSetsText != undefined) {
    schemaSets = line.setsBaseValue
      ? 'x' + referencedSetsText + line.setsBaseValue + 's'
      : '';
  } else {
    schemaSets = line.setsBaseValue ? 'x' + line.setsBaseValue + 's' : '';
  }

  // Determine schema for rpe
  let schemaRpe = '';
  if (referencedRpeText != undefined) {
    schemaRpe = line.rpeBaseValue
      ? '@' + referencedRpeText + line.rpeBaseValue
      : '';
  } else {
    schemaRpe = line.rpeBaseValue ? '@' + line.rpeBaseValue : '';
  }

  return schemaLoad + ' ' + schemaReps + schemaSets + ' ' + schemaRpe;
}

/**
 * TODO: check logic and decide when to ask for load, reps, sets, rpe insertion (to be done in a second version)
 * Method to convert between different program lines
 * @param line
 * @returns
 */
export function convertProgramLineToFrozenLine(
  line: ProgramLine
): ProgramFrozenLine {
  const frozenLine: ProgramFrozenLine = {
    load: line.loadBaseValue?.toString(),
    askLoad: false,
    reps: line.repsBaseValue?.toString(),
    askReps: false,
    sets: line.setsBaseValue?.toString(),
    askSets: false,
    rpe: line.rpeBaseValue?.toString(),
    askRpe: false,
  };

  return frozenLine;
}

/**
 * Converts program to an array of flat days.
 *
 * @param program program that shall be converted.
 * @returns list of flat days with relevant exercise info.
 */
export function convertProgramToDayBlocks(
  program: Program
): ProgramFrozenView['weekdays'] {
  // Check input
  if (!program.programExercises) return [];

  // Initialize interesting values
  const programExercises = orderProgramExercises(
    program.programExercises,
    (week, day, order) => [week, day, order].join('.')
  );
  const out: ProgramFrozenView['weekdays'] = [];

  Object.entries(programExercises).forEach(([key, programExercise]) => {
    // Retrieve week and day values
    const [week, day] = key.split('.');

    // Get interesting exercise info
    const exerciseInfo: ProgramFrozenView['weekdays'][number]['exercises'][number] =
      {
        uid: programExercise.uid ?? uid(),
        exerciseName: programExercise?.exercise?.name ?? '',
        variantName: programExercise?.exerciseVariant?.name ?? '',
        note: programExercise?.exerciseNote,
        lines: programExercise.lines?.map(
          (line) => convertProgramLineToFrozenLine(line) ?? []
        ),
        schema:
          programExercise.lines?.map((line) => convertLineToSchema(line)) ?? [],
        schemaNote: programExercise.lines?.map((line) => line.note ?? '') ?? [],
        textFeedback:
          programExercise.lines?.map(
            (line) => line.requestFeedbackText ?? false
          ) ?? [],
        videoFeedback:
          programExercise.lines?.map(
            (line) => line.requestFeedbackVideo ?? false
          ) ?? [],
      };

    // Store exercise info
    if (out.at(-1)?.weekName === week && out.at(-1)?.dayName === day)
      out.at(-1)!.exercises.push(exerciseInfo);
    else
      out.push({
        weekName: week,
        dayName: day,
        exercises: [exerciseInfo],
      });
  });

  return out;
}

/**
 * Converts program to an array of daily exercises.
 *
 * @param program program that shall be converted.
 * @returns list of program days with relevant exercise info.
 */
export function convertProgramToCompactView(
  program: Program
): ProgramCompactView {
  const compactProgram: ProgramCompactView = [];

  if (!program.programExercises) return compactProgram;

  const orderedProgramExercises = orderProgramExercises(
    program.programExercises,
    (week, day, order) => [week, day, order].join('.')
  );

  Object.entries(orderedProgramExercises).forEach(([key, programExercise]) => {
    // Retrieve week, day, and exercise names
    const [week, day, order] = key.split('.');
    const exerciseFullName =
      (programExercise?.exercise?.name ?? '') +
      (programExercise?.exerciseVariant?.name
        ? ' - ' + programExercise?.exerciseVariant?.name
        : '');

    // Optionally add a new day to list
    if (
      !(
        compactProgram.at(-1)?.week === week &&
        compactProgram.at(-1)?.day === day
      )
    )
      compactProgram.push({
        week: week,
        day: day,
        exercises: [],
      });

    // Store exercise and its related schemas
    compactProgram.at(-1)!.exercises.push({
      exercise: exerciseFullName,
      order: order,
      schemas:
        programExercise.lines?.map((line) => convertLineToSchema(line)) ?? [],
    });
  });

  return compactProgram;
}
