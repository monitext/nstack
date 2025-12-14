import { Coordinate } from './types/coordinate-collector';
import { Nullable } from "./types/type-utils";

export class CoordinateCollector implements Coordinate {

    rawCoord!: Nullable<string>
    line!: Nullable<number>
    col!: Nullable<number>

    constructor(raw: string) {
        Object.assign(this, CoordinateCollector.collect(raw));
    }

    public static collect(raw: string): Coordinate {
        const input = CoordinateCollector.extractCoordinateIn(raw);
        return CoordinateCollector.parseCoordinate(input);
    }

    static writeCoordinate(
        rawCoord: Nullable<string>,
        line: Nullable<number>,
        col: Nullable<number>): Coordinate {
        return {
            rawCoord, 
            line: Number.isNaN(line) ? null : line,
            col: Number.isNaN(line)  ? null : col
        };
    }

    private static parseCoordinate(input: Nullable<string>): Coordinate {
        if (!input) {
            return CoordinateCollector.writeCoordinate(null, null, null);
        }
        const [line, column] = input.split(":").filter(s => s.trim() != "").map(s => +s);
        return CoordinateCollector.writeCoordinate(
            input,
            line ?? null,
            column ?? (line ? 1 : null)
        )
    }

    private static coordinateExtractionRegExp = [
        /((\:\d+){2})/,
        /((\:\d+){1})/,
        /((\:\?){2})/
    ]

    private static tryCoordinateExtractionOn(str: string): Nullable<string> {
        for (const exp of CoordinateCollector.coordinateExtractionRegExp) {
            const result = str.match(exp);
            if (!result || result[0].trim() === "") continue;
            return result[0]
        }
        return null;
    }

    public static extractCoordinateIn(raw: string): Nullable<string> {
        const rawInput = raw.trim().split("").reverse();
        let buffer: string[] = [];

        for (let [index, char] of rawInput.entries()) {

            if (!/[\d\?]/.test(char)) {
                continue;
            }

            // clear the buffer;
            buffer = [char];
            while (/[\d\:\?]/.test(rawInput[++index])) {
                buffer.push(rawInput[index]);
            }

            const coord = CoordinateCollector.tryCoordinateExtractionOn(buffer.reverse().join(""));
            if (coord) {
                return coord;
            }
        }

        return null
    }
}