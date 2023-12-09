import { ProgramLine } from "./program";

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
    80,
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
