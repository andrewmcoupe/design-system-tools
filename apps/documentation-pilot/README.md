# 👩‍✈️ Documentation Pilot 🧑‍✈️

This VS Code extension is ideal for linking code to external documentation. After configuring the extension, Documentation Pilot provides a hover tooltip over any configured items, allowing you and your team to view documentation inside VS Code!

## Features

- 🚁 Hover over a configured item to see the documentation link
- 👓 View documentation inside VS Code
- 🪟 Custom documentation web view title
- 🔡 Custom documentation link text

## 👇 Requirements

The extension requires the following workspace settings to work correctly:

- `documentation-pilot.packages`: An array of packages where your items may be imported from.
- `documentation-pilot.data`: An object in the following format

  ```json
  {
    "Button": {
      "url": "https://link-to-documentation.com"
    },
    "Text": {
      "url": "https://link-to-documentation.com"
    }
  }
  ```

  Essentially, when hovering over some code, the extension will look for the code being hovered in the `documentation-pilot.data` object. If it finds it, and it is imported from a package inside `documentation-pilot.packages` it will display the documentation link and allow you to view it inside the editor.

## Additional Settings

- `documentation-pilot.webViewTabTitle`: A string which will be the title of the tab opened inside the editor when clicking to view documentation.
- `documentation-pilot.customLinkText`: A string which will be the text displayed in the hover tooltip - defaults to 'View Documentation'.
