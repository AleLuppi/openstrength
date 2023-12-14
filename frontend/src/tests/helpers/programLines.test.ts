import { ProgramLine } from "@/helpers/programs/program";

/****************/
/***** LOAD *****/
/****************/
export function testAllLoadCases() {
  // Test line translation
  const lineTest = new ProgramLine({
    setsBaseValue: "3",
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

      rpeBaseValue: "8",
      requestFeedbackText: true,
    }),
  });

  const names = [
    "requireLoad",
    "loadValue",
    "loadComputedValue",
    "loadSupposedValue",
    "loadRangeMin",
    "loadRangeMax",
    "loadOperation",
  ];

  console.log("-----------START---------------");
  console.log("-----------LOAD TEST 2---------------");
  lineTest.loadBaseValue = "100kg";
  const valueToTest = lineTest.loadBaseValue;
  const resultsExpected = [
    false,
    100,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ];

  testLoad(lineTest, valueToTest, names, resultsExpected);

  console.log("-----------LOAD TEST 3---------------");
  lineTest.loadBaseValue = "70%";
  const valueToTest2 = lineTest.loadBaseValue;
  lineTest.loadReference = new ProgramLine({
    loadBaseValue: "100kg",
    loadValue: 100,
  });
  const resultsExpected2 = [
    false,
    70,
    70,
    undefined,
    undefined,
    undefined,
    "*0.7",
  ];

  testLoad(lineTest, valueToTest2, names, resultsExpected2);

  console.log("-----------LOAD TEST 4---------------");
  lineTest.loadBaseValue = "?";
  const valueToTest3 = lineTest.loadBaseValue;
  const resultsExpected3 = [
    true,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ];

  testLoad(lineTest, valueToTest3, names, resultsExpected3);

  console.log("-----------LOAD TEST 5---------------");
  lineTest.loadBaseValue = "100kg/103kg";
  const valueToTest4 = lineTest.loadBaseValue;
  const resultsExpected4 = [
    true,
    undefined,
    undefined,
    101.5,
    100,
    103,
    undefined,
    undefined,
  ];

  testLoad(lineTest, valueToTest4, names, resultsExpected4);

  console.log("-----------LOAD TEST 6---------------");
  lineTest.loadBaseValue = "30%/50%";
  lineTest.loadReference = new ProgramLine({
    loadBaseValue: "120kg",
  });
  const valueToTest6 = lineTest.loadBaseValue;
  const resultsExpected6 = [true, undefined, undefined, 48, 36, 60, "*0.4"];

  testLoad(lineTest, valueToTest6, names, resultsExpected6);

  console.log("-----------LOAD TEST 7---------------");
  lineTest.loadBaseValue = "(100kg)";

  const valueToTest7 = lineTest.loadBaseValue;
  const resultsExpected7 = [
    true,
    undefined,
    undefined,
    100,
    undefined,
    undefined,
    undefined,
  ];

  testLoad(lineTest, valueToTest7, names, resultsExpected7);

  console.log("-----------LOAD TEST 8---------------");
  lineTest.loadBaseValue = "(50%)";
  lineTest.loadReference = new ProgramLine({
    loadBaseValue: "120kg",
    rpeBaseValue: "8",
    requestFeedbackText: true,
  });
  const valueToTest8 = lineTest.loadBaseValue;
  const resultsExpected8 = [
    true,
    undefined,
    undefined,
    60,
    undefined,
    undefined,
    undefined,
  ];

  testLoad(lineTest, valueToTest8, names, resultsExpected8);

  console.log("-----------LOAD TEST 9---------------");
  lineTest.loadBaseValue = "-10kg";
  lineTest.loadReference = new ProgramLine({
    loadBaseValue: "100kg",
    rpeBaseValue: "8",
    requestFeedbackText: true,
  });
  const valueToTest9 = lineTest.loadBaseValue;
  const resultsExpected9 = [
    false,
    90,
    90,
    undefined,
    undefined,
    undefined,
    "-10",
  ];

  testLoad(lineTest, valueToTest9, names, resultsExpected9);

  console.log("-----------LOAD TEST 10---------------");
  lineTest.loadBaseValue = "-20%";
  lineTest.loadReference = new ProgramLine({
    loadBaseValue: "100kg",
  });
  const valueToTest10 = lineTest.loadBaseValue;
  const resultsExpected10 = [
    false,
    80,
    80,
    undefined,
    undefined,
    undefined,
    "*0.8",
  ];

  testLoad(lineTest, valueToTest10, names, resultsExpected10);

  console.log("-----------LOAD TEST 11---------------");
  lineTest.loadBaseValue = "-10kg";
  lineTest.loadReference = new ProgramLine({
    loadBaseValue: "50kg/150kg",
  });
  const valueToTest11 = lineTest.loadBaseValue;
  const resultsExpected11 = [
    false,
    undefined,
    undefined,
    90,
    undefined,
    undefined,
    "-10",
  ];

  testLoad(lineTest, valueToTest11, names, resultsExpected11);

  console.log("-----------LOAD TEST 12---------------");
  lineTest.loadBaseValue = "-20%";
  lineTest.loadReference = new ProgramLine({
    loadBaseValue: "50kg/150kg",
  });
  const valueToTest12 = lineTest.loadBaseValue;
  const resultsExpected12 = [
    false,
    undefined,
    undefined,
    "80",
    undefined,
    undefined,
    "*0.8",
  ];

  testLoad(lineTest, valueToTest12, names, resultsExpected12);

  console.log("-----------LOAD TEST 13---------------");
  lineTest.loadBaseValue = "-10kg";
  lineTest.loadReference = new ProgramLine({
    loadValue: undefined,
    loadComputedValue: undefined,
    loadSupposedValue: undefined,
    rpeBaseValue: "8",
    requestFeedbackText: true,
  });
  const valueToTest13 = lineTest.loadBaseValue;
  const resultsExpected13 = [
    false,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "-10",
  ];

  testLoad(lineTest, valueToTest13, names, resultsExpected13);

  console.log("-----------LOAD TEST 14---------------");
  lineTest.loadBaseValue = "-20%";
  lineTest.loadReference = new ProgramLine({
    loadValue: undefined,
    loadComputedValue: undefined,
    loadSupposedValue: undefined,
    rpeBaseValue: "8",
    requestFeedbackText: true,
  });
  const valueToTest14 = lineTest.loadBaseValue;
  const resultsExpected14 = [
    false,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "*0.8",
  ];

  testLoad(lineTest, valueToTest14, names, resultsExpected14);

  console.log("-----------LOAD TEST 15---------------");
  lineTest.loadBaseValue = "W1-10kg";
  lineTest.loadReference = new ProgramLine({
    loadBaseValue: "50kg/150kg",
  });
  const valueToTest15 = lineTest.loadBaseValue;
  const resultsExpected15 = [
    false,
    undefined,
    undefined,
    90,
    undefined,
    undefined,
    "-10",
  ];

  testLoad(lineTest, valueToTest15, names, resultsExpected15);

  console.log("-----------LOAD TEST 16---------------");
  lineTest.loadBaseValue = "W1-20%";
  lineTest.loadReference = new ProgramLine({
    loadValue: undefined,
    loadComputedValue: undefined,
    loadSupposedValue: undefined,
    rpeBaseValue: "8",
    requestFeedbackText: true,
  });
  const valueToTest16 = lineTest.loadBaseValue;
  const resultsExpected16 = [
    false,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "*0.8",
  ];

  testLoad(lineTest, valueToTest16, names, resultsExpected16);

  console.log("-----------LOAD TEST 17---------------");
  lineTest.loadBaseValue = "W1-10%";
  lineTest.loadReference = new ProgramLine({
    loadBaseValue: "50kg/150kg",
  });
  const valueToTest17 = lineTest.loadBaseValue;
  const resultsExpected17 = [
    false,
    undefined,
    undefined,
    90,
    undefined,
    undefined,
    "*0.9",
  ];

  testLoad(lineTest, valueToTest17, names, resultsExpected17);
}

