# WhatsApp Focus - Chrome Extension

A Chrome extension that enhances your WhatsApp Web experience by allowing you to hide the chat list sidebar, helping you focus on the current conversation without distractions.

## 🎯 Overview

WhatsApp Focus adds a toggle button to WhatsApp Web that collapses the chat list sidebar with smooth animations, giving you more screen space and reducing visual clutter. The extension integrates seamlessly into WhatsApp Web's interface and maintains your preference across page reloads.

## ✨ Features

- **🎨 Seamless Integration**: Toggle button integrated into WhatsApp Web's navigation bar
- **⌨️ Keyboard Shortcut**: Quick toggle with `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac)
- **🎭 Smooth Animations**: Animated sidebar collapse/expand with resize effects
- **💾 State Persistence**: Remembers your preference across page reloads
- **🖱️ Multiple Control Methods**: Button, keyboard shortcut, or extension popup
- **📱 Responsive Design**: Works with WhatsApp Web's dynamic layout

## 🚀 Quick Start

### Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right corner)
3. Click **Load unpacked extension**
4. Select the `whatsapp-focus-extension` folder
5. Done! The extension is now installed

### Usage

#### Method 1: Toggle Button
- Open [WhatsApp Web](https://web.whatsapp.com)
- Look for the eye icon (👁️) button in the navigation sidebar
- Click to toggle focus mode on/off

#### Method 2: Keyboard Shortcut
- Press `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac)
- The sidebar will collapse/expand automatically

#### Method 3: Extension Popup
- Click the extension icon in Chrome's toolbar
- Use the toggle button in the popup interface

## 🔧 How It Works

### Core Functionality

The extension operates through a multi-component architecture:

1. **Content Script Injection**
   - Automatically injected into WhatsApp Web pages when they load
   - Runs at `document_idle` to ensure DOM is ready
   - Monitors page structure using `MutationObserver` for dynamic content

2. **Toggle Button Integration**
   - Dynamically creates a button matching WhatsApp Web's design system
   - Inserts the button after the Communities icon in the navigation bar
   - Button uses the same HTML structure and classes as native WhatsApp buttons
   - Automatically repositions if WhatsApp Web restructures the DOM

3. **Sidebar Collapse Mechanism**
   - Identifies the sidebar container using the `.x18dvir5` class
   - Manipulates flex properties (`flex: 0 0 30%` → `flex: 0 0 0%`) for smooth resize
   - Applies CSS transitions for animated collapse/expand
   - Hides sidebar content with fade-out effect after resize

4. **State Management**
   - Uses Chrome Storage API to persist focus mode state
   - Synchronizes state across all WhatsApp Web tabs
   - Restores state on page reload

5. **Animation System**
   - Two-phase animation: resize first, then fade-out
   - Uses CSS transitions with cubic-bezier easing
   - Main chat area expands automatically when sidebar collapses

### Technical Architecture

- **Manifest V3**: Latest Chrome Extensions API for better security and performance
- **Service Worker**: Handles keyboard shortcuts and global state
- **Content Scripts**: DOM manipulation and UI integration
- **Storage API**: Persistent state management
- **MutationObserver**: Reactive DOM monitoring for dynamic content

For detailed technical information, see [Architecture Documentation](./docs/ARCHITECTURE.md).

## 📁 Project Structure

```
whatsapp-focus-extension/
├── src/
│   ├── background/          # Service worker for keyboard shortcuts
│   ├── content/             # Content scripts and styles
│   ├── popup/               # Extension popup UI
│   └── utils/               # Shared utilities
├── assets/                  # Static assets (icons)
├── scripts/                 # Development tools
├── docs/                    # Detailed documentation
├── manifest.json            # Extension configuration
└── README.md               # This file
```

## 📖 Documentation

Detailed documentation is available in the [`docs/`](./docs/) folder:

- **[Architecture](./docs/ARCHITECTURE.md)**: System architecture, components, and data flow
- **[Icons Guide](./docs/ICONS.md)**: Complete guide for creating and generating extension icons
- **[Development Guide](./docs/DEVELOPMENT.md)**: Setup, debugging, and development best practices

## 🛠️ Development

### Prerequisites

- Chrome 88+ (Manifest V3 support)
- Node.js (optional, for icon generation)

### Setup

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable Developer mode
4. Load the extension as unpacked

### Making Changes

1. Edit files in the `src/` directory
2. Go to `chrome://extensions/`
3. Click the reload button (🔄) on the extension card
4. Reload WhatsApp Web to see changes

### Building Icons

See [docs/ICONS.md](./docs/ICONS.md) for detailed instructions on generating extension icons.


## 🔍 Troubleshooting

### Extension doesn't work
- Ensure you're on `https://web.whatsapp.com/`
- Verify the extension is enabled in `chrome://extensions/`
- Reload the WhatsApp Web page

### Button doesn't appear
- Wait a few seconds after loading WhatsApp Web (DOM needs to load)
- The extension retries up to 20 times with adaptive delays
- If it persists, reload the page

### Keyboard shortcut doesn't work
- Ensure you're on the WhatsApp Web page
- Check for conflicts with other extensions
- Customize the shortcut in `chrome://extensions/shortcuts`

### Sidebar doesn't collapse properly
- Clear browser cache and reload
- Check browser console for errors
- Ensure you're using a compatible browser (Chrome 88+)

## 🌐 Compatibility

- **Chrome 88+** (requires Manifest V3)
- **Edge 88+** (Chromium-based)
- **Other Chromium-based browsers** with Manifest V3 support

## 📝 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions are welcome! Please ensure your code follows the existing architecture and style guidelines. See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) for development guidelines.

## 📧 Support

For issues, questions, or suggestions, please open an issue on the project repository.
