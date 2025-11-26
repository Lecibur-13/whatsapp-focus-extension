# Icon Generation Guide

This guide explains how to create and generate the extension icons required for WhatsApp Focus.

## Required Icons

The extension requires icons in the following sizes:

- **icon16.png** - 16×16 pixels (toolbar icon)
- **icon48.png** - 48×48 pixels (extension management page)
- **icon128.png** - 128×128 pixels (Chrome Web Store)

All icons should be PNG format with transparent background (recommended).

## Icon Design

The current icon design features:
- **Background**: WhatsApp green (#25D366) with rounded corners
- **Icon**: Eye symbol representing "focus" or "visibility"
- **Style**: Minimalist and modern, consistent with WhatsApp's design language

### Design Specifications

- **Color**: Primary green `#25D366` (WhatsApp brand color)
- **Shape**: Rounded square (15% border radius)
- **Icon**: Eye with pupil and highlight
- **Format**: PNG with transparency

## Generation Methods

### Method 1: HTML Generator (Recommended)

The easiest way to generate icons without any dependencies:

1. Open `scripts/create-icons.html` in your browser
2. Icons will be generated automatically on page load
3. Click **"Download All Icons"** or download each icon individually
4. Save the files to `assets/icons/` with the correct names:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

**Advantages:**
- No installation required
- Works in any modern browser
- Visual preview of all sizes
- Instant download

### Method 2: Node.js Script

For automated icon generation using Node.js:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the generation script:
   ```bash
   npm run generate-icons
   ```

3. Icons will be generated in `assets/icons/` directory

**Note:** This method requires Node.js and the `sharp` package. The script will automatically install `sharp` if it's not present.

**Advantages:**
- Automated generation
- Consistent output
- Can be integrated into build processes

### Method 3: Online Tools

You can use online icon generators:

- **[Favicon Generator](https://www.favicon-generator.org/)** - Upload an image and generate multiple sizes
- **[RealFaviconGenerator](https://realfavicongenerator.net/)** - Comprehensive favicon and icon generator
- **[IconKitchen](https://icon.kitchen/)** - Google's icon generator

**Steps:**
1. Create or upload a 128×128 pixel image
2. Generate icons in the required sizes
3. Download and place in `assets/icons/`

### Method 4: Design Software

Create icons manually using design tools:

**Recommended Tools:**
- **Figma** (free, web-based)
- **Adobe Photoshop**
- **GIMP** (free, open-source)
- **Canva** (web-based)

**Guidelines:**
- Start with a 128×128 pixel canvas
- Use WhatsApp green (#25D366) as primary color
- Design should be recognizable at 16×16 pixels
- Export as PNG with transparency
- Scale down to create 48×48 and 16×16 versions

## File Structure

After generation, your `assets/icons/` folder should contain:

```
assets/icons/
├── icon16.png    (16×16 pixels)
├── icon48.png    (48×48 pixels)
├── icon128.png   (128×128 pixels)
└── icon.svg      (optional, source file)
```

## Verification

After generating icons:

1. Check file sizes match requirements
2. Verify icons display correctly in Chrome's extension management
3. Test the extension popup icon
4. Ensure icons are visible in dark and light themes

## Troubleshooting

### Icons don't appear in Chrome
- Verify file names match exactly: `icon16.png`, `icon48.png`, `icon128.png`
- Check file paths in `manifest.json` are correct
- Ensure files are in `assets/icons/` directory
- Reload the extension in `chrome://extensions/`

### Icons look pixelated
- Regenerate from a higher resolution source (at least 128×128)
- Use vector graphics (SVG) as source if possible
- Avoid scaling up smaller images

### Icons have wrong background
- Ensure PNG files have transparent backgrounds
- Check that the design uses the correct green color (#25D366)
- Verify rounded corners are applied correctly

## Customization

To customize the icon design:

1. **Modify HTML Generator**: Edit `scripts/create-icons.html` to change colors, shapes, or design
2. **Update SVG Template**: Modify the SVG template in `scripts/generate-icons.js`
3. **Create New Design**: Use design software to create a new icon set

Remember to maintain:
- WhatsApp brand color (#25D366)
- Recognizable design at small sizes
- Consistent style across all sizes

## Additional Resources

- [Chrome Extension Icons Guide](https://developer.chrome.com/docs/extensions/mv3/user_interface/#icons)
- [Material Design Icons](https://fonts.google.com/icons)
- [Icon Design Best Practices](https://developer.chrome.com/docs/extensions/mv3/user_interface/#icons)