export function testLoad(
  lineTest: ProgramLine,
  valueToTest: boolean | number | string | undefined,
  names: string[],
  resultsExpected: Array<boolean | number | string | undefined>,
) {
  if (
    lineTest.requireLoad === resultsExpected[0] &&
    lineTest.loadValue === resultsExpected[1] &&
    lineTest.loadComputedValue === resultsExpected[2] &&
    lineTest.loadSupposedValue === resultsExpected[3] &&
    lineTest.loadRangeMin === resultsExpected[4] &&
    lineTest.loadRangeMax === resultsExpected[5] &&
    lineTest.loadOperation === resultsExpected[6]
  ) {
    console.log("All tests passed");
  } else {
    console.log("Start test with", valueToTest);
    console.log(
      names[0],
      lineTest.requireLoad,
      "   passed",
      lineTest.requireLoad === resultsExpected[0],
    );
    console.log("loadBaseValue", lineTest.loadBaseValue);
    console.log(
      names[1],
      lineTest.loadValue,
      "   passed",
      lineTest.loadValue === resultsExpected[1],
    );
    console.log(
      names[2],
      lineTest.loadComputedValue,
      "   passed",
      lineTest.loadComputedValue === resultsExpected[2],
    );
    console.log(
      names[3],
      lineTest.loadSupposedValue,
      "   passed",
      lineTest.loadSupposedValue === resultsExpected[3],
    );
    console.log(
      names[4],
      lineTest.loadRangeMin,
      "   passed",
      lineTest.loadRangeMin === resultsExpected[4],
    );
    console.log(
      names[5],
      lineTest.loadRangeMax,
      "   passed",
      lineTest.loadRangeMax === resultsExpected[5],
    );
    console.log(
      names[6],
      lineTest.loadOperation,
      "   passed",
      lineTest.loadOperation === resultsExpected[6],
    );
  }

  console.log("                ");
  console.log("                ");
  console.log("                ");
}


