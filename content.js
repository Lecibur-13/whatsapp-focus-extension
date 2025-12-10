// Content script para WhatsApp Web
// Este script se ejecuta en la página de WhatsApp Web

let isFocusModeActive = false;
let toggleButton = null;

// Función para obtener el estado desde storage
async function getState() {
  const result = await chrome.storage.local.get(['focusMode']);
  return result.focusMode || false;
}

// Función para guardar el estado en storage
async function setState(state) {
  await chrome.storage.local.set({ focusMode: state });
}

// Función para encontrar el sidebar de chats
function findChatSidebar() {
  // Selectores comunes de WhatsApp Web - buscar primero el contenedor principal #side
  const selectors = [
    '#side', // Contenedor principal del sidebar
    '#pane-side', // Selector principal del sidebar
    '[data-testid="chatlist"]', // Selector alternativo
    'div[role="complementary"]', // Selector por rol
    'div[data-testid="chatlist-container"]' // Otro selector alternativo
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
  }
  
  // Si no encuentra con selectores específicos, busca por estructura
  const sidebars = document.querySelectorAll('div[role="complementary"]');
  if (sidebars.length > 0) {
    return sidebars[0];
  }
  
  return null;
}

// Función para encontrar el header
function findHeader() {
  const selectors = [
    'header[role="banner"]',
    'div[data-testid="chatlist-header"]',
    'header',
    'div[role="banner"]'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.closest('#pane-side')) {
      return element;
    }
  }
  
  return null;
}

// Función para encontrar el contenedor de navegación lateral (iconos de Chats, Communities, etc.)
function findNavigationContainer() {
  // Primero intentar encontrar el botón de Communities y obtener su contenedor padre
  const communitiesButton = findCommunitiesButton();
  if (communitiesButton) {
    // Buscar el contenedor padre que contiene múltiples botones de navegación
    let parent = communitiesButton.parentElement;
    let depth = 0;
    const maxDepth = 5; // Limitar la profundidad de búsqueda
    
    while (parent && depth < maxDepth) {
      // Contar cuántos botones de navegación tiene este contenedor
      const buttons = Array.from(parent.querySelectorAll('button, [role="button"]'));
      const navButtons = buttons.filter(btn => {
        if (btn.id === 'whatsapp-focus-toggle') return false;
        const rect = btn.getBoundingClientRect();
        const isSquare = Math.abs(rect.width - rect.height) < 10;
        const isRightSize = rect.width > 30 && rect.width < 60;
        return isSquare && isRightSize;
      });
      
      // Si tiene al menos 2 botones de navegación, probablemente es el contenedor correcto
      if (navButtons.length >= 2) {
        return parent;
      }
      
      parent = parent.parentElement;
      depth++;
    }
  }
  
  // Buscar el contenedor de la barra lateral izquierda con los iconos de navegación
  const selectors = [
    'nav[role="navigation"]',
    'div[data-testid="sidebar"]',
    'div[role="navigation"]',
    'aside[role="complementary"] > div:first-child',
    '#pane-side > div:first-child'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      // Verificar que contiene iconos de navegación
      const hasNavIcons = element.querySelector('button, [role="button"]');
      if (hasNavIcons) {
        return element;
      }
    }
  }
  
  // Buscar por estructura: contenedor con múltiples botones circulares
  const containers = document.querySelectorAll('div[role="complementary"] > div');
  for (const container of containers) {
    const buttons = container.querySelectorAll('button, [role="button"]');
    if (buttons.length >= 2) {
      // Probablemente es el contenedor de navegación
      return container;
    }
  }
  
  return null;
}

// Función helper para insertar un elemento después de otro
function insertAfter(newElement, referenceElement) {
  const parent = referenceElement.parentElement;
  if (!parent) {
    return false;
  }
  
  const nextSibling = referenceElement.nextElementSibling;
  if (nextSibling) {
    parent.insertBefore(newElement, nextSibling);
  } else {
    parent.appendChild(newElement);
  }
  return true;
}

