import { Coordinate } from "./coordinate-collector";
import { Nullable } from "./type-utils";

export interface StackFrame extends Coordinate {
    rawInput: string,
    filePath: Nullable<string>,
    method: Nullable<string>
}


export interface IntermediateStackFrame extends Coordinate {
    filePath: Nullable<string>
}