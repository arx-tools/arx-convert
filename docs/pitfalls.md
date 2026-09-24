# Pitfalls

Mistakes which cost time while working on this project.

## 1. The game files are partially compressed

The pkware compression is **not** a dependency of `arx-convert`, it only works with the unpacked files. Use
[`explode`](https://github.com/arx-tools/node-pkware) (or `arx-header-size` + `explode`, see the `unpack.sh`
script in the README) first.

- the offset to cut is **not always 1816**: it is `280 + numberOfUniqueHeaders × 768`, which is 1048 for
  level 10 and 2584 for level 5 (see [fts-format.md](fts-format.md))
- a good check: the unpacked file has to be `offset + uncompressedsize` bytes long
- feeding a **compressed** file into `FTS.load()` or into the CLI does not give a clean error: the header of a
  compressed file looks like an uncompressed one, so the parser happily walks into the compressed data (this
  can end up allocating huge arrays or running out of memory). Always decompress first.
- repacking needs `implode <file> --offset=<header size> --binary --large`, see the `repack.sh` script

## 2. "Permission denied" from the global `arx-convert`

The global binary can be a symlink into this repository. A rebuild (`tsc`) rewrites
`dist/bin/convert.js` and drops its executable bit, after which the linked command fails with
`bash: .../arx-convert: Permission denied` (exit 126). The `build` script runs
`chmod +x dist/bin/convert.js` now, if it still happens: `chmod +x dist/bin/convert.js`.

Also be careful when using the CLI from scripts: if the command is not executable, the failure is instant and
**no output file is created** - which looks like a successful run in a loop that only checks exit codes.

## 3. `levelIdx` and the ARKANESERVER paths

The number is parsed from the path in the file header. Early builds of the game stored the assets on a shared
Windows drive, so 9 of the 23 levels have a `\\ARKANESERVER\Public\Arx\...` style path. Until `13.0.2` those
became `NaN` → `null` in the JSON → `levelNaN` in the regenerated header, and the portals of the levels below
10 got the wrong hardcoded block. **JSON files generated before `13.0.2` should be regenerated**, otherwise
saving them writes the broken path back.

JSON files which still contain the removed anchor fields (`radius`, `height`, `isBlocked`) are fine to load:
the extra fields are simply ignored when saving.

## 4. NaN and -0 are normalized (13.0.2+)

While reading a float32, `NaN`/`Infinity` become `0` (JSON can't represent them: they would be `null`, which
also violates the schema) and `-0` becomes `0`. The second one is a deliberate trade-off: it costs one byte
per value when comparing the regenerated file with the original (e.g. 5,553 bytes in level 1), but the data has
a single representation and a JSON round trip produces exactly the same output as a binary one.

## 5. The cell assignment depends on the exact float32 values

A polygon belongs to the cell `floor(average of the first 3 vertices' x/z / 100)`, with a few exceptions
listed in `COORDS_THAT_ROUND_UP` (8 polygons in level 1, 16 in level 5). Because the JSON stores float32
values in their shortest form - which parses back into a slightly different double, but the same float32 -
`getCellCoords()` rounds the coordinates back to float32 with `Math.fround()` before comparing them. Keep that
rounding (and the non mutating sort) if you touch the function, or polygons end up in the neighbouring cell.

## 6. Generating (and verifying) the JSON of every level

- the fixtures for the tests come from
  [pkware-test-files](https://github.com/arx-tools/pkware-test-files) (checked out next to this repository)
- generating the pretty + minified JSON of all 23 levels takes ~3 minutes and ~1.9 GB of disk space
- a quick verification of a fresh JSON: it ends with `}`, it contains no `null`, and `levelIdx` matches the
  level number

## 7. Schemas

`schemas/defs.json` is the canonical source of the shared definitions, the format schemas contain generated
copies. Never hand-edit the shared definitions inside a format schema, run `npm run schemas:sync` instead, and
use `npm run schemas:check` to verify (it also runs before publishing) - see [schemas.md](schemas.md).
