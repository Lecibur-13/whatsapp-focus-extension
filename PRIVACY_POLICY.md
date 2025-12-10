# Privacy Policy

**Last Updated:** [Current Date]

## 1. General Information

WhatsApp Focus ("the Extension") is a Chrome extension developed to enhance the user experience on WhatsApp Web. This privacy policy describes how the Extension handles information and what data it collects, if any.

## 2. Data Collection

**The Extension does NOT collect any personal data or user information.**

Specifically:
- We do not collect messages, conversations, or chat content
- We do not collect contact information or profiles
- We do not collect usage data or behavior
- We do not send information to external servers
- We do not use analytics or tracking services
- We do not share data with third parties

## 3. Local Storage

The Extension uses only the browser's local storage (Chrome Storage API) to save a single user preference:
- **focusMode**: A boolean value (true/false) indicating whether focus mode is active
- **lastUpdate**: A timestamp of the last update (optional, for internal synchronization)

This information is stored exclusively on the user's device and is never transmitted outside the browser. Users can delete this data at any time by uninstalling the extension or clearing the browser's storage.

## 4. Extension Permissions

The Extension requests the following permissions:
- **activeTab**: To allow the popup to communicate with the active WhatsApp Web tab
- **storage**: To save the focus mode preference locally
- **scripting**: To allow the keyboard shortcut to work correctly
- **Host Permission (web.whatsapp.com)**: To inject content scripts that modify the WhatsApp Web interface

These permissions are essential for the Extension's functionality and are not used to collect or transmit personal data.

## 5. How It Works

The Extension operates entirely locally in the user's browser. All code runs on the user's device and does not require connection to external servers for basic functionality. There is no communication with remote servers, external APIs, or third-party services.

## 6. Open Source

The Extension's source code is publicly available and can be reviewed by anyone. This ensures transparency about how the Extension works and what it does with user data (in this case, nothing).

## 7. Changes to This Policy

We reserve the right to update this privacy policy. Any significant changes will be notified to users through an Extension update. The date of the last update is indicated at the beginning of this document.

## 8. Contact

If you have questions about this privacy policy or how the Extension works, you can:
- Open an issue in the project repository
- Review the source code to verify functionality

## 9. Consent

By using this Extension, you agree to this privacy policy. If you do not agree with this policy, please do not use the Extension.

---

*WhatsApp is a trademark of WhatsApp Inc. This extension is an independent project and is not affiliated with WhatsApp or WhatsApp Inc.*