// Función para encontrar el contenedor del botón de Communities
function findCommunitiesContainer() {
  // Buscar el botón de Communities por aria-label
  const communitiesButton = document.querySelector('button[aria-label="Communities"], button[aria-label="Comunidades"]');
  
  if (!communitiesButton) {
    // Buscar por data-navbar-item-index="3" (Communities es el índice 3)
    const allNavButtons = document.querySelectorAll('button[data-navbar-item="true"]');
    for (const btn of allNavButtons) {
      if (btn.getAttribute('data-navbar-item-index') === '3') {
        // Encontrar el contenedor padre con las clases específicas
        let parent = btn.parentElement;
        while (parent && parent.tagName !== 'HEADER') {
          // Buscar el div que tiene las clases específicas del contenedor de Communities
          if (parent.classList.contains('x1c4vz4f') && 
              parent.classList.contains('xs83m0k') && 
              parent.classList.contains('xdl72j9')) {
            // Verificar que tenga todas las clases necesarias
            const hasAllClasses = parent.classList.contains('x100vrsf') && 
                                  parent.classList.contains('x1vqgdyp') &&
                                  parent.classList.contains('xhslqc4');
            if (hasAllClasses) {
              return parent;
            }
          }
          parent = parent.parentElement;
        }
        break;
      }
    }
    return null;
  }
  
  // Encontrar el contenedor padre con las clases específicas
  let parent = communitiesButton.parentElement; // span
  parent = parent?.parentElement; // div con las clases
  
  // Buscar el div que tiene las clases específicas del contenedor
  while (parent && parent.tagName !== 'HEADER') {
    if (parent.classList.contains('x1c4vz4f') && 
        parent.classList.contains('xs83m0k') && 
        parent.classList.contains('xdl72j9') &&
        parent.classList.contains('x100vrsf') &&
        parent.classList.contains('x1vqgdyp') &&
        parent.classList.contains('xhslqc4')) {
      return parent;
    }
    parent = parent.parentElement;
  }
  
  return null;
}

// Función para colapsar/expandir el sidebar de chats con animación
function toggleChatSidebar(show) {
  const sidebar = findChatSidebar();
  if (sidebar) {
    if (show) {
      // Expandir el sidebar - remover clase del body primero
      document.body.classList.remove('whatsapp-focus-active');
      
      // Remover estilos inline para permitir que los estilos CSS naturales se apliquen
      setTimeout(() => {
        sidebar.style.width = '';
        sidebar.style.minWidth = '';
        sidebar.style.maxWidth = '';
        sidebar.style.transform = '';
        sidebar.style.opacity = '';
        sidebar.style.visibility = '';
        sidebar.style.overflow = '';
        sidebar.style.pointerEvents = '';
        sidebar.style.margin = '';
        sidebar.style.padding = '';
        sidebar.style.transition = '';
        sidebar.classList.remove('whatsapp-focus-collapsed');
      }, 10);
    } else {
      // Colapsar el sidebar con animación
      // Primero asegurar que el sidebar tenga las transiciones aplicadas
      sidebar.style.transition = 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, visibility 0.3s ease, margin 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      sidebar.style.overflow = 'hidden';
      
      // Agregar clase al body para activar los estilos CSS
      document.body.classList.add('whatsapp-focus-active');
      sidebar.classList.add('whatsapp-focus-collapsed');
      
      // Forzar reflow para que la animación funcione
      void sidebar.offsetWidth;
      
      // Aplicar el colapso con animación después de un pequeño delay
      setTimeout(() => {
        sidebar.style.width = '0';
        sidebar.style.minWidth = '0';
        sidebar.style.maxWidth = '0';
        sidebar.style.transform = 'translateX(-100%)';
        sidebar.style.opacity = '0';
        sidebar.style.visibility = 'hidden';
        sidebar.style.pointerEvents = 'none';
      }, 10);
    }
    return true;
  }
  return false;
}

