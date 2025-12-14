import { Nullable } from "./type-utils";

export interface Coordinate {
    rawCoord: Nullable<string>,
    line: Nullable<number>,
    col: Nullable<number>
}