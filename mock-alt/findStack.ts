import { findStackFrame } from "../src-alt/lib/lookup-functions";


(function hook (){
    const error = new Error()
    console.log(findStackFrame({
        error,
        symbol: "hook",
        offset: 6
    }))
})()