// Función para crear el botón toggle
// Retorna true si se creó exitosamente, false en caso contrario
function createToggleButton() {
  // Si ya existe el botón, no crear otro
  if (document.getElementById('whatsapp-focus-toggle')) {
    return true;
  }
  
  // Buscar el contenedor de Communities
  const communitiesContainer = findCommunitiesContainer();
  
  if (!communitiesContainer) {
    return false;
  }
  
  // Obtener el botón de Communities para copiar sus atributos
  const communitiesButton = communitiesContainer.querySelector('button[aria-label="Communities"], button[aria-label="Comunidades"]');
  
  // Crear la estructura completa igual que WhatsApp Web
  // Contenedor div con las mismas clases
  const containerDiv = document.createElement('div');
  containerDiv.className = 'x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j x1nhvcw1 x1q0g3np x1cy8zhl x100vrsf x1vqgdyp xhslqc4 x1ekkm8c x1143rjc xum4auv xj21bgg x1277o0a x13i9f1t xr9ek0c xjpr12u';
  
  // Span contenedor
  const span = document.createElement('span');
  span.className = 'html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs x4k7w5x x1h91t0o x1h9r5lt x1jfb8zj xv2umb2 x1beo9mf xaigb6o x12ejxvf x3igimt xarpa2k xedcshv x1lytzrv x1t2pt76 x7ja8zs x1qrby5j';
  
  // Crear el botón con las mismas clases que Communities
  const button = document.createElement('button');
  button.id = 'whatsapp-focus-toggle';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', 'Focus Mode');
  button.setAttribute('tabindex', '-1');
  button.setAttribute('data-navbar-item', 'true');
  button.setAttribute('data-navbar-item-selected', 'false');
  button.className = 'xjb2p0i xk390pu x1heor9g x1ypdohk xjbqb8w x972fbf x10w94by x1qhh985 x14e42zd xtnn1bt x9v5kkp xmw7ebm xrdum7p xt8t1vi x1xc408v x129tdwq x15urzxu xh8yej3 x1y1aw1k xf159sx xwib8y2 xmzvs34';
  button.title = 'Alternar modo focus (Ocultar/Mostrar lista de chats)';
  
  // Estructura interna del botón (igual que Communities)
  const buttonInnerDiv1 = document.createElement('div');
  buttonInnerDiv1.className = 'x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j x1nhvcw1 x1q0g3np x6s0dn4 xh8yej3';
  
  const buttonInnerDiv2 = document.createElement('div');
  buttonInnerDiv2.className = 'x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j x1nhvcw1 x1q0g3np x6s0dn4 x1n2onr6';
  buttonInnerDiv2.style.flexGrow = '1';
  
  const iconContainer = document.createElement('div');
  const iconSpan = document.createElement('span');
  iconSpan.setAttribute('aria-hidden', 'true');
  iconSpan.setAttribute('data-icon', 'eye');
  
  // Crear el ícono SVG del ojo
  const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  iconSvg.setAttribute('viewBox', '0 0 24 24');
  iconSvg.setAttribute('height', '24');
  iconSvg.setAttribute('width', '24');
  iconSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  iconSvg.setAttribute('fill', 'none');
  
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
  title.textContent = 'eye';
  iconSvg.appendChild(title);
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');
  path.setAttribute('fill', 'currentColor');
  iconSvg.appendChild(path);
  
  iconSpan.appendChild(iconSvg);
  iconContainer.appendChild(iconSpan);
  buttonInnerDiv2.appendChild(iconContainer);
  buttonInnerDiv1.appendChild(buttonInnerDiv2);
  button.appendChild(buttonInnerDiv1);
  span.appendChild(button);
  containerDiv.appendChild(span);
  
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFocusMode();
  });
  
  // Insertar el contenedor completo después del contenedor de Communities
  let inserted = false;
  
  if (communitiesContainer && communitiesContainer.parentElement) {
    const parent = communitiesContainer.parentElement;
    const nextSibling = communitiesContainer.nextElementSibling;
    
    if (nextSibling) {
      parent.insertBefore(containerDiv, nextSibling);
    } else {
      parent.appendChild(containerDiv);
    }
    inserted = true;
  }
  
  // Si no se pudo insertar, intentar buscar el header y encontrar el contenedor correcto
  if (!inserted) {
    const header = document.querySelector('header[data-tab="2"]');
    if (header) {
      // Buscar el div que contiene los botones de navegación
      const navContainer = header.querySelector('div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.x78zum5');
      if (navContainer) {
        // Buscar el contenedor de Communities dentro de este
        const communitiesContainerInNav = navContainer.querySelector('div.x100vrsf.x1vqgdyp.xhslqc4');
        if (communitiesContainerInNav && communitiesContainerInNav.parentElement) {
          const parent = communitiesContainerInNav.parentElement;
          const nextSibling = communitiesContainerInNav.nextElementSibling;
          if (nextSibling) {
            parent.insertBefore(containerDiv, nextSibling);
          } else {
            parent.appendChild(containerDiv);
          }
          inserted = true;
        }
      }
    }
  }
  
  if (inserted) {
    toggleButton = button;
    updateButtonState();
    
    // Verificar que el botón sea visible
    const rect = button.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      // El botón no es visible, intentar hacerlo visible
      button.style.display = 'flex';
      button.style.visibility = 'visible';
      button.style.opacity = '1';
    }
    
    return true;
  }
  
  return false;
}

