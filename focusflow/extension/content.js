function syncToken() {
  const token = localStorage.getItem("ff_token");
  const localUnlocks = localStorage.getItem("ff_local_unlocks");
  chrome.storage.local.set({ 
    ff_token: token,
    ff_local_unlocks: localUnlocks ? JSON.parse(localUnlocks) : []
  }, () => {
    console.log("FocusFlow token and local unlocks synchronized with blocker extension.");
  });
}

// Sync on document load
syncToken();

// Monitor changes in localStorage (from other tabs/windows)
window.addEventListener("storage", (e) => {
  if (e.key === "ff_token" || e.key === "ff_local_unlocks") {
    syncToken();
  }
});

// Monitor custom message event from the current tab
window.addEventListener("message", (e) => {
  if (e.data && e.data.type === "FOCUSFLOW_SYNC") {
    syncToken();
  }
});
