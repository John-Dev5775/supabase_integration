// content.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "injectForm") {
      let recordingForm = document.createElement("div");
      recordingForm.innerHTML = `
        <div id="recordingForm" style="position: fixed; top: 20px; left: 20px; background: white; padding: 10px; border: 1px solid #ccc; z-index: 9999;">
          <button id="startRecording">Record</button>
          <button id="cancelRecording">Cancel</button>
          <button id="stopRecording" disabled>Stop</button>
          <button id="finishRecording">Finish</button>
        </div>
      `;
      document.body.appendChild(recordingForm);
  
      document.getElementById("startRecording").addEventListener("click", () => {
        console.log("Recording started...");
        // Implement recording logic (not shown here)
      });
  
      document.getElementById("cancelRecording").addEventListener("click", () => {
        recordingForm.remove();
      });
  
      document.getElementById("stopRecording").addEventListener("click", () => {
        console.log("Recording stopped...");
        // Implement stop recording logic (not shown here)
      });
  
      document.getElementById("finishRecording").addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "openModal" });
        recordingForm.remove();
      });
    }
  });
  