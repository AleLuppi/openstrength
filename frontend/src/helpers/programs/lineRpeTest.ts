import { ProgramLine } from "./program";

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
