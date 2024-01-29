import { describe, expect, test } from "vitest";
import { stringGetNext, stringGetNextFromList } from "../scalar";

describe("Test @/helpers/scalar", () => {
  /*******************/
  /***** STRINGS *****/
  /*******************/

  describe("STRING methods", () => {
    /**
     * stringGetNext
     */
    describe("'stringGetNext' function", () => {
      test("basic string 'abc'", () => {
        expect(stringGetNext("abc")).toBe("abd");
      });

      test("basic string 'aBz'", () => {
        expect(stringGetNext("aBz")).toBe("aCa");
      });

      test("basic string 'abZ'", () => {
        expect(stringGetNext("abZ")).toBe("acA");
      });

      test("basic string 'zZzZ'", () => {
        expect(stringGetNext("zZzZ")).toBe("aaAaA");
      });

      test("number string '54'", () => {
        expect(stringGetNext("54")).toBe("55");
      });

      test("number string '39'", () => {
        expect(stringGetNext("39")).toBe("40");
      });

      test("number string '99999'", () => {
        expect(stringGetNext("99999")).toBe("100000");
      });

      test("uncommon string '1, -.3'", () => {
        expect(stringGetNext("1, -.3")).toBe("1, -.4");
      });
    });

    /**
     * stringGetNextFromList
     */
    describe("'stringGetNextFromList' function", () => {
      test("basic string 'abc' with empty list", () => {
        expect(stringGetNextFromList([], "abc")).toBe("abc");
      });

      test("basic string 'abc' with single element list", () => {
        expect(stringGetNextFromList(["abc"], "abc")).toBe("abd");
      });

      test("basic string 'abc' with double element list", () => {
        expect(stringGetNextFromList(["abc", "abd"], "abc")).toBe("abe");
      });

      test("basic string 'aBz' with empty list", () => {
        expect(stringGetNextFromList([], "aBz")).toBe("aBz");
      });

      test("basic string 'aBz' with list of similar elements", () => {
        expect(stringGetNextFromList(["abz", "ABZ", "AbZ", "ABz"], "aBz")).toBe(
          "aBz",
        );
      });

      test("basic string 'aBz' with list of similar elements including 'aBz'", () => {
        expect(
          stringGetNextFromList(["abz", "ABZ", "AbZ", "ABz", "aBz"], "aBz"),
        ).toBe("aCa");
      });

      test("empty string '' with empty list", () => {
        expect(stringGetNextFromList([], "")).toBe("");
      });

      test("empty string '' with non-empty list", () => {
        expect(stringGetNextFromList(["a", "b", "c"], "")).toBe("");
      });

      test("basic string 'zZzZ' with empty list", () => {
        expect(stringGetNextFromList([], "zZzZ")).toBe("zZzZ");
      });

      test("basic string 'zZzZ' with single element list", () => {
        expect(stringGetNextFromList(["zZzZ"], "zZzZ")).toBe("aaAaA");
      });

      test("number string '99999' with uncorrelated list", () => {
        expect(stringGetNextFromList(["100000"], "99999")).toBe("99999");
      });

      test("number string '99999' with short list", () => {
        expect(stringGetNextFromList(["99999", "100000"], "99999")).toBe(
          "100001",
        );
      });

      test("uncommon string '1, -.3' with long list", () => {
        expect(
          stringGetNextFromList(
            [
              "1, -.3",
              "1, -.4",
              "1, -.5",
              "1, -.6",
              "1, -.7",
              "1, -.8",
              "1, -.9",
              "1, -.10",
            ],
            "1, -.3",
          ),
        ).toBe("1, -.11");
      });
    });
  });
});
