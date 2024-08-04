document.addEventListener('DOMContentLoaded', async () => {
  const session = await getSession();
  if (session) {
    handleLoginStatus(session.user.email);
  }
});

// Get session from chrome.storage.local
async function getSession() {
  return new Promise((resolve) => {
    chrome.storage.local.get('supasession', (result) => {
      resolve(result.supasession || null);
    });
  });
}


let tabId = null;

//initial data
let supabaseUrl = "https://geffqszwtaqixjjwpamo.supabase.co";
let supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZmZxc3p3dGFxaXhqandwYW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI2MjY2ODUsImV4cCI6MjAzODIwMjY4NX0.EZIQTIAGobN7HfdDXrptovKBMZ8gLpn6cKRYv0aLe40";
const SupabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// dom elements
let googleSignInButton = document.getElementsByClassName("write")[0]
let loginForm = document.getElementById("login_form")
let startBtn = document.getElementById("start_btn")
let logoutBtn = document.getElementById("logout")

let handleLoginStatus = (email) => {
  loginForm.style.display = "none";
  startBtn.style.display = "block";
  logoutBtn.style.display = "block"
};

document.getElementById("logout").addEventListener("click", () => {
  chrome.storage.local.remove(["supasession"], () => {
    console.log("Session cleared from local storage");
  });
})

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  tabId = tabs[0].id;
});

document.getElementById("start_btn").addEventListener(
  "click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: injectForm
      });
    });
  }
)

function injectForm() {
  let recordingForm = document.createElement("div");
  recordingForm.innerHTML = `
    <div id="recordingForm" style="position: fixed; bottom: 20px; left: 40%; background: white; padding: 10px; border: 1px solid #ccc; z-index: 9999;">
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


document
  .getElementsByClassName("write")[0]
  .addEventListener("click", async () => {

    googleSignInButton.innerHTML = '<div class="text-center"><div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span>  </div></div>';
    googleSignInButton.setAttribute("disabled", "true")
    const manifest = chrome.runtime.getManifest();
    const url = new URL("https://accounts.google.com/o/oauth2/auth");

    url.searchParams.set("client_id", manifest.oauth2.client_id);
    url.searchParams.set('response_type', 'id_token')
    url.searchParams.set('access_type', 'offline')
    url.searchParams.set('redirect_uri', `https://${chrome.runtime.id}.chromiumapp.org`)
    url.searchParams.set('scope', manifest.oauth2.scopes.join(''))

 
    // chrome.identity.launchWebAuthFlow(
    //   {
    //     url: url.href,
    //     interactive: true,
    //   },
    //   async (redirectedTo) => {

    //     if (chrome.runtime.lastError) {
    //       // auth was not successful
    //     } else {
    //       // auth was successful, extract the ID token from the redirectedTo URL
    //       const url = new URL(redirectedTo)
    //       const params = new URLSearchParams(url.hash)

    //       const { data, error } = await SupabaseClient.auth.signInWithIdToken({
    //         provider: 'google',
    //         token: params.get('#id_token'),
    //       })

    //       if (error == null) {
    //         // add logic
    //         handleLoginStatus(data.user.email)
    //       }
    //     }
    //   }
    // )

    const { data, error } = await SupabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: chrome.identity.getRedirectURL(),
      },
    });
    if (error) throw error;
    console.log(data)
    await chrome.tabs.create({ url: data.url });
  });

 
