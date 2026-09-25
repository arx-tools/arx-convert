# Roadmap

## Done

- the first half of the JSON size optimization ([#17](https://github.com/arx-tools/arx-convert/issues/17)) and
  the `13.0.2` fixes are on `main`: see the git history, the release notes and [docs](docs/README.md) for the
  current behaviour
- the `tests` folder: round trip tests over the game files (the JSON path produces the same binary as the
  direct one), `levelIdx`, "no `null`" and top level key checks, the cross format checks of
  `level-consistency.test.ts`, and the diagnostic tools (`constant-audit`, `nan-finder`, `fts-offsets`) in
  `tests/tools`
- the file operations of `src`, `scripts` and `tests` are async (`node:fs/promises`, awaited
  `spawn`/`execFile`) and `xo` enforces it - see
  [.clinerules/01-project-conventions.md](.clinerules/01-project-conventions.md)

## Next

| | task | notes |
|---|---|---|
| 1 | tuple representation | [#17](https://github.com/arx-tools/arx-convert/issues/17) task 3, measured ~9.4 MB on level 1 |
| 2 | sparse `cells` | [#17](https://github.com/arx-tools/arx-convert/issues/17) task 4, 25,600 entries of which only ~1,900-3,500 are not empty |
| 3 | re-measure every level | and update [docs/json-optimization.md](docs/json-optimization.md) |
| 4 | CI workflow | `npm ci && npm run lint && npm run schemas:check && npm run build && npm test` on every push/PR (there is none at the moment); the fixtures are cloned from [pkware-test-files](https://github.com/arx-tools/pkware-test-files) next to the checkout |
| 5 | release `14.0.0` | the JSON format changed (the anchor fields), so it is a breaking release |

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
