const startTestButton = document.getElementById("start-test");
const DownloadResults = document.getElementById("DownloadResults");
const UploadResults = document.getElementById("UploadResults");
const pingResult = document.getElementById("PingResults");
const JitterResult = document.getElementById("JitterResults");
const debugLog = document.getElementById("debug-log");

startTestButton.addEventListener("click", runSpeedtest);

function runSpeedtest() {
  debugLog.innerHTML = ""; // Clear previous logs
  startTestButton.disabled = true;
  console.log("started");
  const eventSource = new EventSource("/api/speedtestnet");
  console.log("getting data");

  eventSource.onmessage = function (event) {
    console.log("Received message");
    const data = JSON.parse(event.data);
    console.log(data);

    // Check if this is the final result
    if (data.downloadResult && data.uploadResult) {
      const download = data.downloadResult.speed;
      const upload = data.uploadResult.speed;
      const jitter = data.pingResult.jitter;
      const ping = data.pingResult.latency;

      DownloadResults.innerText = download;
      UploadResults.innerText = upload;
      JitterResult.innerText = jitter;
      pingResult.innerText = ping;

      eventSource.close();
      startTestButton.disabled = false;
      console.log("Test completed, connection closed");
    }
  };

  eventSource.addEventListener("debug", (event) => {
    const debugMessage = JSON.parse(event.data);
    appendToLog(debugMessage);
  });

  // eventSource.addEventListener("result", (event) => {
  //   const testResult = JSON.parse(event.data);
  //   appendToLog("Test Result:");
  //   appendToLog(JSON.stringify(testResult, null, 2));
  //   eventSource.close();
  //   startTestButton.disabled = false;
  // });

  eventSource.addEventListener("error", (event) => {
    appendToLog("Error: " + event.data);
    eventSource.close();
    startTestButton.disabled = false;
  });

  eventSource.onerror = (error) => {
    appendToLog("EventSource failed: " + JSON.stringify(error));
    eventSource.close();
    startTestButton.disabled = false;
  };
}

function appendToLog(message) {
  const logEntry = document.createElement("pre");
  logEntry.textContent =
    typeof message === "string" ? message : JSON.stringify(message, null, 2);
  debugLog.appendChild(logEntry);
  debugLog.scrollTop = debugLog.scrollHeight;
}
