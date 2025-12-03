import { StackUtils } from "../src/lib/utils";

function mock (){
    const err = new Error();
    const stack = StackUtils.processError(err)
    const result = StackUtils.findMethodInStack({
        method: "mock",
        offset: 1, // where the call happened
        stack: stack as any
    })

    console.log(result)
}

mock()