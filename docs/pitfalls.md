# Pitfalls

Mistakes which cost time while working on this project.

## 1. The game files are partially compressed

The pkware compression is **not** a dependency of `arx-convert`, it only works with the unpacked files. Use
[`explode`](https://github.com/arx-tools/node-pkware) (or the `unpack.sh` script from the README, which asks
`arx-header-size` for the offset) first.

- the offset to cut is **not always 1816**: it is `280 + numberOfUniqueHeaders × 768`, which is 1048 for
  level 10 and 2584 for level 5 (see [fts-format.md](fts-format.md))
- a good check: the unpacked file has to be `offset + uncompressedsize` bytes long
- feeding a **compressed** file into `FTS.load()` or into the CLI does not give a clean error: the header of a
  compressed file looks like an uncompressed one, so the parser walks into the compressed data (this can end
  up allocating huge arrays or running out of memory). Always decompress first.
- repacking needs `implode <file> --offset=<header size> --binary --large`, see the `repack.sh` script

## 2. "Permission denied" from the global `arx-convert`

The global binary can be a symlink into this repository. A rebuild (`tsc`) rewrites `dist/bin/convert.js` and
drops its executable bit, after which the linked command fails with `Permission denied` (exit 126). The
`build` script runs `chmod +x dist/bin/convert.js` for this reason.

Be careful when running the CLI from a script: if it is not executable, the failure is instant and **no output
file is created** - which looks like a successful run in a loop that only checks exit codes.

## 3. JSON files generated before `13.0.2` have to be regenerated

`levelIdx` was parsed as `NaN` for the 9 levels which use the `\\ARKANESERVER\...` style header paths, so
those JSON files contain `"levelIdx": null`, and saving them writes a broken path into the header. Regenerate
them with the current version. (JSON files which still contain the removed anchor fields - `radius`, `height`,
`isBlocked` - are fine: extra fields are simply ignored when saving.)

## 4. A regenerated file is not byte identical with the original

This is by design, the guarantee is that a JSON round trip produces the same output as loading and saving the
binary directly. The known differences:

| reason | size |
|---|---|
| `paddy` is written as 0, while the files contain garbage in it (the game never reads it) | 2 bytes per polygon |
| `-0` becomes `0` (JSON has no negative zero) | 1 byte per value (5,553 in level 1) |
| the header path is rewritten in the `C:\ARX\Game\Graph\Levels\level<number>\` form | up to 256 bytes |

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

`src/schemas/_defs.json` is the canonical source of the shared definitions, the published format schemas are
generated from `src/schemas/` into `dist/schemas/` by the build. A format schema source never contains a
shared definition (the build injects them), and `npm run schemas:check` verifies that (it also runs before
publishing) - see [schemas.md](schemas.md).

