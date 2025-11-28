// Script for the extension popup

let currentState = false;

// Function to update the popup UI
function updateUI() {
  const statusDiv = document.getElementById('status');
  const statusText = document.getElementById('statusText');
  const statusDesc = document.getElementById('statusDesc');
  const toggleButton = document.getElementById('toggleButton');
  
  if (currentState) {
    statusDiv.className = 'status active';
    statusText.textContent = 'Focus Mode: ACTIVE';
    statusDesc.textContent = 'Chat list is hidden';
    toggleButton.textContent = 'Disable Focus Mode';
    toggleButton.className = 'button primary';
  } else {
    statusDiv.className = 'status inactive';
    statusText.textContent = 'Focus Mode: INACTIVE';
    statusDesc.textContent = 'Chat list is visible';
    toggleButton.textContent = 'Enable Focus Mode';
    toggleButton.className = 'button secondary';
  }
}

// Function to get current state
async function getCurrentState() {
  try {
    // Get state from storage
    const result = await chrome.storage.local.get(['focusMode']);
    currentState = result.focusMode || false;
    
    // Also try to get state from active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('web.whatsapp.com')) {
      try {
        const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getState' });
        if (response && response.enabled !== undefined) {
          currentState = response.enabled;
        }
      } catch (error) {
        // Content script may not be ready yet
        console.log('Content script not available yet');
      }
    }
    
    updateUI();
  } catch (error) {
    console.error('Error getting state:', error);
    updateUI();
  }
}

// Function to toggle focus mode
async function toggleFocusMode() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('web.whatsapp.com')) {
      // Send message to content script
      await chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle' });
      
      // Update local state after a brief delay
      setTimeout(() => {
        getCurrentState();
      }, 200);
    } else {
      // If not on WhatsApp Web, show message
      alert('Please open WhatsApp Web (https://web.whatsapp.com) to use this extension.');
    }
  } catch (error) {
    console.error('Error toggling focus mode:', error);
    alert('Error toggling focus mode. Make sure you are on WhatsApp Web.');
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  getCurrentState();
  
  document.getElementById('toggleButton').addEventListener('click', toggleFocusMode);
  document.getElementById('resetButton').addEventListener('click', resetVisibility);
  
  // Update state periodically
  setInterval(getCurrentState, 1000);
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.focusMode) {
    currentState = changes.focusMode.newValue;
    updateUI();
  }
});

async function resetVisibility() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('web.whatsapp.com')) {
      await chrome.tabs.sendMessage(tabs[0].id, { action: 'reset' });
      setTimeout(getCurrentState, 300);
    } else {
      alert('Please open WhatsApp Web (https://web.whatsapp.com) to use this extension.');
    }
  } catch (error) {
    console.error('Error resetting visibility:', error);
    alert('Error resetting visibility. Make sure you are on WhatsApp Web.');
  }
}

