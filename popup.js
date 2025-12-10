// Script para el popup de la extensión

let currentState = false;

// Función para actualizar la UI del popup
function updateUI() {
  const statusDiv = document.getElementById('status');
  const statusText = document.getElementById('statusText');
  const statusDesc = document.getElementById('statusDesc');
  const toggleButton = document.getElementById('toggleButton');
  
  if (currentState) {
    statusDiv.className = 'status active';
    statusText.textContent = 'Modo Focus: ACTIVO';
    statusDesc.textContent = 'La lista de chats está oculta';
    toggleButton.textContent = 'Desactivar Modo Focus';
    toggleButton.className = 'button primary';
  } else {
    statusDiv.className = 'status inactive';
    statusText.textContent = 'Modo Focus: INACTIVO';
    statusDesc.textContent = 'La lista de chats está visible';
    toggleButton.textContent = 'Activar Modo Focus';
    toggleButton.className = 'button secondary';
  }
}

// Función para obtener el estado actual
async function getCurrentState() {
  try {
    // Obtener el estado desde storage
    const result = await chrome.storage.local.get(['focusMode']);
    currentState = result.focusMode || false;
    
    // También intentar obtener el estado del tab activo
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('web.whatsapp.com')) {
      try {
        const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getState' });
        if (response && response.enabled !== undefined) {
          currentState = response.enabled;
        }
      } catch (error) {
        // El content script puede no estar listo aún
        console.log('Content script no disponible aún');
      }
    }
    
    updateUI();
  } catch (error) {
    console.error('Error obteniendo estado:', error);
    updateUI();
  }
}

// Función para alternar el modo focus
async function toggleFocusMode() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('web.whatsapp.com')) {
      // Enviar mensaje al content script
      await chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle' });
      
      // Actualizar el estado local después de un breve delay
      setTimeout(() => {
        getCurrentState();
      }, 200);
    } else {
      // Si no estamos en WhatsApp Web, mostrar mensaje
      alert('Por favor, abre WhatsApp Web (https://web.whatsapp.com) para usar esta extensión.');
    }
  } catch (error) {
    console.error('Error alternando modo focus:', error);
    alert('Error al alternar el modo focus. Asegúrate de estar en WhatsApp Web.');
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  getCurrentState();
  
  document.getElementById('toggleButton').addEventListener('click', toggleFocusMode);
  
  // Actualizar el estado periódicamente
  setInterval(getCurrentState, 1000);
});

// Escuchar cambios en el storage
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.focusMode) {
    currentState = changes.focusMode.newValue;
    updateUI();
  }
});




