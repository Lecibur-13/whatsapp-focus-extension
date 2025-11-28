// Content script for WhatsApp Web
let isFocusModeActive = false;
let hideTimeoutId = null;
let toggleButton = null;
let indicatorEl = null;

// Storage helpers
const getState = async () => (await chrome.storage.local.get(['focusMode'])).focusMode || false;
const setState = async (state) => chrome.storage.local.set({ focusMode: state });

// Find element by selectors
const findElement = (selectors) => {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) return el;
  }
  return null;
};

// Find sidebar
const findChatSidebar = () => findElement([
  '#pane-side',
  '[data-testid="chatlist"]',
  'div[role="complementary"]',
  'div[data-testid="chatlist-container"]'
]) || document.querySelector('div[role="complementary"]');

// Find sidebar container with x18dvir5 class
const findSidebarContainer = () => {
  const containers = document.querySelectorAll('.x18dvir5');
  for (const container of containers) {
    if (container.querySelector('#side, #pane-side')) return container;
  }
  const mainContainer = document.querySelector('._aigw.x18dvir5');
  if (mainContainer) return mainContainer;
  const sidebar = findChatSidebar();
  if (sidebar) {
    let parent = sidebar.parentElement;
    for (let i = 0; i < 6 && parent; i++) {
      if (parent.classList.contains('x18dvir5')) return parent;
      parent = parent.parentElement;
    }
  }
  return null;
};

// Find Communities container
const findCommunitiesContainer = () => {
  const btn = document.querySelector('button[aria-label="Communities"], button[aria-label="Comunidades"]') ||
              Array.from(document.querySelectorAll('button[data-navbar-item="true"]'))
                .find(b => b.getAttribute('data-navbar-item-index') === '3');
  if (!btn) return null;
  let parent = btn.parentElement?.parentElement;
  const requiredClasses = ['x1c4vz4f', 'xs83m0k', 'xdl72j9', 'x100vrsf', 'x1vqgdyp', 'xhslqc4'];
  while (parent && parent.tagName !== 'HEADER') {
    if (requiredClasses.every(cls => parent.classList.contains(cls))) return parent;
    parent = parent.parentElement;
  }
  return null;
};

// Insert element after reference
const insertAfter = (newEl, refEl) => {
  const parent = refEl.parentElement;
  if (!parent) return false;
  parent.insertBefore(newEl, refEl.nextElementSibling || null);
  return true;
};

// Check if container contains navigation bar (should not be collapsed)
const isNavigationBar = (container) => {
  // Check if container contains a header with data-tab (navigation bar structure)
  const navHeader = container.querySelector('header[data-tab]');
  if (navHeader) {
    // Navigation bar contains multiple buttons with data-navbar-item="true"
    const navButtons = navHeader.querySelectorAll('button[data-navbar-item="true"]');
    // Navigation bar always has at least 3 items: Chats, Status, Channels/Communities, Settings, Profile
    // If header has nav buttons, this is definitely the navigation bar container
    if (navButtons.length >= 3) return true;
    // Even if fewer buttons, if it has the header structure, it's likely the nav bar
    if (navButtons.length >= 2) return true;
  }
  
  // If container contains our toggle button (which is in the nav bar), it's the navigation bar
  if (container.querySelector('#whatsapp-focus-toggle')) {
    // Double check: it should also have other nav buttons or the header
    const navButtons = container.querySelectorAll('button[data-navbar-item="true"]');
    if (navButtons.length >= 2 || navHeader) return true;
  }
  
  // Navigation bar contains multiple buttons with data-navbar-item="true" directly
  const navButtons = container.querySelectorAll('button[data-navbar-item="true"]');
  // If it has 4+ navigation buttons, it's definitely the navigation bar
  if (navButtons.length >= 4) return true;
  
  // Navigation bar contains specific aria-labels for main navigation
  const navLabels = ['Chats', 'Status', 'Communities', 'Comunidades', 'Channels', 'Canales', 'Settings', 'Profile'];
  const foundLabels = navLabels.filter(label => 
    container.querySelector(`button[aria-label="${label}"], button[aria-label*="${label}"]`)
  );
  // If it has 4+ navigation labels, it's definitely the navigation bar
  if (foundLabels.length >= 4) return true;
  
  // Check if container is very narrow (navigation bar is vertical and narrow, typically < 150px)
  const rect = container.getBoundingClientRect();
  if (rect.width > 0 && rect.width < 150) {
    // If narrow AND contains header with data-tab, it's the navigation bar
    if (navHeader) return true;
    // If narrow AND contains multiple navigation buttons, it's likely the navigation bar
    if (navButtons.length >= 3) return true;
  }
  
  return false;
};

