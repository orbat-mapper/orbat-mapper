# Custom symbols

If standard military symbols are not sufficient for your needs, you can create custom unit symbols using images and SVGs. 

![Custom unit symbols example](images/custom-unit-symbols.png)

To create a custom unit symbol go to the *Settings -> Custom symbols*:

![Custom symbols settings](images/custom-symbols-panel.png)

You can then use the *Add* button to open the *Add custom symbol* form:

![Add custom symbol form](images/add-symbol-form.png)

**Name** 
Enter a descriptive name for your custom symbol

---

**URL/URI** Provide a URL or Data URL for the symbol image.
Supported input formats: 
  - [Data URLs]((https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data)) (base64-encoded images or SVGs, e.g., `data:image/png;base64,...`)
  - Regular URLs to image files

Supported image formats:
  - PNG
  - SVG
  - JPEG/JPG
  - and other formats supported by web browsers

The recommended image formats are SVG and PNG with transparent backgrounds. SVG images can be scaled to any size without loss of quality and
are usually smaller than raster images.

:::info
Data URLs are a way to embed small files directly within web pages or applications 
by encoding the file’s data in base64 format and placing it inline as a string. 
Data URIs typically start with a scheme like data:image/png;base64, followed by the encoded content. For more details, 
see the [MDN documentation on Data URLs](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data).

Custom symbols added using Data URLs are stored directly in the scenario file, making them portable and self-contained. 
However, be aware that large Data URLs can increase the size of your scenario file significantly.
:::

:::warning
When using external URLs, ensure that the image is accessible and that you have the right to use it. If the image is 
hosted on a server that requires authentication or has restrictions, 
ORBAT Mapper may not be able to load it. CORS (Cross-Origin Resource Sharing) policies may also prevent loading images.
:::

---

**Corresponding SIDC**. The Symbol Identification Code (SIDC) that corresponds to your custom symbol. This value is used
for filtering and selecting units. It may also be used when exporting data to formats that support SIDCs.

After you have added your custom symbol, it will appear in the list of available custom symbols: