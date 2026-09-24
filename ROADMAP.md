# Roadmap

## Done

- **13.0.2** - level number parsing for the `\\ARKANESERVER\...` style paths, normalization of `NaN`,
  `Infinity` and `-0` float32 values (so a JSON round trip and a binary round trip produce the same output),
  `chmod +x` after the build
- **JSON size optimization, first half** ([#17](https://github.com/arx-tools/arx-convert/issues/17)):
  float32 values are written in their shortest round-trip form (-22.8% on the minified level 1 output), the
  JSON is minified by default, the constant anchor fields are not written anymore
- **schema sync** - `schemas/defs.json` + `scripts/schemas.ts` (`sync`/`check`), the `float32` type is shared
  by every format that has a `vector3`
- **documentation** - `docs/`, `.clinerules/` and this roadmap

## Next

| | task | notes |
|---|---|---|
| 1 | `tests` folder | round trip tests (JSON path === binary path), `levelIdx` and "no `null`" checks, fixtures from `pkware-test-files`; the diagnostic tools (`constant-audit`, `nan-finder`, `fts-offsets`) go next to them |
| 2 | tuple representation | [#17](https://github.com/arx-tools/arx-convert/issues/17) task 3, measured ~9.4 MB on level 1 |
| 3 | sparse `cells` | [#17](https://github.com/arx-tools/arx-convert/issues/17) task 4, 25,600 entries of which only ~1,900-3,500 are not empty |
| 4 | re-measure every level | and update [docs/json-optimization.md](docs/json-optimization.md) |
| 5 | CI workflow | `npm ci && npm run lint && npm run schemas:check && npm run build && npm test` on every push/PR (there is none at the moment) |
| 6 | release `14.0.0` | the JSON format changed (the anchor fields), so it is a breaking release |

## Ideas, not planned

- leaving the dead data of the portals (`norm2`, the `rhw` of the vertices after the first) out of the JSON:
  it is ~0.08 MB and it would lose the garbage bytes - see [docs/constant-audit.md](docs/constant-audit.md)
- index table for repeated vertices/vectors (level 1: 235,852 vertices of which 117,236 are unique): it makes
  the JSON harder to read and edit by hand
- base64/columnar float storage or compression: much smaller, but the JSON would not be editable anymore
- dropping the 4th vertex of triangles or the `norm`/`norm2`/`normals` fields: lossy or needed by the game

## Release process

1. update the version in `package.json` (major for a JSON format change, e.g. `14.0.0`)
2. `npm run lint` and `npm test`
3. commit, tag (`vX.Y.Z`), push, create the GitHub release
4. `npm publish` - the `prepublishOnly` script runs `lint`, `schemas:check` and a clean build before packing
   (it can't fail silently: a broken schema aborts the publish before anything is uploaded)
