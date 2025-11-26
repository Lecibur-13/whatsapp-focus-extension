# Development Guide

This guide provides information for developers who want to contribute to or modify the WhatsApp Focus extension.

## Development Setup

### Prerequisites

- **Chrome 88+** or **Edge 88+** (Manifest V3 support required)
- **Node.js** (optional, for icon generation scripts)
- Basic knowledge of JavaScript, HTML, and CSS

### Initial Setup

1. Clone or download the repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the project folder
5. The extension should now be loaded and active

## Project Structure

```
whatsapp-focus-extension/
├── src/
│   ├── background/          # Background service worker
│   │   └── service-worker.js
│   ├── content/             # Content scripts
│   │   ├── content.js       # Main logic
│   │   └── styles.css       # WhatsApp Web modifications
│   ├── popup/               # Extension popup
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   └── utils/               # Shared utilities
│       └── storage.js
├── assets/                  # Static assets
│   └── icons/               # Extension icons
├── scripts/                 # Development tools
│   ├── generate-icons.js
│   └── create-icons.html
├── docs/                    # Documentation
├── manifest.json            # Extension manifest
└── package.json             # Dependencies
```

## Development Workflow

### Making Changes

1. **Edit Source Files**: Modify files in the `src/` directory
2. **Reload Extension**: 
   - Go to `chrome://extensions/`
   - Click the reload button (🔄) on the extension card
3. **Test Changes**: 
   - Reload WhatsApp Web page
   - Test the functionality
   - Check browser console for errors

### Debugging

#### Content Script Debugging

1. Open WhatsApp Web
2. Right-click and select **Inspect**
3. Go to the **Console** tab
4. Look for errors or log messages
5. Use `console.log()` in `src/content/content.js` for debugging

#### Background Script Debugging

1. Go to `chrome://extensions/`
2. Find the extension
3. Click **Service worker** link (opens DevTools)
4. Check console for errors

#### Popup Debugging

1. Right-click the extension icon
2. Select **Inspect popup**
3. DevTools will open for the popup

### Code Style Guidelines

- **JavaScript**: Use modern ES6+ syntax
- **Comments**: Code in English, comments in Spanish (as per user preference)
- **Naming**: Use descriptive camelCase for variables and functions
- **Formatting**: Follow existing code style in the project

## Key Components

### Content Script (`src/content/content.js`)

The main script that:
- Finds and manipulates WhatsApp Web DOM
- Creates the toggle button
- Handles sidebar collapse/expand
- Manages extension state

**Key Functions:**
- `findChatSidebar()` - Locates the chat sidebar
- `findSidebarContainer()` - Finds the flex container
- `createToggleButton()` - Creates and injects the toggle button
- `toggleChatSidebar()` - Handles collapse/expand logic

### Background Service Worker (`src/background/service-worker.js`)

Handles:
- Keyboard shortcut commands
- Global state management
- Message routing between components

### Popup (`src/popup/`)

User interface that:
- Displays current focus mode status
- Provides toggle button
- Shows keyboard shortcut information

## Testing

### Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] Toggle button appears in navigation bar
- [ ] Button click toggles sidebar correctly
- [ ] Keyboard shortcut works
- [ ] Popup displays correct state
- [ ] State persists after page reload
- [ ] Animations are smooth
- [ ] Works on different screen sizes

### Browser Compatibility

Test on:
- Latest Chrome
- Latest Edge
- Other Chromium-based browsers

## Common Issues and Solutions

### Button doesn't appear

**Cause**: WhatsApp Web's DOM not fully loaded

**Solution**: 
- The extension has retry logic (up to 20 attempts)
- Check browser console for errors
- Verify `findCommunitiesContainer()` finds the target

### Sidebar doesn't collapse

**Cause**: WhatsApp Web structure changed

**Solution**:
- Update selectors in `findSidebarContainer()`
- Check if `.x18dvir5` class still exists
- Verify flex properties are being applied

### State not persisting

**Cause**: Storage API issues

**Solution**:
- Check Chrome storage permissions in manifest
- Verify `chrome.storage.local` is accessible
- Check for storage quota issues

## Building and Distribution

### Preparing for Distribution

1. **Generate Icons**: Ensure all icons are in `assets/icons/`
2. **Update Version**: Update version in `manifest.json`
3. **Test Thoroughly**: Run through all functionality
4. **Check Manifest**: Verify all paths are correct

### Creating Extension Package

1. Go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Pack extension**
4. Select the extension root directory
5. Chrome will create a `.crx` file

### Chrome Web Store Submission

1. Create a developer account
2. Prepare store listing (screenshots, description)
3. Upload the `.zip` file (not `.crx`)
4. Complete store listing information
5. Submit for review

## Best Practices

### Performance

- Minimize DOM queries
- Use `MutationObserver` efficiently
- Avoid blocking operations
- Cache frequently accessed elements

### Security

- Never inject external scripts
- Validate all user inputs
- Use Chrome Storage API securely
- Follow Manifest V3 security guidelines

### Maintainability

- Keep functions small and focused
- Use descriptive variable names
- Comment complex logic
- Follow the existing architecture

## Resources

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Content Scripts Guide](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)

## Contributing

When contributing:

1. Follow the existing code structure
2. Test your changes thoroughly
3. Update documentation if needed
4. Keep commits focused and descriptive
5. Ensure code works across different browsers

For questions or issues, please open an issue on the repository.

