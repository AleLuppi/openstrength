import { ProgramLine } from "@/helpers/programs/program";

/**
 * Sort program lines according to week, day, order.
 *
 * @param lines program lines to sort.
 * @returns sorted program lines.
 */
export function sortLines(lines: ProgramLine[]) {
  return [...lines].sort((lineA, lineB) => {
    // Prepare variables
    const weekA = lineA.scheduleWeek ?? lineB.scheduleWeek ?? "undefined";
    const weekB = lineB.scheduleWeek ?? weekA;
    const dayA = lineA.scheduleDay ?? lineB.scheduleDay ?? "undefined";
    const dayB = lineB.scheduleDay ?? dayA;
    const orderA = lineA.scheduleOrder ?? lineB.scheduleOrder ?? "undefined";
    const orderB = lineB.scheduleOrder ?? orderA;

    // Sort lines by week, day, order, with precedence
    if (weekA < weekB) return -1;
    else if (weekA > weekB) return 1;
    else if (dayA < dayB) return -1;
    else if (dayA > dayB) return 1;
    else if (orderA < orderB) return -1;
    else if (orderA > orderB) return 1;

    // Equal sorting values
    return 0;
  });
}

/**
 * Get a list of ordered program lines for each day, sorted by week and day number.
 *
 * @param lines program lines to order.
 * @param getName method providing key name given week and day names.
 * @returns nested object having week and day as keys, and ordered list of lines as values.
 */
export function orderLines(
  lines: ProgramLine[],
  getName: Function = (week: string | number, day: string | number) =>
    `${week}${sep}${day}`,
  sep: string = ".",
) {
  // Prepare in and out variables
  const sortedLines = sortLines(lines);
  const outLines: {
    [key: string]: ProgramLine[];
  } = {};

  console.log(sortedLines);

  // Order lines
  sortedLines.forEach((line) => {
    const week = line.scheduleWeek ?? -1;
    const day = line.scheduleDay ?? -1;
    const keyName = getName(week, day);
    if (!outLines[keyName]) outLines[keyName] = [];
    outLines[keyName].push(line);
  });

  return outLines;
}
