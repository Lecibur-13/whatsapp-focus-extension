// Background service worker para la extensión
// Maneja el estado global y los comandos de teclado

// Escuchar el comando de teclado
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-focus') {
    // Enviar mensaje a todos los tabs de WhatsApp Web
    chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
      });
    });
  }
});

// Escuchar cambios en el estado de la extensión
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'focusModeChanged') {
    // Guardar el estado global
    chrome.storage.local.set({ 
      focusMode: request.enabled,
      lastUpdate: Date.now()
    });
  }
  return true;
});

// Manejar la instalación/activación
chrome.runtime.onInstalled.addListener(() => {
  // Inicializar el estado por defecto
  chrome.storage.local.set({ focusMode: false });
});