// Mark navigation bar containers with a special class for CSS targeting
const markNavigationBarContainers = () => {
  const allContainers = document.querySelectorAll('.x18dvir5');
  allContainers.forEach(container => {
    if (isNavigationBar(container)) {
      container.classList.add('whatsapp-focus-navbar');
      // Also ensure the header has z-index
      const navHeader = container.querySelector('header[data-tab]');
      if (navHeader) {
        navHeader.style.zIndex = '999';
        navHeader.style.position = 'relative';
      }
    } else {
      container.classList.remove('whatsapp-focus-navbar');
    }
  });
};

// Toggle sidebar with animated resize - applies to .x18dvir5 elements except navigation bar
const toggleChatSidebar = (show) => {
  const sidebar = findChatSidebar();
  const allContainers = document.querySelectorAll('.x18dvir5');
  
  // Mark navigation bar containers first
  markNavigationBarContainers();
  
  // Filter out navigation bar containers
  const containersToCollapse = Array.from(allContainers).filter(container => !isNavigationBar(container));
  
  if (containersToCollapse.length === 0) {
    if (sidebar) sidebar.style.display = show ? '' : 'none';
    return !!sidebar;
  }
  
  if (show) {
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
      hideTimeoutId = null;
    }
    document.body.classList.remove('whatsapp-focus-active');
    if (sidebar) {
      Object.assign(sidebar.style, { opacity: '', visibility: '', pointerEvents: '', display: '' });
    }
    // Restore filtered .x18dvir5 containers (excluding navigation bar)
    requestAnimationFrame(() => {
      containersToCollapse.forEach(container => {
        container.style.flex = '';
        container.style.width = '';
        container.style.minWidth = '';
        container.style.maxWidth = '';
        container.classList.remove('whatsapp-focus-collapsed');
      });
      // Re-mark navigation bars after restore
      markNavigationBarContainers();
    });
  } else {
    document.body.classList.add('whatsapp-focus-active');
    // Collapse filtered .x18dvir5 containers (excluding navigation bar)
    containersToCollapse.forEach(container => {
      container.style.transition = 'flex 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.4s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      void container.offsetWidth; // Force reflow
      container.classList.add('whatsapp-focus-collapsed');
      container.style.flex = '0 0 0%';
    });
    // Ensure navigation bars are marked and visible
    markNavigationBarContainers();
    hideTimeoutId = setTimeout(() => {
      if (!isFocusModeActive) return;
      if (sidebar) {
        Object.assign(sidebar.style, {
          transition: 'opacity 0.3s ease, visibility 0.3s ease',
          opacity: '0',
          visibility: 'hidden',
          pointerEvents: 'none'
        });
      }
    }, 300);
  }
  return true;
};

