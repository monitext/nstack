import { StackFrame } from "../src-alt/stack"; // adjust path
import { STACK_MOCKS, StackMock } from "./stack.mock";
import { STACK_STRESS } from "./stact-stress-test.mock";

function run(STACK_MOCKS: StackMock[]) {
    let ok = 0;
    let fail = 0;

    for (const mock of STACK_MOCKS) {
        const result = StackFrame.backwardPathExtraction(mock.raw);

        const pass =
            result?.pathString === mock.expected.path &&
            result?.coordString === mock.expected.coord;

        if (pass) {
            ok++;
            console.log("✔", mock.name);
        } else {
            fail++;
            console.error("\n❌ " + mock.name);
            console.error("  raw:      ", mock.raw);
            console.error("  expected: ", mock.expected);
            console.error("  got:      ", result);
        }
    }

    console.log("\n======== RESULT ========");
    console.log("Passed:", ok);
    console.log("Failed:", fail);
}

run(STACK_MOCKS);
run(STACK_STRESS)