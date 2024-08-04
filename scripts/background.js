importScripts("../popup/supabase.js")
let supabaseUrl = "https://geffqszwtaqixjjwpamo.supabase.co";
let supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZmZxc3p3dGFxaXhqandwYW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI2MjY2ODUsImV4cCI6MjAzODIwMjY4NX0.EZIQTIAGobN7HfdDXrptovKBMZ8gLpn6cKRYv0aLe40";

chrome.action.onClicked.addListener((tab) => {
  chrome.windows.create({
    url: "popup/popup.html",
    type: "popup",
    width: 400,
    height: 600,
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openModal") {
    chrome.windows.create({
      url: "popup/timeline/index.html",
      type: "popup",
      width: 1000,
      height: 1200,
      left: 0,
      top: 0
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url?.includes("verbiflow.com")) {
    finishUserOAuth(changeInfo.url);
  }
});

async function finishUserOAuth(url) {
  try {
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    const hashMap = parseUrlHash(url);
    const access_token = hashMap.get('access_token');
    const refresh_token = hashMap.get('refresh_token');
    if (!access_token || !refresh_token) {
      throw new Error(`no supabase tokens found in URL hash`);
    }

    const { data, error } = await supabaseClient.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) throw error;

    chrome.storage.local.set({ "supasession": data }).then(() => {
      console.log(data);
    });

    chrome.tabs.update({url: "https://myapp.com/user-login-success/"});

  } catch (error) {
    console.error(error);
  }
}

function parseUrlHash(url) {
  const hashParts = new URL(url).hash.slice(1).split('&');
  const hashMap = new Map(
    hashParts.map((part) => {
      const [name, value] = part.split('=');
      return [name, value];
    })
  );

  return hashMap;
}


