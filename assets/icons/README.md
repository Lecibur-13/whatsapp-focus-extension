# Extension Icons

This directory contains the extension icons required for WhatsApp Focus.

## Required Files

- `icon16.png` - 16×16 pixels (toolbar icon)
- `icon48.png` - 48×48 pixels (extension management page)
- `icon128.png` - 128×128 pixels (Chrome Web Store)
- `icon.svg` - Source vector file (optional)

## Quick Start

For detailed instructions on generating icons, see **[docs/ICONS.md](../../docs/ICONS.md)**.

### Quick Generation

**Option 1: HTML Generator (Recommended)**
1. Open `scripts/create-icons.html` in your browser
2. Click "Download All Icons"
3. Place downloaded files in this directory

**Option 2: Node.js Script**
```bash
npm run generate-icons
```

## Notes

- Icons should be PNG format with transparent background
- Use WhatsApp green (#25D366) as the primary color
- Design should be recognizable at small sizes (16×16)
- See [docs/ICONS.md](../../docs/ICONS.md) for complete guide with all methods

