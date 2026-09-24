# Constant field audit

An audit of the 23 levels of the original game, looking for fields which are always the same and could
therefore be left out of the JSON. Measured on the `.unpacked` files: **952,822 polygons, 50,483 anchors and
1,018 portals**.

## Method

Every scalar property path of the parsed documents was collected per level (`polygons[].transval`,
`rooms[].polygons[].cellX`, ...), together with the distinct values and the occurrence counts. Fixed arity
arrays of objects (`vertices`, `normals`) were expanded by index, other arrays were aggregated and their
length distribution was recorded. Then every candidate was checked against the ArxLibertatis source to see
whether the game reads it at all.

## Result: there are no meaningful constants left

- the only scalar path which has the same single value in **all 23 levels** is `$schema` (the schema URL,
  needed by the editors)
- the only real structural constants are `portals[].polygon.vertices[1].rhw` and `[2].rhw` which are always 0
  (they exist in 21 of the 23 levels, 2 levels have no portals at all - the save code already writes 0 there)
- the other 42 entries of the "globally constant" list are artifacts of the index expansion: paths which only
  exist in a single level, because that is where the corresponding array is short enough (e.g.
  `portals[0].polygon.center.x`, `uniqueHeaders[2].path`, `rooms[1].portals[]`)
- there is **no** "near constant" (2..6 distinct values) scalar field either
- the paths which are constant *within* every level but differ between the levels are per file data
  (`header.levelIdx`, `header.mScenePosition.*`, `uniqueHeaders[].path`, ...), they have to stay in the JSON

## Dead data (not read by the game), but not worth it

| field | why it is dead | saving (23 levels) |
|---|---|---|
| `portals[].polygon.norm2` | the portal loader (`Mesh.cpp` > `EERIE_SAVE_PORTALS`) only copies `room_1`, `room_2`, `useportal`, `center`, `min`, `max`, `norm`, the 4 positions and `v[0].rhw` | 0.053 MB |
| `portals[].polygon.vertices[1..3].rhw` | `portal.poly.rhw = epo->poly.v[0].rhw;` | 0.026 MB |
| `paddy` (already ignored) | it only exists in the struct definitions, the game never reads it | - |

That is 0.08 MB out of ~720 MB, so a format changing release is not worth it for them - not to mention that
dropping `norm2` would lose the garbage bytes stored in the files (readable, but not bit exact anymore).

## Bugs found by the audit

Both were fixed in `13.0.2`:

1. **`header.levelIdx` was `null` for 9 levels** (`level2`, `3`, `5`, `6`, `7`, `11`, `14`, `18`, `22`). The old
   `pathToLevelIdx()` only stripped the `C:\ARX\Game\Graph\Levels\level` prefix, so the `\\ARKANESERVER\...`
   style paths parsed into `NaN`. Consequences: `null` in the JSON (invalid per the schema), a
   `...\levelNaN\` path written into the regenerated header, and the portal code always choosing
   `HARDCODED_DATA_TYPE2` instead of `TYPE1` for the levels below 10 (it compares `levelIdx < 10`).
   `levelIdxFromPath()` in `src/common/helpers.ts` now looks for the `level<number>` part anywhere in the
   path, and both FTS and DLF use it.
2. **`NaN` values became `null` in the JSON** (26 of them in 7 levels, mostly in
   `roomDistances[].startPosition` / `endPosition`), and `0` again when saving. `readFloat32()` normalizes
   `NaN` and `Infinity` to `0` now.

## Explaining the pre-existing byte differences

`load → save` of a game file does not produce the original bytes exactly. The audit found the reasons:

- `paddy`: the save code writes 0 into it (`binary.writeInt16(0) // paddy`), while the files contain garbage -
  that is 2 bytes per polygon. Level 8: 1,277 polygons × 2 = 2,554, and the measured difference was 2,547
  differing bytes.
- `-0`: `JSON.stringify()` writes `-0` as `0`, so the JSON path loses one byte per negative zero
  (`0x80000000` vs `0x00000000`). Level 1 has exactly 5,553 of them, which is exactly the extra difference
  between the binary path (74,365 bytes) and the JSON path (79,918 bytes) before the normalization.
- `levelIdx`: the header path is written in the `C:\ARX\...` form, the original files can have the
  `\\ARKANESERVER\...` form.

None of this matters for the game - it reads neither `paddy` nor the header path.

## Re-running the audit

The tools live in `tests/tools` (once the test folder exists) and work on the files of the
[pkware-test-files](https://github.com/arx-tools/pkware-test-files) repository or on any `.unpacked` file:
`fts-offsets` (header offset + expected size), `constant-audit` (the property path walker), `nan-finder`
(every NaN/`null` in the parsed document).
