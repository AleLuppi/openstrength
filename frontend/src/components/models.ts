/***********************/
/***** TABLE SHEET *****/
/***********************/

export interface TableSheetCell {
  row: number;
  col: number;
  values: (string | number | boolean)[];
}

export interface TableSheetCellConfig {
  // range of rows and columns it affects
  rowFrom?: number | undefined;
  rowTo?: number | undefined;
  colFrom?: number | undefined;
  colTo?: number | undefined;

  // row and column span for the cell
  rowSpan?: number; // default: 1
  colSpan?: number; // default: 1

  // horizontal and vertical alignment
  justify?: "left" | "center" | "right"; // default: "left"
  align?: "top" | "middle" | "bottom"; // default: "middle"

  // supporting content
  placeholder?: string; // TODO
  stringPrefix?: string; // TODO
  stringSuffix?: string; // TODO

  // validation rules
  validation?: (val: string | number) => boolean | string; // TODO

  // allow selection of values from a list, optionally allowing outsiders
  selectionList?: []; // TODO
  selectionAllowNew?: boolean; // TODO default: false

  // whether to allow value editing directly inside the cell
  editInline?: boolean; // default: true

  // name of the slot to display when cell shall be edited
  editSlot?: string;

  // highlight the cell
  highlight?: boolean; // TODO default: false

  // display values inside chips
  useChip?: boolean | "single" | "multiple"; // default: false

  // cell dimension
  width?: number | string; // default: 100
  height?: number | string; // default: 30

  // optional styles
  class?: string;
  style?: string;
}