// Create toggle button
const createToggleButton = () => {
  if (document.getElementById('whatsapp-focus-toggle')) return true;
  
  const communitiesContainer = findCommunitiesContainer();
  if (!communitiesContainer) return false;
  
  // Create button structure
  const containerDiv = document.createElement('div');
  containerDiv.id = 'whatsapp-focus-toggle-container';
  containerDiv.className = 'x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j x1nhvcw1 x1q0g3np x1cy8zhl x100vrsf x1vqgdyp xhslqc4 x1ekkm8c x1143rjc xum4auv xj21bgg x1277o0a x13i9f1t xr9ek0c xjpr12u';
  containerDiv.style.display = 'flex';
  containerDiv.style.visibility = 'visible';
  containerDiv.style.opacity = '1';
  
  const span = document.createElement('span');
  span.className = 'html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs x4k7w5x x1h91t0o x1h9r5lt x1jfb8zj xv2umb2 x1beo9mf xaigb6o x12ejxvf x3igimt xarpa2k xedcshv x1lytzrv x1t2pt76 x7ja8zs x1qrby5j';
  
  const button = document.createElement('button');
  button.id = 'whatsapp-focus-toggle';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', 'Focus Mode');
  button.setAttribute('tabindex', '-1');
  button.setAttribute('data-navbar-item', 'true');
  button.setAttribute('data-navbar-item-selected', 'false');
  button.setAttribute('title', 'Toggle focus mode (Hide/Show chat list)');
  button.className = 'xjb2p0i xk390pu x1heor9g x1ypdohk xjbqb8w x972fbf x10w94by x1qhh985 x14e42zd xtnn1bt x9v5kkp xmw7ebm xrdum7p xt8t1vi x1xc408v x129tdwq x15urzxu xh8yej3 x1y1aw1k xf159sx xwib8y2 xmzvs34';
  button.style.display = 'flex';
  button.style.visibility = 'visible';
  button.style.opacity = '1';
  button.style.width = 'auto';
  button.style.height = 'auto';
  
  // Button structure
  const innerDiv1 = document.createElement('div');
  innerDiv1.className = 'x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j x1nhvcw1 x1q0g3np x6s0dn4 xh8yej3';
  
  const innerDiv2 = document.createElement('div');
  innerDiv2.className = 'x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j x1nhvcw1 x1q0g3np x6s0dn4 x1n2onr6';
  innerDiv2.style.flexGrow = '1';
  
  const iconSpan = document.createElement('span');
  iconSpan.setAttribute('aria-hidden', 'true');
  iconSpan.setAttribute('data-icon', 'eye');
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('height', '24');
  svg.setAttribute('width', '24');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('fill', 'none');
  
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
  title.textContent = 'eye';
  svg.appendChild(title);
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');
  path.setAttribute('fill', 'currentColor');
  svg.appendChild(path);
  
  iconSpan.appendChild(svg);
  innerDiv2.appendChild(iconSpan);
  innerDiv1.appendChild(innerDiv2);
  button.appendChild(innerDiv1);
  span.appendChild(button);
  containerDiv.appendChild(span);
  
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFocusMode();
  });
  
  // Insert button - try multiple methods
  let inserted = false;
  const parent = communitiesContainer.parentElement;
  
  if (parent) {
    const nextSibling = communitiesContainer.nextElementSibling;
    if (nextSibling) {
      parent.insertBefore(containerDiv, nextSibling);
    } else {
      parent.appendChild(containerDiv);
    }
    inserted = true;
  }
  
  // Fallback: try to find header and insert there
  if (!inserted) {
    const header = document.querySelector('header[data-tab="2"]');
    if (header) {
      const navContainer = header.querySelector('div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.x78zum5');
      if (navContainer) {
        const communitiesContainerInNav = navContainer.querySelector('div.x100vrsf.x1vqgdyp.xhslqc4');
        if (communitiesContainerInNav?.parentElement) {
          const navParent = communitiesContainerInNav.parentElement;
          const nextSib = communitiesContainerInNav.nextElementSibling;
          if (nextSib) {
            navParent.insertBefore(containerDiv, nextSib);
          } else {
            navParent.appendChild(containerDiv);
          }
          inserted = true;
        }
      }
    }
  }
  
  if (inserted) {
    toggleButton = button;
    updateButtonState();
    
    // Force visibility with multiple checks
    requestAnimationFrame(() => {
      const rect = button.getBoundingClientRect();
      const style = window.getComputedStyle(button);
      if (rect.width === 0 || rect.height === 0 || style.display === 'none' || style.visibility === 'hidden') {
        Object.assign(button.style, { 
          display: 'flex', 
          visibility: 'visible', 
          opacity: '1',
          width: 'auto',
          height: 'auto',
          minWidth: '48px',
          minHeight: '48px'
        });
        Object.assign(containerDiv.style, {
          display: 'flex',
          visibility: 'visible',
          opacity: '1'
        });
      }
    });
    
    return true;
  }
  
  return false;
};

