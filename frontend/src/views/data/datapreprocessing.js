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

  if (reps.length !== load.length) {
    const errorMessage = "The lengths of reps and load arrays must be equal! Check your database.";
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  let volume = 0;
  for (let i = 0; i < reps.length; i++) {
    volume += reps[i] * load[i];
  }

  return volume;
}


// Loop through the assignedFitness dataInput and compute the volume for each exercise
const assignedFitness = dataInput.assignedFitness;
const data = {
  datasets: [],
  labels: [],
};

assignedFitness.forEach((entry) => {
  const workoutEntries = entry.mesocycleEntry.flatMap((mesocycle) => mesocycle.weekEntry.flatMap((week) => week.workoutEntry));
  const weekNameEntry = entry.mesocycleEntry.flatMap((mesocycle) => mesocycle.weekEntry.flatMap((week) => week.weekName));

  workoutEntries.forEach((workout) => {
    const exercises = workout.exercise;
    const volumeData = exercises.map((exercise) => computeVolume(exercise));
    
    data.datasets.push({
      label: exercises.name,
      data: volumeData,
    }
    );
  });

  if (workoutEntries.length > 0) {
    data.labels.push(...weekNameEntry); //Spread the elements of weekNameEntry into the labels array
  }

});

console.log(data);
export default data;
