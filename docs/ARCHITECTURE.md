# Architecture

## Project Structure

```
whatsapp-focus-extension/
├── src/
│   ├── background/          # Background service worker
│   │   └── service-worker.js
│   ├── content/             # Content scripts injected into WhatsApp Web
│   │   ├── content.js       # Main content script
│   │   └── styles.css       # Styles for WhatsApp Web modifications
│   ├── popup/               # Extension popup UI
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   └── utils/               # Shared utilities
│       └── storage.js       # Storage helper functions
├── assets/                  # Static assets
│   └── icons/               # Extension icons
│       ├── icon16.png
│       ├── icon48.png
│       ├── icon128.png
│       └── icon.svg
├── scripts/                 # Development scripts
│   ├── generate-icons.js    # Node.js script to generate icons
│   └── create-icons.html    # HTML tool to generate icons
├── manifest.json            # Extension manifest
├── package.json             # Node.js dependencies
├── README.md                # Main project documentation
├── docs/                     # Detailed documentation
│   ├── ARCHITECTURE.md      # This file
│   ├── ICONS.md             # Icon generation guide
│   └── DEVELOPMENT.md       # Development guide
└── .gitignore              # Git ignore rules
```

## Components

### Background Service Worker (`src/background/service-worker.js`)
- Handles keyboard shortcuts
- Manages global extension state
- Listens for messages from content scripts and popup

### Content Script (`src/content/content.js`)
- Injected into WhatsApp Web pages
- Creates and manages the toggle button
- Handles sidebar collapse/expand animations
- Communicates with background script

### Content Styles (`src/content/styles.css`)
- Styles for the toggle button
- Sidebar collapse animations
- Focus mode visual states

### Popup (`src/popup/`)
- User interface for the extension
- Displays current focus mode status
- Allows toggling focus mode
- Shows keyboard shortcut information

### Utilities (`src/utils/`)
- Shared helper functions
- Storage abstraction layer

## Data Flow

1. **User Action** → Popup/Keyboard Shortcut/Button Click
2. **Message** → Background Service Worker or Content Script
3. **State Update** → Chrome Storage API
4. **UI Update** → Content Script modifies DOM
5. **Visual Feedback** → CSS animations and state changes

## Key Design Decisions

- **Manifest V3**: Uses the latest Chrome Extensions API
- **Separation of Concerns**: Background, content, and popup are separate
- **Modular Structure**: Utilities are separated for reusability
- **Asset Organization**: Icons and static files in dedicated folders
- **Development Tools**: Scripts folder for build and generation tools

