import { StackUtils } from "./lib/utils";
import { lookUp as lookUpFn,  adaptiveLookUp as adaptiveLookUpFn } from "./lib/look";
import { StackLine } from "./lib/stack";

export namespace nstack {
    export const lookUp = lookUpFn;
    export const adaptiveLookUp = adaptiveLookUpFn;
}

export { 
    StackUtils,
    StackLine
}

export default {
    lookUp: lookUpFn,
    adaptiveLookUp: adaptiveLookUpFn,
    StackLine,
    StackUtils
}