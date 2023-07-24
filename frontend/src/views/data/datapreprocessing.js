import dataInput from './athleteExample.json';

function parseJSON(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
}

function computeVolume(exercise) {
  const reps = parseJSON(exercise.reps);
  const load = parseJSON(exercise.load);

  const volume = reps.map((rep, index) => rep * load[index]);
  return volume;
}

// Loop through the assignedFitness dataInput and compute the volume for each exercise
const assignedFitness = dataInput.assignedFitness;
const data = [];

assignedFitness.forEach((entry) => {
  const workoutEntries = entry.mesocycleEntry.flatMap((mesocycle) => mesocycle.weekEntry.flatMap((week) => week.workoutEntry));
  
  workoutEntries.forEach((workout) => {
    const exercises = workout.exercise;
    exercises.forEach((exercise) => {
      const volume = computeVolume(exercise);
      data.push({ name: exercise.name, volume });
    });
  });
});

export default data;
