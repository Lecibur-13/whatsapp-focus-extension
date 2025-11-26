// Background service worker for the extension
// Handles global state and keyboard commands

// Listen for keyboard command
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-focus') {
    // Send message to all WhatsApp Web tabs
    chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
      });
    });
  }
});

// Listen for extension state changes
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'focusModeChanged') {
    // Save global state
    chrome.storage.local.set({ 
      focusMode: request.enabled,
      lastUpdate: Date.now()
    });
  }
  return true;
});

// Handle installation/activation
chrome.runtime.onInstalled.addListener(() => {
  // Initialize default state
  chrome.storage.local.set({ focusMode: false });
});

