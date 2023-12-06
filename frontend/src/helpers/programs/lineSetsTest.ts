import { ProgramLine } from "./program";

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
