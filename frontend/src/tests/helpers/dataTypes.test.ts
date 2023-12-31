import { expect, test } from "vitest";
import { stringGetNext } from "@/helpers/scalar";

/*******************/
/***** STRINGS *****/
/*******************/

test("'stringGetNext' with basic string 'abc'", () => {
  expect(stringGetNext("abc")).toBe("abd");
});

test("'stringGetNext' with basic string 'aBz'", () => {
  expect(stringGetNext("aBz")).toBe("aCa");
});

test("'stringGetNext' with basic string 'abZ'", () => {
  expect(stringGetNext("abZ")).toBe("acA");
});

test("'stringGetNext' with basic string 'zZzZ'", () => {
  expect(stringGetNext("zZzZ")).toBe("aaAaA");
});

test("'stringGetNext' with number string '54'", () => {
  expect(stringGetNext("54")).toBe("55");
});

test("'stringGetNext' with number string '39'", () => {
  expect(stringGetNext("39")).toBe("40");
});

test("'stringGetNext' with number string '99999'", () => {
  expect(stringGetNext("99999")).toBe("100000");
});

test("'stringGetNext' with uncommon string '1, -.3'", () => {
  expect(stringGetNext("1, -.3")).toBe("1, -.4");
});
