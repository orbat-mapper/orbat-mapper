# A basemap archive is reopened from a stored file handle, on Chromium only

When the user picks a basemap archive with `showOpenFilePicker()`, we store the
`FileSystemFileHandle` it returns in IndexedDB — database `scenario-db` version 5, object store
`basemap-archive-handles`, keyed by the archive key. On the next load the handle of every
remembered archive is read back and `queryPermission({ mode: "read" })` is called on it. An archive
is reopened **without asking** in exactly
one case: the read permission is already `"granted"` **and** the archive was the active basemap when
the user left, which is decided against the persisted `maplibreBaseLayerName`. Every other case
needs a click: the remembered archive shows up as a row in the base layer list offering _Restore map
file_ (permission `"prompt"`, so `requestPermission()` runs inside the click handler and keeps its
transient activation) or _Select map file…_ (no handle, or no support for handles at all).

## Why

Reopening silently in every case where the permission happens to be granted was rejected. A page in
an air-gapped tool that reads a file from the user's disk on load — for an archive the user was not
even using — is a surprise the user did not ask for, and the grant that makes it possible was given
for one earlier click, not as standing consent. The "was it active" test keeps the automatic path
to exactly one job: restoring the state the user left. Anything beyond that is a row and a click.

Copying the archive into browser storage (OPFS, or a blob in IndexedDB) was also rejected. A basemap
archive is hundreds of megabytes to gigabytes; storing it would duplicate the user's own file, and
it would drag in a quota story and an eviction story that a map file on disk does not need. The
current design deliberately reads the file with `Blob.slice`, which is what lets the same code path
work in a `file://` standalone build where no storage is available at all.

The gain is real but narrow, so the fallback had to stay untouched: where the File System Access API
is missing the existing `<input type="file">` picker runs exactly as before, and the feature gate
(`isFileHandleSupported()`) is checked inside every export of the handle module, so no caller
branches on it. Presence is not the same as availability, so the fallback also covers a picker that
is there and refuses: an enterprise policy can leave `showOpenFilePicker` on the window and make
every call reject. `pickBasemapArchiveHandles()` therefore separates a cancel (`AbortError`, the
user chose nothing, do nothing) from a failure, and only a failure falls through to the
`<input type="file">` picker. Without that separation the button would be a silent no-op wherever
the policy applies.

## Consequences

- Chromium only — Chrome, Edge and Brave. Firefox and Safari have no `showOpenFilePicker`, so they
  always use the `<input type="file">` picker and always ask for the file again.
- A `file://` origin is opaque: `showOpenFilePicker` throws there and IndexedDB is blocked. The
  Level 3 standalone build therefore behaves exactly as it did before this change.
- The startup banner (`BasemapArchivePrompt.vue`) is gone. The remembered archive is a row in the
  base layer list instead, which also gives the user the first way ever to turn it off — the old
  banner's dismissal was session-only and `forgetBasemapArchive()` had no caller at all.
- A File System Access permission grant cannot be revoked from JavaScript; there is no
  `revokePermission()`. Deleting the stored handle IS the removal: with no handle nothing can name
  the file. If the user later picks the same file again, Chromium may grant it silently, because it
  remembers recently used per-origin grants.
- `scenario-db` goes to version 5. That is a one-way migration: a user who then opens an older build
  of the app hits a `VersionError` on the database.
- Every remembered archive is probed at startup, not only the last one. `mapSettingsStore`
  remembers a list, which matches the runtime: the `pmtiles://` protocol keys archives
  individually, and each open archive is its own base layer. At most one of them opens by itself,
  because at most one was the active basemap.
- A startup sweep deletes every stored handle whose key is not in that list. Without it a handle
  could outlive the entry that names it — unreachable by the restore path, invisible to the remove
  control, and still holding a read grant on a file the user believes is forgotten.
- The superseded `lastBasemapArchive` key is read once and folded into the list, then deleted, so an
  existing user keeps the archive they had.
- Drag-and-drop still produces no handle: `useFileDropZone` hands over `File` objects, and only the
  picker path can store a handle. An archive that was dropped is remembered by name, not by handle.
- `getFile()` can fail at any time — the file may have been moved, renamed or deleted since the
  handle was stored. Every read path has to survive that: `fileFromHandle()` returns null instead of
  throwing, and the caller drops the stale record and falls back to the picker.
