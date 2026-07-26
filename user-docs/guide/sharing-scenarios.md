# Share scenarios

ORBAT Mapper gives you two methods to share your scenarios with other persons: **Share scenario online** (it uses the
cloud) and **Share as URL** (the client encodes the data).

## Share a scenario online

The "Share scenario online" function sends your scenario to an ORBAT Mapper cloud service. The service then makes a
link that you can share. Use this method for almost all scenarios, and especially for large scenarios.

### How to share

1. Open the scenario that you want to share.
2. Open the main menu, then open the **File** menu.
3. Select **Share scenario online...**.
4. Click **Upload and generate link** to send your scenario.
5. When the upload is complete, click **Copy Link**. The application copies the URL to your clipboard.

You can now put this link in emails, chat applications or documents.

### Encrypt scenarios

You can encrypt your scenario before you share it. Then only the persons who have the password can see the content of
the scenario.

1. Set the **Encrypt scenario** switch to on.
2. Give a strong **Password**.
3. If necessary, add a **Description**.
   ::: warning
   The application does **not** encrypt the description. All persons who have the link can read it. Do not put
   sensitive data in the description.
   :::
4. Click **Upload and generate link**.

#### Security data

ORBAT Mapper encrypts the data in the client. This encryption is strong. The server receives only encrypted data. It
does not receive your password or the unencrypted scenario.

- **Algorithm**: AES-GCM (256-bit key)
- **Key derivation**: PBKDF2 (SHA-256)
- **Data integrity**: The encryption includes a check that prevents unwanted changes to the data.

### Important data

- **Link expiration**: A link stays valid for **90 days** after its creation.
- **Privacy**: All persons who have the link can see the scenario, if you do not encrypt it. Be careful with sensitive
  or private scenarios.
- **Upload limits**: There is an hourly upload limit that prevents incorrect use. If you get to this limit, wait and
  try again later.
- **Size limits**: A very large scenario can be larger than the maximum upload size. If this occurs, export the
  scenario as a JSON file.

::: warning
The application sends the scenario to the cloud, and the cloud keeps it temporarily. All persons who have the link can
get all the scenario data. Do not share sensitive or confidential data with this function. If you must share such data,
use the encryption option.
:::

---

## Share a scenario as a URL

ORBAT Mapper also lets you share small scenarios with a URL. This function compresses all the scenario data into a
string and adds the string to the URL. Thus, you can share your work without a server and without an account.

::: warning
Use this function only for small and medium scenarios. Large scenarios can make URLs that are longer than the limits of
browsers and chat applications.
Always test the link to make sure that it operates correctly.

All persons who have the link get all the scenario data in it.
:::

### How to share

1. Open the scenario that you want to share.
2. Open the main menu, then open the **File** menu.
3. Select **Share scenario as URL...**.
4. Click **Copy Link**. The application copies the URL to your clipboard.

You can now put this link in emails, chat applications or documents.

### URL length limits

The URL contains all the scenario data. Thus, a complex scenario with many thousands of units makes a very long link.

- Some browsers and chat applications cut very long URLs. Usually the limit is between 2000 and 8000 characters.
- If a scenario is too large, use "Share scenario online" or export the scenario as a JSON file.

---

## Import a shared scenario

When a recipient opens a shared link, an import screen shows. This screen shows the same data for the two share
methods:

- **Scenario name and description**: a preview of the scenario for the import.
- **Unit and side count**: a quick summary of the size of the scenario.

If the scenario is **encrypted**, you see the description (if it is available) and a field for the password. You must
give the correct password to decrypt the scenario and to see its data.

### Import actions

The available options change if a scenario with the same ID is already in the browser of the recipient:

- **Load Scenario**: If the scenario is new in your browser, you can load it directly.
- **Overwrite**: If a scenario with the same ID is in your browser, you can replace it with the imported scenario.
- **Create Copy**: This action imports the scenario as a new copy with a unique ID. The application adds "(copy)" to
  the name and keeps your version.
