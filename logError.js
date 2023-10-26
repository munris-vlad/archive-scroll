import { setUncaughtExceptionCaptureCallback } from "node:process"
setUncaughtExceptionCaptureCallback(console.log)