// Función para actualizar el estado visual del botón
function updateButtonState() {
  if (toggleButton) {
    // Buscar el SVG dentro del botón
    const iconSpan = toggleButton.querySelector('span[data-icon]');
    const svg = iconSpan?.querySelector('svg');
    
    if (svg) {
      // Limpiar el SVG actual
      svg.innerHTML = '';
      
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = 'eye';
      svg.appendChild(title);
      
      const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path1.setAttribute('d', 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');
      path1.setAttribute('fill', 'currentColor');
      svg.appendChild(path1);
      
      if (isFocusModeActive) {
        // Agregar línea de tachado para indicar que está activo
        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttribute('d', 'M1 1l22 22');
        path2.setAttribute('stroke', 'currentColor');
        path2.setAttribute('stroke-width', '2');
        path2.setAttribute('stroke-linecap', 'round');
        svg.appendChild(path2);
        toggleButton.setAttribute('aria-pressed', 'true');
        toggleButton.title = 'Mostrar lista de chats';
      } else {
        toggleButton.setAttribute('aria-pressed', 'false');
        toggleButton.title = 'Ocultar lista de chats';
      }
    }
  }
}

// Función principal para alternar el modo focus
async function toggleFocusMode() {
  isFocusModeActive = !isFocusModeActive;
  await setState(isFocusModeActive);
  toggleChatSidebar(!isFocusModeActive);
  updateButtonState();
  
  // Notificar al background script
  chrome.runtime.sendMessage({
    action: 'focusModeChanged',
    enabled: isFocusModeActive
  });
}

// Función para inicializar el estado
async function initialize() {
  isFocusModeActive = await getState();
  
  // Esperar a que la página cargue completamente
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(setupExtension, 1000);
    });
  } else {
    setTimeout(setupExtension, 1000);
  }
}

