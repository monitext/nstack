export class StackLine {
    
    constructor(private line: string) {
         const parsed = StackLine.parse(line);
         Object.assign(this, parsed)
    }

    public static parse(line: string) {
        
        const base = line.trim().split(" ");

        if(base[0].trim() === "at") {
            base.shift();
        }

        const fileInfo = this.extractFilePath(base.pop() as string);
        const method = base.length != 0 ? base.join(" ") : undefined

        return {
            method,
            ...fileInfo
        } 
    }

    private static extractFilePath(path: string) {
         const curr = this.normalize(path)
         const coor = this.extractCoordonnate(curr)
         const file = curr.replace(/:(\d+):(\d+)$|:(\d+)$/, "");
         return {
            file,
            ...coor
         }
    }

    private static extractCoordonnate(path: string) {
        // :line:column
        const m1 = path.match(/:(\d+):(\d+)$/);
        if (m1)
            return { line: +m1[1], column: +m1[2] };

        // :line
        const m2 = path.match(/:(\d+)$/);
        if (m2)
            return { line: +m2[1], column: 0 };

        return { line: undefined, column: undefined };
    }


    private static normalize(path: string) {
        return path
            .trim()
            .replace(/(^\()|(\)$)/g, "")
            .replace(/^file:\/\//, "");
    }
}

