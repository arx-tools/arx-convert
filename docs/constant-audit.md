# Constant field audit

Why: to find fields which are always the same in the game files and could therefore be left out of the JSON.
Measured on the `.unpacked` files of the 23 levels: **952,822 polygons, 50,483 anchors and 1,018 portals**.

The result: the anchor constants were the only meaningful case (done, see
[json-optimization.md](json-optimization.md)), everything else is either not constant at all, or not worth a
format changing release.

## Method

Every scalar property path of the parsed documents was collected per level (`polygons[].transval`,
`rooms[].polygons[].cellX`, ...) together with its distinct values and occurrence counts. Fixed arity arrays of
objects (`vertices`, `normals`) were expanded by index, other arrays were aggregated and their length
distribution was recorded. Every candidate was then checked against the ArxLibertatis source to see whether
the game reads it at all.

## Result

- the only scalar path with the same single value in **all 23 levels** is `$schema` (the schema URL, needed by
  the editors)
- the only real structural constants are `portals[].polygon.vertices[1].rhw` and `[2].rhw`, which are always 0
  (the save code writes 0 there already)
- the other entries of the "globally constant" list are artifacts of the index expansion: paths which only
  exist in a single level, because that is where the corresponding array is short enough (e.g.
  `portals[0].polygon.center.x`, `uniqueHeaders[2].path`, `rooms[1].portals[]`)
- there is **no** "near constant" (2..6 distinct values) scalar field either
- the paths which are constant *within* a level but differ between the levels are per file data
  (`header.levelIdx`, `header.mScenePosition.*`, `uniqueHeaders[].path`, ...), they have to stay in the JSON

## Dead data, but not worth a format change

Fields which are stored in the files and written into the JSON, even though the game never reads them:

| field | why it is dead | saving (23 levels) |
|---|---|---|
| `portals[].polygon.norm2` | the portal loader (`Mesh.cpp` > `EERIE_SAVE_PORTALS`) only copies `room_1`, `room_2`, `useportal`, `center`, `min`, `max`, `norm`, the 4 positions and `v[0].rhw` | 0.053 MB |
| `portals[].polygon.vertices[1..3].rhw` | `portal.poly.rhw = epo->poly.v[0].rhw;` | 0.026 MB |

0.08 MB out of ~720 MB: too little for a breaking change, and dropping `norm2` would lose the garbage bytes
stored in the files (readable, but not bit exact anymore). If a future change touches the portal code anyway,
they can go with it.

## Re-running the audit

The tools live in `tests/tools` and work on the [pkware-test-files](https://github.com/arx-tools/pkware-test-files)
fixtures or on any `.unpacked` file: `constant-audit` (the property path walker), `nan-finder` (every
`NaN`/`null` of the parsed document), `fts-offsets` (header offset + the expected size of an unpacked file).

