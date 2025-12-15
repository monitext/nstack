import { describe, it, expect } from "vitest";
import { CoordinateDescriptor } from "../src-alt/lib/coordinate-descriptor";
import { Coordinate } from "../src-alt/types/coordinate-descriptor";

describe(CoordinateDescriptor, ()=>{
    const paths = [
        "::23:14 ramdom 1, 2 - 3 4 :: noise",
        "null test: some 3 5 7:: 9 bullshit",
        "line only (:4:?) path",
        "ts line typeof (:?:?) crap",
        "long line :::123123 some noise",
        "long line+col :123123:321321 some noise @"
    ]

    it("should properly extract :line:col from str", ()=>{
        const coord = new CoordinateDescriptor(paths[0]);
        expect(coord).toMatchObject<Coordinate>({
            rawCoord: ":23:14",
            line: 23,
            col: 14
        })
    })

    it("should properly return null on when no valid coord exist", ()=>{
        const coord = new CoordinateDescriptor(paths[1]);
        expect(coord).toMatchObject<Coordinate>({
            rawCoord: null,
            line: null,
            col: null
        })
    })

    it("should properly handle :line only case", ()=>{
        const coord = new CoordinateDescriptor(paths[2]);
        expect(coord).toMatchObject<Coordinate>({
            rawCoord: ":4",
            line: 4,
            col: 1
        })
    })

    it("should properly handle edge case :?:?", ()=>{
        const coord = new CoordinateDescriptor(paths[3]);
        expect(coord).toMatchObject<Coordinate>({
            rawCoord: ":?:?",
            line: null,
            col: null
        });
    })

    it("should properly handle long :line case", ()=>{
        const coord = new CoordinateDescriptor(paths[4]);
        expect(coord).toMatchObject<Coordinate>({
            rawCoord: ":123123",
            line: 123123,
            col: 1
        });
    })

    it("should properly handle long :line:col case", ()=>{
        const coord = new CoordinateDescriptor(paths[5]);
        expect(coord).toMatchObject<Coordinate>({
            rawCoord: ":123123:321321",
            line: 123123,
            col: 321321
        });
    })
})