// Update button visual state
const updateButtonState = () => {
  if (!toggleButton) return;
  
  const svg = toggleButton.querySelector('span[data-icon] svg');
  if (!svg) return;
  
  svg.innerHTML = '';
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
  title.textContent = 'eye';
  svg.appendChild(title);
  
  const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path1.setAttribute('d', 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');
  path1.setAttribute('fill', 'currentColor');
  svg.appendChild(path1);
  
  if (isFocusModeActive) {
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    Object.assign(path2, {
      d: 'M1 1l22 22',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round'
    });
    svg.appendChild(path2);
    toggleButton.setAttribute('aria-pressed', 'true');
    toggleButton.title = 'Show chat list';
  } else {
    toggleButton.setAttribute('aria-pressed', 'false');
    toggleButton.title = 'Hide chat list';
  }
};

// Toggle focus mode
const toggleFocusMode = async () => {
  isFocusModeActive = !isFocusModeActive;
  await setState(isFocusModeActive);
  toggleChatSidebar(!isFocusModeActive);
  updateButtonState();
  updateIndicator();
  if (!isFocusModeActive) {
    verifyVisibilityAndRecover();
  }
  chrome.runtime.sendMessage({ action: 'focusModeChanged', enabled: isFocusModeActive });
};

// Ensure button is visible and in correct position
const ensureButtonPosition = () => {
  const button = document.getElementById('whatsapp-focus-toggle');
  if (!button) return false;
  
  const container = document.getElementById('whatsapp-focus-toggle-container');
  if (container) {
    Object.assign(container.style, { display: 'flex', visibility: 'visible', opacity: '1' });
  }
  
  const rect = button.getBoundingClientRect();
  const style = window.getComputedStyle(button);
  const isVisible = rect.width > 0 && rect.height > 0 && 
                    rect.top >= 0 && rect.left >= 0 &&
                    style.display !== 'none' && style.visibility !== 'hidden';
  
  if (!isVisible) {
    Object.assign(button.style, { 
      display: 'flex', 
      visibility: 'visible', 
      opacity: '1',
      width: 'auto',
      height: 'auto',
      minWidth: '48px',
      minHeight: '48px'
    });
  }
  
  const communitiesContainer = findCommunitiesContainer();
  if (!communitiesContainer) return isVisible;
  
  const buttonContainer = button.closest('div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.x78zum5.xozqiw3.x1oa3qoh.x12fk4p8.xeuugli.x2lwn1j.x1nhvcw1.x1q0g3np.x1cy8zhl.x100vrsf.x1vqgdyp.xhslqc4') || container;
  if (buttonContainer && buttonContainer.parentElement !== communitiesContainer.parentElement) {
    const nextSibling = communitiesContainer.nextElementSibling;
    if (nextSibling) {
      communitiesContainer.parentElement.insertBefore(buttonContainer, nextSibling);
    } else {
      communitiesContainer.parentElement.appendChild(buttonContainer);
    }
  }
  
  return isVisible;
};

// Setup extension
const setupExtension = (retryCount = 0) => {
  const maxRetries = 20;
  const buttonCreated = createToggleButton();
  const button = document.getElementById('whatsapp-focus-toggle');
  
  const isVisible = button && (() => {
    const rect = button.getBoundingClientRect();
    const style = window.getComputedStyle(button);
    return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0 &&
           style.display !== 'none' && style.visibility !== 'hidden';
  })();
  
  if ((!buttonCreated || !isVisible) && retryCount < maxRetries) {
    const delay = retryCount < 5 ? 300 : retryCount < 10 ? 500 : 1000;
    setTimeout(() => setupExtension(retryCount + 1), delay);
    if (button && !isVisible) {
      Object.assign(button.style, { 
        display: 'flex', 
        visibility: 'visible', 
        opacity: '1',
        width: 'auto',
        height: 'auto',
        minWidth: '48px',
        minHeight: '48px'
      });
      const container = document.getElementById('whatsapp-focus-toggle-container');
      if (container) {
        Object.assign(container.style, { display: 'flex', visibility: 'visible', opacity: '1' });
      }
    }
    return;
  }
  
  toggleChatSidebar(!isFocusModeActive);
  updateButtonState();
  
  // Mark navigation bar containers on setup
  markNavigationBarContainers();
  
  // Force visibility one more time after setup
  requestAnimationFrame(() => {
    ensureButtonPosition();
    markNavigationBarContainers();
  });
  
  // MutationObserver
  const observer = new MutationObserver(() => {
    const btn = document.getElementById('whatsapp-focus-toggle');
    if (!btn) {
      createToggleButton();
      toggleChatSidebar(!isFocusModeActive);
      updateButtonState();
      markNavigationBarContainers();
      return;
    }
    ensureButtonPosition();
    markNavigationBarContainers();
    toggleChatSidebar(!isFocusModeActive);
  });
  
  observer.observe(document.body, { childList: true, subtree: true, attributes: false });
  
  // Periodic check
  setInterval(() => {
    const btn = document.getElementById('whatsapp-focus-toggle');
    if (!btn) {
      createToggleButton();
      return;
    }
    ensureButtonPosition();
    markNavigationBarContainers();
  }, 2000);
};

// Initialize
(async () => {
  isFocusModeActive = await getState();
  const delay = document.readyState === 'loading' ? 
    new Promise(resolve => document.addEventListener('DOMContentLoaded', () => setTimeout(resolve, 1000))) :
    new Promise(resolve => setTimeout(resolve, 1000));
  await delay;
  setupExtension();
  ensureIndicator();
  updateIndicator();
})();

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    toggleFocusMode();
    sendResponse({ success: true });
  } else if (request.action === 'getState') {
    sendResponse({ enabled: isFocusModeActive });
  } else if (request.action === 'setState') {
    isFocusModeActive = request.enabled;
    setState(isFocusModeActive);
    toggleChatSidebar(!isFocusModeActive);
    updateButtonState();
    updateIndicator();
    sendResponse({ success: true });
  } else if (request.action === 'reset') {
    resetFocusVisibility();
    sendResponse({ success: true });
  }
  return true;
});