// Función para configurar la extensión
function setupExtension(retryCount = 0) {
  const maxRetries = 20; // Aumentar reintentos
  
  // Intentar crear el botón
  const buttonCreated = createToggleButton();
  
  // Verificar que el botón se creó y es visible
  const button = document.getElementById('whatsapp-focus-toggle');
  let buttonIsVisible = false;
  
  if (button) {
    const rect = button.getBoundingClientRect();
    buttonIsVisible = rect.width > 0 && rect.height > 0 && 
                      rect.top >= 0 && rect.left >= 0 &&
                      window.getComputedStyle(button).display !== 'none' &&
                      window.getComputedStyle(button).visibility !== 'hidden';
  }
  
  // Si el botón no se creó o no es visible, y aún tenemos intentos, reintentar
  if ((!buttonCreated || !buttonIsVisible) && retryCount < maxRetries) {
    // Usar intervalos más cortos al principio, más largos después
    const delay = retryCount < 5 ? 300 : retryCount < 10 ? 500 : 1000;
    setTimeout(() => {
      setupExtension(retryCount + 1);
    }, delay);
    
    // Si el botón existe pero no es visible, intentar hacerlo visible
    if (button && !buttonIsVisible) {
      button.style.display = 'flex';
      button.style.visibility = 'visible';
      button.style.opacity = '1';
    }
    
    return;
  }
  
  // Aplicar el estado inicial
  toggleChatSidebar(!isFocusModeActive);
  updateButtonState();
  
  // Observar cambios en el DOM por si WhatsApp Web carga dinámicamente
  let lastButtonParent = null;
  const observer = new MutationObserver(() => {
    const currentButton = document.getElementById('whatsapp-focus-toggle');
    
    // Si el botón no existe, intentar crearlo
    if (!currentButton) {
      createToggleButton();
      toggleChatSidebar(!isFocusModeActive);
      updateButtonState();
      return;
    }
    
    // Verificar que el contenedor del botón esté en la posición correcta (después del contenedor de Communities)
    const communitiesContainer = findCommunitiesContainer();
    if (communitiesContainer && currentButton) {
      // Encontrar el contenedor padre de nuestro botón
      let currentContainer = currentButton.closest('div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.x78zum5.xozqiw3.x1oa3qoh.x12fk4p8.xeuugli.x2lwn1j.x1nhvcw1.x1q0g3np.x1cy8zhl.x100vrsf.x1vqgdyp.xhslqc4');
      
      if (currentContainer) {
        const currentParent = currentContainer.parentElement;
        const communitiesParent = communitiesContainer.parentElement;
        
        // Si el contenedor no está en el mismo padre que Communities, moverlo
        if (currentParent !== communitiesParent) {
          const nextSibling = communitiesContainer.nextElementSibling;
          if (nextSibling) {
            communitiesParent.insertBefore(currentContainer, nextSibling);
          } else {
            communitiesParent.appendChild(currentContainer);
          }
          lastButtonParent = communitiesParent;
        } else {
          // Verificar que esté justo después del contenedor de Communities
          const nextSibling = communitiesContainer.nextElementSibling;
          if (nextSibling !== currentContainer) {
            // El contenedor no está en la posición correcta, reubicarlo
            if (currentParent) {
              currentParent.removeChild(currentContainer);
            }
            const nextSib = communitiesContainer.nextElementSibling;
            if (nextSib) {
              communitiesParent.insertBefore(currentContainer, nextSib);
            } else {
              communitiesParent.appendChild(currentContainer);
            }
          }
          lastButtonParent = currentParent;
        }
      } else {
        const currentParent = currentButton.parentElement;
        lastButtonParent = currentParent;
      }
    } else {
      const currentParent = currentButton?.parentElement;
      lastButtonParent = currentParent;
    }
    
    // Reaplicar el estado si el sidebar cambia
    toggleChatSidebar(!isFocusModeActive);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false
  });
  
  // Verificación periódica para asegurar que el botón esté visible
  setInterval(() => {
    const currentButton = document.getElementById('whatsapp-focus-toggle');
    if (!currentButton) {
      // Si el botón no existe, intentar crearlo
      createToggleButton();
    } else {
      // Verificar que el botón sea visible
      const rect = currentButton.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0;
      const computedStyle = window.getComputedStyle(currentButton);
      const isDisplayed = computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';
      
      if (!isVisible || !isDisplayed) {
        // Hacer el botón visible
        currentButton.style.display = 'flex';
        currentButton.style.visibility = 'visible';
        currentButton.style.opacity = '1';
      }
      
      // Verificar que esté en la posición correcta
      const communitiesContainer = findCommunitiesContainer();
      if (communitiesContainer) {
        const currentContainer = currentButton.closest('div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.x78zum5.xozqiw3.x1oa3qoh.x12fk4p8.xeuugli.x2lwn1j.x1nhvcw1.x1q0g3np.x1cy8zhl.x100vrsf.x1vqgdyp.xhslqc4');
        if (currentContainer && currentContainer.parentElement !== communitiesContainer.parentElement) {
          // Reubicar el contenedor
          const nextSibling = communitiesContainer.nextElementSibling;
          if (nextSibling) {
            communitiesContainer.parentElement.insertBefore(currentContainer, nextSibling);
          } else {
            communitiesContainer.parentElement.appendChild(currentContainer);
          }
        }
      }
    }
  }, 2000); // Verificar cada 2 segundos
}

// Escuchar mensajes del background script
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
    sendResponse({ success: true });
  }
  return true;
});

// Inicializar cuando el script se carga
initialize();

