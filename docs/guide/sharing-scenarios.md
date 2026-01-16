# Sharing Scenarios

ORBAT Mapper provides two ways to share your scenarios with others: **Share scenario online** (cloud-based) and **Share as URL** (client-side encoding).

## Share Scenario Online

The "Share scenario online" feature uploads your scenario to an ORBAT Mapper cloud service and generates a shareable link. This is the recommended method for sharing most scenarios, especially larger ones.

### How to Share

1. Open the scenario you want to share.
2. Open the main menu and open the **File** menu.
3. Select **Share scenario online...**.
4. Click **Upload and generate link** to upload your scenario.
5. Once uploaded, click **Copy Link** to copy the generated URL to your clipboard.

You can now paste this link into emails, chat apps, or documents.

### Encrypting Scenarios

You can optionally encrypt your scenario before sharing it. This ensures that only people with the password can view the scenario content.

1. Toggle the **Encrypt scenario** switch.
2. Enter a strong **Password**.
3. Optionally, add a **Description**.
   ::: warning
   The description is **not encrypted** and will be visible to anyone with the link. Do not put sensitive information in the description.
   :::
4. Click **Upload and generate link**.

#### Security Details

ORBAT Mapper uses robust client-side encryption. The server only receives encrypted data and never sees your password or the unencrypted scenario.

- **Algorithm**: AES-GCM (256-bit key)
- **Key Derivation**: PBKDF2 (SHA-256)
- **Data Integrity**: The encryption includes an integrity check to prevent tampering.

### Important Notes

- **Link expiration**: Generated links are valid for **30 days** from creation.
- **Privacy**: Anyone with the link can view the scenario (unless encrypted). Be careful when sharing sensitive or private scenarios.
- **Upload limits**: There is an hourly upload limit to prevent abuse. If you encounter rate limiting, wait and try again later.
- **Size limits**: Very large scenarios may exceed the maximum upload size. In such cases, consider exporting the scenario as a JSON file.

::: warning
The scenario is uploaded to the cloud and stored temporarily. Anyone with the link can access the full scenario data. Do not share sensitive or confidential information using this feature unless you use the encryption option.
:::

---

## Share Scenario as URL

ORBAT Mapper also allows you to share small scenarios directly via a URL. This feature encodes the
entire scenario data into a compressed string and appends it to the URL, allowing you to
share your work without needing a server or account.

::: warning
Only use this feature for small to medium-sized scenarios. Larger scenarios may generate URLs that exceed browser or chat application limits.
Always test the generated link to ensure it works as expected.

Anyone with the link has full access to the scenario data contained in it.
:::

### How to Share

1. Open the scenario you want to share.
2. Open the main menu and open the **File** menu.
3. Select **Share scenario as URL...**.
4. Click **Copy Link** to copy the generated URL to your clipboard.

You can now paste this link into emails, chat apps, or documents.

### URL Length Limits

Because the entire scenario is encoded in the URL, complex scenarios with many thousands of units may generate extremely long links.

- Some browsers or chat applications may truncate very long URLs (typically around 2000-8000 characters).
- If a scenario is too large, consider using "Share scenario online" instead or export as a file (JSON).

---

## Importing a Shared Scenario

When a recipient opens a shared link (from either sharing method), they will be presented with an import screen showing:

- **Scenario Name & Description**: Preview of what's being imported.
- **Unit & Side Count**: Quick summary of the scenario size.

If the scenario is **encrypted**, you will see the description (if provided) and a prompt to enter the password. You must enter the correct password to decrypt and view the scenario details.

### Import Actions

Depending on whether a scenario with the same ID already exists in the recipient's browser, different options will be available:

- **Load Scenario**: If the scenario is new to your browser, you can load it directly.
- **Overwrite**: If a scenario with the same ID exists, you can choose to replace your existing version with the imported one.
- **Create Copy**: Safely import the scenario as a new copy with a unique ID (appended with "(copy)"), preserving your existing version.
