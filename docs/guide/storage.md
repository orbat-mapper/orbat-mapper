# Loading and saving scenarios

ORBAT Mapper does not provide online storage, so all your scenarios are stored locally on your computer. By default,
they are stored in your browser's storage ([IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)),
but you can also download them as files to your computer.

::: warning
Please note that your browser's storage is not a backup solution. If you clear your browser's storage, all your
scenarios will be lost. The browser may also clear the storage automatically if it runs out of space. You should therefore
regularly download your scenarios to your computer for backup.

:::

## External scenarios

An ORBAT Mapper scenario is a single file with the extension `.json`. You can load a scenario by dragging and dropping
the file onto the ORBAT Mapper window, or by selecting _Open scenario_ from the _File_ menu.

Scenario files can be loaded from you local file system, or from a URL.
