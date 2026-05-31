const BACKEND_URL = "http://localhost:5000/api";
const DISTRACTIVE_DOMAINS = [
  "instagram.com",
  "facebook.com",
  "youtube.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "reddit.com"
];

// Trigger synchronization on install or startup
chrome.runtime.onInstalled.addListener(() => {
  syncActiveUnlocks();
  chrome.alarms.create("syncUnlocksAlarm", { periodInMinutes: 1 });
});

chrome.runtime.onStartup.addListener(() => {
  syncActiveUnlocks();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "syncUnlocksAlarm") {
    syncActiveUnlocks();
  }
});

// Listener to handle storage updates from PWA
chrome.storage.onChanged.addListener((changes) => {
  if (changes.ff_token || changes.ff_local_unlocks) {
    syncActiveUnlocks();
  }
});

async function syncActiveUnlocks() {
  try {
    const storage = await chrome.storage.local.get(["ff_token", "ff_local_unlocks"]);
    const token = storage.ff_token;
    
    if (!token) {
      // If not authenticated, fall back to offline local unlocks from storage
      const localUnlocks = storage.ff_local_unlocks || [];
      const now = Date.now();
      const activeLocal = localUnlocks.filter(u => new Date(u.expiresAt).getTime() > now);
      updateBlockingRules(activeLocal);
      return;
    }

    const response = await fetch(`${BACKEND_URL}/rewards/active`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Server status code ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      updateBlockingRules(data.activeUnlocks);
    }
  } catch (error) {
    console.warn("Failed to sync FocusFlow unlocks from backend, using local fallbacks:", error);
    try {
      const storage = await chrome.storage.local.get(["ff_local_unlocks"]);
      const localUnlocks = storage.ff_local_unlocks || [];
      const now = Date.now();
      const activeLocal = localUnlocks.filter(u => new Date(u.expiresAt).getTime() > now);
      updateBlockingRules(activeLocal);
    } catch (e) {
      console.error("Local fallback sync failed:", e);
    }
  }
}

function updateBlockingRules(activeUnlocks) {
  const activeIdentifiers = activeUnlocks.map(u => u.appIdentifier.toLowerCase());

  const rules = DISTRACTIVE_DOMAINS.map((domain, index) => {
    // Match domain names against app identifiers (e.g. "com.instagram.android" matching "instagram.com")
    const isUnlocked = activeIdentifiers.some(appId => {
      const parts = appId.split('.');
      const keyword = parts[1] || appId;
      return domain.includes(keyword);
    });

    if (isUnlocked) {
      return null;
    }

    const ruleId = index + 1;
    return {
      id: ruleId,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          extensionPath: `/blocked.html?blocked_domain=${encodeURIComponent(domain)}`
        }
      },
      condition: {
        urlFilter: `*://${domain}/*`,
        resourceTypes: ["main_frame"]
      }
    };
  }).filter(Boolean);

  const ruleIdsToRemove = DISTRACTIVE_DOMAINS.map((_, i) => i + 1);

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ruleIdsToRemove,
    addRules: rules
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Rules update error:", chrome.runtime.lastError.message);
    } else {
      console.log("Interception rules updated successfully. Block count:", rules.length);
    }
  });
}
