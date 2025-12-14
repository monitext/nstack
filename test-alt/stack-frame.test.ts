import { describe, expect, it } from "vitest";
import { StackFrameDescriptor } from "../src-alt/stack-frame";
import { StackFrame } from "../src-alt/types/stack-frame";

describe(StackFrameDescriptor, ()=>{
    const sample = [     
        "at Object.<anonymous> (/Users/Cal l  Hs/Projects/My App/index.js:10:15) at some noise test/787/:1:?",
       
        "at /usr/  local/  lib/node_modules/  test-module/lib/index.js:5:3",

        "at async doSomething (C:/Users/Call Hs/Projects/My App/src/main.js:45:9)",
        "at Module.runMain (file:///home/user/My Documents/project/server.js:22:5)",
        "at async fetchData (/C:/Users/Public/Downloads/Node Test/utils.js:12:18)",
    ]

    it("should properly extract paths not matter the noise", ()=>{
        const frame = new StackFrameDescriptor(sample[0]);
        expect(frame).toMatchObject<StackFrame>({
            rawInput: sample[0],
            method: "Object.<anonymous>",
            filePath: "/Users/Cal l  Hs/Projects/My App/index.js",
            rawCoord: ":10:15",
            line: 10,
            col: 15
        })
    })
})