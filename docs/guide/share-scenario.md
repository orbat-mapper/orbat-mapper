# Share Scenarios as URL

ORBAT Mapper allows you to share small scenarios directly via a URL. This feature encodes the
entire scenario data into a compressed string and appends it to the URL, allowing you to
share your work without needing a server or account.

::: warning
Only use this feature for small to medium-sized scenarios. Larger scenarios may generate URLs that exceed browser or chat application limits.
Always test the generated link to ensure it works as expected.

Anyone with the link has full access to the scenario data contained in it.
:::

## How to Share

1. Open the scenario you want to share.
2. Open the main menu and open the **File** menu.
3. Select the **Share as URL** option.
4. Click **Copy Link** to copy the generated URL to your clipboard.

You can now paste this link into emails, chat apps, or documents.

## Importing a Shared Scenario

When a recipient opens the shared link, they will be presented with an import screen showing:

- **Scenario Name & Description**: Preview of what's being imported.
- **Unit & Side Count**: Quick summary of the scenario size.

### Import Actions

Depending on whether a scenario with the same ID already exists in the recipient's browser, different options will be available:

- **Load Scenario**: If the scenario is new to your browser, you can load it directly.
- **Overwrite**: If a scenario with the same ID exists, you can choose to replace your existing version with the imported one.
- **Create Copy**: Safely import the scenario as a new copy with a unique ID (appended with "(copy)"), preserving your existing version.

### URL Length Limits

Because the entire scenario is encoded in the URL, complex scenarios with many thousands of units may generate extremely long links.

- Some browsers or chat applications may truncate very long URLs (typically around 2000-8000 characters).
- If a scenario is too large, you may need to export it as a file (JSON) instead.