/****************/
/***** REPS *****/
/****************/

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

/****************/
/***** SETS *****/
/****************/

export function testAllSetsCases() {
  // Test line translation
  const lineTest = new ProgramLine({
    setsBaseValue: "3",
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
    "requireSets",
    "setsValue",
    "setsComputedValue",
    "setsSupposedValue",
    "setsRangeMin",
    "setsRangeMax",
    "setsOperation",
  ];

  console.log("-----------START---------------");
  console.log("-----------SETS TEST 2---------------");
  lineTest.setsBaseValue = "3";
  const valueToTest = lineTest.setsBaseValue;
  const resultsExpected = [
    false,
    3,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ];

  testSets(lineTest, valueToTest, names, resultsExpected);

  console.log("-----------SETS TEST 3---------------");
  lineTest.setsBaseValue = "(3)";
  const valueToTest2 = lineTest.setsBaseValue;
  const resultsExpected2 = [
    true,
    undefined,
    undefined,
    3,
    undefined,
    undefined,
    undefined,
  ];

  testSets(lineTest, valueToTest2, names, resultsExpected2);

  console.log("-----------SETS TEST 4---------------");
  lineTest.setsBaseValue = "3/4";
  const valueToTest3 = lineTest.setsBaseValue;
  const resultsExpected3 = [true, undefined, undefined, 3.5, 3, 4, undefined];

  testSets(lineTest, valueToTest3, names, resultsExpected3);

  console.log("-----------SETS TEST 5---------------");
  lineTest.setsBaseValue = "?";
  const valueToTest4 = lineTest.setsBaseValue;
  const resultsExpected4 = [
    true,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ];

  testSets(lineTest, valueToTest4, names, resultsExpected4);

  console.log("-----------SETS TEST 6---------------");
  lineTest.setsBaseValue = "-1";
  lineTest.setsReference = new ProgramLine({
    setsBaseValue: "3",
    repsBaseValue: "3",
    loadBaseValue: "50 kg",
    rpeBaseValue: "8",
    requestFeedbackText: true,
  });
  const valueToTest6 = lineTest.setsBaseValue;
  const resultsExpected6 = [false, 2, 2, undefined, undefined, undefined, "-1"];

  testSets(lineTest, valueToTest6, names, resultsExpected6);

  console.log("-----------SETS TEST 7---------------");
  lineTest.setsBaseValue = "-1";
  lineTest.setsReference = new ProgramLine({
    setsBaseValue: "(3)",
    loadBaseValue: "50 kg",
    rpeBaseValue: "8",
    requestFeedbackText: true,
  });
  const valueToTest7 = lineTest.setsBaseValue;
  const resultsExpected7 = [
    false,
    undefined,
    undefined,
    2,
    undefined,
    undefined,
    "-1",
  ];

  testSets(lineTest, valueToTest7, names, resultsExpected7);

  console.log("-----------SETS TEST 8---------------");
  lineTest.setsBaseValue = "-1";
  lineTest.setsReference = new ProgramLine({
    setsBaseValue: undefined,
    setsValue: undefined,
    setsComputedValue: undefined,
    setsSupposedValue: undefined,
    loadBaseValue: "50 kg",
    rpeBaseValue: "8",
    requestFeedbackText: true,
  });
  const valueToTest8 = lineTest.setsBaseValue;
  const resultsExpected8 = [
    false,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "-1",
  ];

  testSets(lineTest, valueToTest8, names, resultsExpected8);

  console.log("-----------SETS TEST 9---------------");
  lineTest.setsBaseValue = "W1-1";
  lineTest.setsReference = new ProgramLine({
    setsBaseValue: undefined,
    setsValue: undefined,
    setsComputedValue: undefined,
    setsSupposedValue: undefined,
    requestFeedbackText: true,
  });
  const valueToTest9 = lineTest.setsBaseValue;
  const resultsExpected9 = [
    false,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "-1",
  ];

  testSets(lineTest, valueToTest9, names, resultsExpected9);
}

export function testSets(
  lineTest: ProgramLine,
  valueToTest: boolean | number | string | undefined,
  names: string[],
  resultsExpected: Array<boolean | number | string | undefined>,
) {
  if (
    lineTest.requireSets === resultsExpected[0] &&
    lineTest.setsValue === resultsExpected[1] &&
    lineTest.setsComputedValue === resultsExpected[2] &&
    lineTest.setsSupposedValue === resultsExpected[3] &&
    lineTest.setsRangeMin === resultsExpected[4] &&
    lineTest.setsRangeMax === resultsExpected[5] &&
    lineTest.setsOperation === resultsExpected[6]
  ) {
    console.log("All tests passed");
  } else {
    console.log("Start test with", valueToTest);
    console.log(
      names[0],
      lineTest.requireSets,
      "   passed",
      lineTest.requireSets === resultsExpected[0],
    );
    console.log("setsBaseValue", lineTest.setsBaseValue);
    console.log(
      names[1],
      lineTest.setsValue,
      "   passed",
      lineTest.setsValue === resultsExpected[1],
    );
    console.log(
      names[2],
      lineTest.setsComputedValue,
      "   passed",
      lineTest.setsComputedValue === resultsExpected[2],
    );
    console.log(
      names[3],
      lineTest.setsSupposedValue,
      "   passed",
      lineTest.setsSupposedValue === resultsExpected[3],
    );
    console.log(
      names[4],
      lineTest.setsRangeMin,
      "   passed",
      lineTest.setsRangeMin === resultsExpected[4],
    );
    console.log(
      names[5],
      lineTest.setsRangeMax,
      "   passed",
      lineTest.setsRangeMax === resultsExpected[5],
    );
    console.log(
      names[6],
      lineTest.setsOperation,
      "   passed",
      lineTest.setsOperation === resultsExpected[6],
    );
  }

  console.log("                ");
  console.log("                ");
  console.log("                ");
}


/***************/
/***** RPE *****/
/***************/

export function testAllRpeCases() {
  // Test line translation
  const lineTest = new ProgramLine({
    setsBaseValue: "3",
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
    rpeReference: new ProgramLine({
      setsBaseValue: "8",
      repsBaseValue: "5",
      loadBaseValue: "50 kg",
      rpeBaseValue: "9",
      requestFeedbackText: true,
    }),
  });

  const names = [
    "requireRpe",
    "rpeValue",
    "rpeComputedValue",
    "rpeSupposedValue",
    "rpeRangeMin",
    "rpeRangeMax",
    "rpeOperation",
  ];

  console.log("-----------START---------------");
  console.log("-----------RPE TEST 2---------------");
  lineTest.rpeBaseValue = "8";
  const valueToTest = lineTest.rpeBaseValue;
  const resultsExpected = [
    false,
    8,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ];

  testRpe(lineTest, valueToTest, names, resultsExpected);

  console.log("-----------RPE TEST 3---------------");
  lineTest.rpeBaseValue = "(8)";
  const valueToTest2 = lineTest.rpeBaseValue;
  const resultsExpected2 = [
    true,
    undefined,
    undefined,
    8,
    undefined,
    undefined,
    undefined,
  ];

  testRpe(lineTest, valueToTest2, names, resultsExpected2);

  console.log("-----------RPE TEST 4---------------");
  lineTest.rpeBaseValue = "7/8";
  const valueToTest3 = lineTest.rpeBaseValue;
  const resultsExpected3 = [true, undefined, undefined, 7.5, 7, 8, undefined];

  testRpe(lineTest, valueToTest3, names, resultsExpected3);

  console.log("-----------RPE TEST 5---------------");
  lineTest.rpeBaseValue = "?";
  const valueToTest4 = lineTest.rpeBaseValue;
  const resultsExpected4 = [
    true,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ];

  testRpe(lineTest, valueToTest4, names, resultsExpected4);

  console.log("-----------RPE TEST 6---------------");
  lineTest.rpeBaseValue = "-1";
  lineTest.rpeReference = new ProgramLine({
    setsBaseValue: "3",
    repsBaseValue: "3",
    loadBaseValue: "50 kg",
    rpeBaseValue: "9",
    requestFeedbackText: true,
  });
  const valueToTest6 = lineTest.rpeBaseValue;
  const resultsExpected6 = [false, 8, 8, undefined, undefined, undefined, "-1"];

  testRpe(lineTest, valueToTest6, names, resultsExpected6);

  console.log("-----------RPE TEST 7---------------");
  lineTest.rpeBaseValue = "-1";
  lineTest.rpeReference = new ProgramLine({
    setsBaseValue: "3",
    loadBaseValue: "50 kg",
    rpeBaseValue: "(9)",
    requestFeedbackText: true,
  });
  const valueToTest7 = lineTest.rpeBaseValue;
  const resultsExpected7 = [
    false,
    undefined,
    undefined,
    8,
    undefined,
    undefined,
    "-1",
  ];

  testRpe(lineTest, valueToTest7, names, resultsExpected7);

  console.log("-----------RPE TEST 8---------------");
  lineTest.rpeBaseValue = "-1";
  lineTest.rpeReference = new ProgramLine({
    rpeBaseValue: undefined,
    rpeValue: undefined,
    rpeComputedValue: undefined,
    rpeSupposedValue: undefined,
    loadBaseValue: "50 kg",
    requestFeedbackText: true,
  });
  const valueToTest8 = lineTest.rpeBaseValue;
  const resultsExpected8 = [
    false,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "-1",
  ];

  testRpe(lineTest, valueToTest8, names, resultsExpected8);

  console.log("-----------RPE TEST 9---------------");
  lineTest.rpeBaseValue = "W1-1";
  lineTest.rpeReference = new ProgramLine({
    rpeBaseValue: undefined,
    rpeValue: undefined,
    rpeComputedValue: undefined,
    rpeSupposedValue: undefined,
    requestFeedbackText: true,
  });
  const valueToTest9 = lineTest.rpeBaseValue;
  const resultsExpected9 = [
    false,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "-1",
  ];

  testRpe(lineTest, valueToTest9, names, resultsExpected9);
}

export function testRpe(
  lineTest: ProgramLine,
  valueToTest: boolean | number | string | undefined,
  names: string[],
  resultsExpected: Array<boolean | number | string | undefined>,
) {
  if (
    lineTest.requireRpe === resultsExpected[0] &&
    lineTest.rpeValue === resultsExpected[1] &&
    lineTest.rpeComputedValue === resultsExpected[2] &&
    lineTest.rpeSupposedValue === resultsExpected[3] &&
    lineTest.rpeRangeMin === resultsExpected[4] &&
    lineTest.rpeRangeMax === resultsExpected[5] &&
    lineTest.rpeOperation === resultsExpected[6]
  ) {
    console.log("All tests passed");
  } else {
    console.log("Start test with", valueToTest);
    console.log(
      names[0],
      lineTest.requireRpe,
      "   passed",
      lineTest.requireRpe === resultsExpected[0],
    );
    console.log("rpeBaseValue", lineTest.rpeBaseValue);
    console.log(
      names[1],
      lineTest.rpeValue,
      "   passed",
      lineTest.rpeValue === resultsExpected[1],
    );
    console.log(
      names[2],
      lineTest.rpeComputedValue,
      "   passed",
      lineTest.rpeComputedValue === resultsExpected[2],
    );
    console.log(
      names[3],
      lineTest.rpeSupposedValue,
      "   passed",
      lineTest.rpeSupposedValue === resultsExpected[3],
    );
    console.log(
      names[4],
      lineTest.rpeRangeMin,
      "   passed",
      lineTest.rpeRangeMin === resultsExpected[4],
    );
    console.log(
      names[5],
      lineTest.rpeRangeMax,
      "   passed",
      lineTest.rpeRangeMax === resultsExpected[5],
    );
    console.log(
      names[6],
      lineTest.rpeOperation,
      "   passed",
      lineTest.rpeOperation === resultsExpected[6],
    );
  }

  console.log("                ");
  console.log("                ");
  console.log("                ");
}
