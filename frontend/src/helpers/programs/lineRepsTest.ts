import { ProgramLine } from "./program";

export function testAllRepCases() {
  // Test line translation
  const lineTest = new ProgramLine({
    setsBaseValue: "W1-3",
    repsBaseValue: "5/8",
    loadBaseValue: "50kg/70kg",
    rpeBaseValue: "5",
    requestFeedbackText: true,
    setsReference: new ProgramLine({
      setsBaseValue: "8",
      repsBaseValue: "5",
      loadBaseValue: "50 kg",
      rpeBaseValue: "8",
      requestFeedbackText: true,
    }),
    repsReference: new ProgramLine({
      setsBaseValue: "8",
      repsBaseValue: "5",
      loadBaseValue: "50 kg",
      rpeBaseValue: "8",
      requestFeedbackText: true,
    }),
    loadReference: new ProgramLine({
      setsBaseValue: "8",
      repsBaseValue: "5",
      loadBaseValue: "50 kg",
      rpeBaseValue: "8",
      requestFeedbackText: true,
    }),
  });

  const names = [
    "requireReps",
    "repsValue",
    "repsComputedValue",
    "repsSupposedValue",
    "repsRangeMin",
    "repsRangeMax",
    "repsOperation",
  ];

  console.log("-----------START---------------");
  console.log("-----------REPS TEST 2---------------");
  lineTest.repsBaseValue = "3";
  const valueToTest = lineTest.repsBaseValue;
  const resultsExpected = [
    false,
    3,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ];

  testReps(lineTest, valueToTest, names, resultsExpected);

  console.log("-----------REPS TEST 3---------------");
  lineTest.repsBaseValue = "(3)";
  const valueToTest2 = lineTest.repsBaseValue;
  const resultsExpected2 = [
    true,
    undefined,
    undefined,
    3,
    undefined,
    undefined,
    undefined,
  ];

  testReps(lineTest, valueToTest2, names, resultsExpected2);

  console.log("-----------REPS TEST 4---------------");
  lineTest.repsBaseValue = "3/4";
  const valueToTest3 = lineTest.repsBaseValue;
  const resultsExpected3 = [true, undefined, undefined, 3.5, 3, 4, undefined];

  testReps(lineTest, valueToTest3, names, resultsExpected3);

  console.log("-----------REPS TEST 5---------------");
  lineTest.repsBaseValue = "?";
  const valueToTest4 = lineTest.repsBaseValue;
  const resultsExpected4 = [
    true,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ];

  testReps(lineTest, valueToTest4, names, resultsExpected4);

  console.log("-----------REPS TEST 6---------------");
  lineTest.repsBaseValue = "MAX-1";
  lineTest.repsReference = new ProgramLine({
    setsBaseValue: "8",
    repsBaseValue: "20",
    loadBaseValue: "50 kg",
    rpeBaseValue: "8",
    requestFeedbackText: true,
  });
  const valueToTest5 = lineTest.repsBaseValue;
  const resultsExpected5 = [
    false,
    19,
    19,
    undefined,
    undefined,
    undefined,
    "-1",
  ];

  testReps(lineTest, valueToTest5, names, resultsExpected5);

  console.log("-----------REPS TEST 7---------------");
  lineTest.repsBaseValue = "-1";
  lineTest.repsReference = new ProgramLine({
    setsBaseValue: "8",
    repsBaseValue: "3",
    loadBaseValue: "50 kg",
    rpeBaseValue: "8",
    requestFeedbackText: true,
  });
  const valueToTest6 = lineTest.repsBaseValue;
  const resultsExpected6 = [false, 2, 2, undefined, undefined, undefined, "-1"];

  testReps(lineTest, valueToTest6, names, resultsExpected6);

  console.log("-----------REPS TEST 8---------------");
  lineTest.repsBaseValue = "-1";
  lineTest.repsReference = new ProgramLine({
    repsBaseValue: "(3)",
    loadBaseValue: "50 kg",
    rpeBaseValue: "8",
    requestFeedbackText: true,
  });
  const valueToTest7 = lineTest.repsBaseValue;
  const resultsExpected7 = [
    false,
    undefined,
    undefined,
    2,
    undefined,
    undefined,
    "-1",
  ];

  testReps(lineTest, valueToTest7, names, resultsExpected7);

  console.log("-----------REPS TEST 9---------------");
  lineTest.repsBaseValue = "-1";
  lineTest.repsReference = new ProgramLine({
    setsBaseValue: "8",
    repsBaseValue: undefined,
    repsValue: undefined,
    repsComputedValue: undefined,
    repsSupposedValue: undefined,
    loadBaseValue: "50 kg",
    rpeBaseValue: "8",
    requestFeedbackText: true,
  });
  const valueToTest8 = lineTest.repsBaseValue;
  const resultsExpected8 = [
    false,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "-1",
  ];

  testReps(lineTest, valueToTest8, names, resultsExpected8);

  console.log("-----------REPS TEST 10---------------");
  lineTest.repsBaseValue = "W1-1";
  lineTest.repsReference = new ProgramLine({
    repsBaseValue: undefined,
    repsValue: undefined,
    repsComputedValue: undefined,
    repsSupposedValue: undefined,
    requestFeedbackText: true,
  });
  const valueToTest9 = lineTest.repsBaseValue;
  const resultsExpected9 = [
    false,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "-1",
  ];

  testReps(lineTest, valueToTest9, names, resultsExpected9);
}

export function testReps(
  lineTest: ProgramLine,
  valueToTest: boolean | number | string | undefined,
  names: string[],
  resultsExpected: Array<boolean | number | string | undefined>,
) {
  if (
    lineTest.requireReps === resultsExpected[0] &&
    lineTest.repsValue === resultsExpected[1] &&
    lineTest.repsComputedValue === resultsExpected[2] &&
    lineTest.repsSupposedValue === resultsExpected[3] &&
    lineTest.repsRangeMin === resultsExpected[4] &&
    lineTest.repsRangeMax === resultsExpected[5] &&
    lineTest.repsOperation === resultsExpected[6]
  ) {
    console.log("All tests passed");
  } else {
    console.log("Start test with", valueToTest);
    console.log(
      names[0],
      lineTest.requireReps,
      "   passed",
      lineTest.requireReps === resultsExpected[0],
    );
    console.log("repsBaseValue", lineTest.repsBaseValue);
    console.log(
      names[1],
      lineTest.repsValue,
      "   passed",
      lineTest.repsValue === resultsExpected[1],
    );
    console.log(
      names[2],
      lineTest.repsComputedValue,
      "   passed",
      lineTest.repsComputedValue === resultsExpected[2],
    );
    console.log(
      names[3],
      lineTest.repsSupposedValue,
      "   passed",
      lineTest.repsSupposedValue === resultsExpected[3],
    );
    console.log(
      names[4],
      lineTest.repsRangeMin,
      "   passed",
      lineTest.repsRangeMin === resultsExpected[4],
    );
    console.log(
      names[5],
      lineTest.repsRangeMax,
      "   passed",
      lineTest.repsRangeMax === resultsExpected[5],
    );
    console.log(
      names[6],
      lineTest.repsOperation,
      "   passed",
      lineTest.repsOperation === resultsExpected[6],
    );
  }

  console.log("                ");
  console.log("                ");
  console.log("                ");
}