function resetFocusVisibility() {
  if (hideTimeoutId) {
    clearTimeout(hideTimeoutId);
    hideTimeoutId = null;
  }
  isFocusModeActive = false;
  setState(isFocusModeActive);
  const sidebar = findChatSidebar();
  document.body.classList.remove('whatsapp-focus-active');
  const allContainers = document.querySelectorAll('.x18dvir5');
  allContainers.forEach(container => {
    container.classList.remove('whatsapp-focus-collapsed');
    container.style.flex = '';
    container.style.width = '';
    container.style.minWidth = '';
    container.style.maxWidth = '';
  });
  if (sidebar) {
    Object.assign(sidebar.style, { opacity: '', visibility: '', pointerEvents: '', display: '' });
  }
  markNavigationBarContainers();
  ensureButtonPosition();
  updateButtonState();
  updateIndicator();
}

function verifyVisibilityAndRecover() {
  const sidebar = findChatSidebar();
  setTimeout(() => {
    if (!sidebar) return;
    const style = window.getComputedStyle(sidebar);
    const rect = sidebar.getBoundingClientRect();
    const hidden = style.visibility === 'hidden' || style.opacity === '0' || style.display === 'none' || rect.width === 0;
    if (hidden) {
      resetFocusVisibility();
    }
  }, 400);
}

function ensureIndicator() {
  if (document.getElementById('whatsapp-focus-indicator')) {
    indicatorEl = document.getElementById('whatsapp-focus-indicator');
    return;
  }
  const el = document.createElement('div');
  el.id = 'whatsapp-focus-indicator';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('height', '20');
  svg.setAttribute('width', '20');
  const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path1.setAttribute('d', 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');
  path1.setAttribute('fill', 'currentColor');
  const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path2.setAttribute('d', 'M1 1l22 22');
  path2.setAttribute('stroke', 'currentColor');
  path2.setAttribute('stroke-width', '2');
  path2.setAttribute('stroke-linecap', 'round');
  svg.appendChild(path1);
  svg.appendChild(path2);
  el.appendChild(svg);
  document.body.appendChild(el);
  indicatorEl = el;
}

function updateIndicator() {
  ensureIndicator();
  if (!indicatorEl) return;
  indicatorEl.style.display = isFocusModeActive ? 'flex' : 'none';
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.focusMode) {
    isFocusModeActive = changes.focusMode.newValue || false;
    toggleChatSidebar(!isFocusModeActive);
    updateButtonState();
    updateIndicator();
  }
});
