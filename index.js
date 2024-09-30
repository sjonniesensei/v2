const express = require("express");
const { UniversalSpeedTest, DistanceUnits } = require("universal-speedtest");
const util = require("util");

const app = express();
const port = 3000;

app.use(express.static("public"));

// app.get("/", (req, res) => {
//   res.send("Welcome to my Speedtest API!");
// });

app.get("/", async (req, res) => {
  // Set the response headers to indicate that this is an event stream
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Create a custom debug function that sends debug messages as events
  const sendDebug = (message) => {
    if (typeof message === "object") {
      message = util.inspect(message, { depth: null });
    }
    res.write(`event: debug\ndata: ${JSON.stringify(message)}\n\n`);
  };

  // Capture console output
  const originalConsoleLog = console.log;
  const originalConsoleDebug = console.debug;
  console.log = console.debug = (...args) => {
    sendDebug(args.join(" "));
    originalConsoleLog.apply(console, args);
  };

  // Configure and run speedtest
  const universalSpeedTest = new UniversalSpeedTest({
    debug: true,
    tests: {
      measureUpload: true,
      measureDownload: true,
    },
    units: {
      distanceUnit: DistanceUnits.km,
    },
  });

  try {
    sendDebug("Starting Ookla Speedtest...");
    const testResult = await universalSpeedTest.performOoklaTest();
    // Send the final test result as an event
    res.write(`data: ${JSON.stringify(testResult)}\n\n`);
  } catch (error) {
    // Send an error event
    res.write(`event: error\ndata: ${error.message}\n\n`);
  } finally {
    // Restore the original console functions
    console.log = originalConsoleLog;
    console.debug = originalConsoleDebug;
    // End the response
    res.end();
  }

  return "API working";
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
