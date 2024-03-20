import i18n from "@/i18n";
import { matchNumberUnsignedInteger } from "@/helpers/regex";
import { arrayUniqueValues } from "@/helpers/array";

// ----- Functions related to Number -----

/**
 * Clamp number between two values.
 *
 * @param num number to clamp.
 * @param min minimum value.
 * @param max maximum value.
 */
export function numberClamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

/**
 * Round a number preserving a selected number of digits.
 *
 * @param num number to round.
 * @param ndigits how many digits to keep.
 * @returns rounded decimal number.
 */
export function numberRoundToDecimal(num: number, ndigits: number = 0) {
  const factor = Math.pow(10, Math.max(Math.floor(ndigits), 0));
  return Math.round(num * factor) / factor;
}

// ----- Functions related to Date -----

/**
 * Get date format according to locale.
 *
 * Date format should be something similar to "dd/mm/yyyy",
 * where "d" is day number, "m" is month number, "y" is year number.
 *
 * @param [opt="short"] localization date representation option.
 * @returns date format as string.
 */
export function dateGetLocaleFormat(
  opt: "short" | "middle" | "long" = "short",
): string {
  return dateToStringLocale("4567-10-23", opt)
    .replace(/[4-7]/g, "y")
    .replace(/[01]/g, "m")
    .replace(/[23]/g, "d");
}

/**
 * Get date mask according to locale.
 *
 * Date mask should be something similar to "##/##/####".
 *
 * @param [opt="short"] localization date representation option.
 * @returns date format as string.
 */
export function dateGetLocaleMask(
  opt: "short" | "middle" | "long" = "short",
): string {
  return dateGetLocaleFormat(opt).replace(/[ymd]/gi, "#");
}

/**
 * Translate a date into a string according to localization.
 *
 * @param date date that shall be confirmed.
 * @param [opt="short"] localization date representation option.
 * @returns date format as string.
 */
export function dateToStringLocale(
  date: Date | string | number,
  opt: "short" | "middle" | "long" = "short",
) {
  return i18n.global.d(date, opt);
}

/**
 * Parse a string into a date according to localization.
 *
 * @param strDate string representing the date to parse.
 * @param [opt="short"] localization date representation option.
 * @returns date format as string or null if invalid date.
 */
export function dateFromStringLocale(
  strDate: string,
  opt: "short" | "middle" | "long" = "short",
): Date | null {
  const format = dateGetLocaleFormat(opt);
  const dateInfo = [...format.toLowerCase()].reduce(
    (out: { y: string; m: string; d: string }, char, idx) => {
      if (["y", "m", "d"].includes(char))
        out[char as "y" | "m" | "d"] += strDate[idx];
      return out;
    },
    { y: "", m: "", d: "" },
  );
  const date = new Date(
    Number(dateInfo["y"]),
    Number(dateInfo["m"]) - 1,
    Number(dateInfo["d"]),
  );
  return date.getFullYear() ? date : null;
}

/**
 * Clean a date from its timezone offset.
 *
 * @param date if provided, date to clean from timezone, otherwise new date instance.
 * @returns the date cleaned from the user timezone.
 */
export function dateGetWithoutTimezone(date?: Date | string) {
  const dateToClean = date ? new Date(date) : new Date();
  return new Date(
    dateToClean.getTime() - dateToClean.getTimezoneOffset() * 60000,
  );
}

// ----- Functions related to String -----

/**
 * Capitalize the first letter of a string.
 *
 * @param str text that shall be capitalized.
 * @returns original text with first letter upper case.
 */
export function stringCapitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Given a string, return the text that comes immediately after.
 *
 * Example of next texts:
 *  - "a"       ->  "b"
 *  - "ZZ"      ->  "AAA"
 *  - "59"      ->  "60"
 *  - "text_43" -> "text_44"
 * Note that last character in string must be in set [a-zA-Z0-9].
 *
 * @param text input text.
 * @returns string occurring immediately after input text.
 */
export function stringGetNext(text: string) {
  // Check text pattern
  const matchedText = /(.*?)([a-zA-Z]+|[0-9]+)$/.exec(text);
  if (!matchedText) return undefined;

  // Keep only interesting part
  const [, textBeginning, textEnding] = matchedText;
  let replacedEnding = "";

  // Handle differently text ending with number or text
  if (matchNumberUnsignedInteger(textEnding))
    replacedEnding = String(Number(textEnding) + 1);
  else {
    // Convert the string to an array of characters
    const chars = textEnding.split("");
    if (chars.length <= 0) return undefined;

    // Get the last character and increment it
    let lastChar = chars.pop();
    const saveChars = [];

    // Check for special cases (like 'z' and 'Z')
    while (lastChar == "z" || lastChar == "Z") {
      saveChars.push(lastChar == "Z" ? "A" : "a");
      lastChar = chars.pop();
    }
    if (lastChar)
      saveChars.push(String.fromCharCode(lastChar.charCodeAt(0) + 1));
    else saveChars.push(saveChars.at(-1) == "Z" ? "A" : "a");

    // Convert the array back to a string
    replacedEnding = chars.join("") + saveChars.reverse().join("");
  }

  return textBeginning + replacedEnding;
}

/**
 * Get next free name from a list of names.
 *
 * @param names list of all available names.
 * @param startName optional name to start searching from.
 * @param fallback method to rename provided name if it ends with non-sortable special characters.
 * @returns first free name.
 */
export function stringGetNextFromList(
  names: string[],
  startName?: string,
  fallback: (name: string) => string = (name) => `${name}1`,
) {
  // Set starting position
  if (startName == undefined)
    startName = arrayUniqueValues(names)[0] ?? fallback("");

  // Get free name
  while (names.includes(startName)) {
    startName = stringGetNext(startName) || fallback(startName);
  }
  return startName;
}
