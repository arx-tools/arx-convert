# Roadmap

## Done

- the first half of the JSON size optimization ([#17](https://github.com/arx-tools/arx-convert/issues/17)) and
  the `13.0.2` fixes are merged: the fixes are released, the JSON optimization is waiting on `dev`. See the git
  history, the release notes and [docs](docs/README.md) for the current behaviour
- the `tests` folder: round trip tests over the game files (the JSON path produces the same binary as the
  direct one), `levelIdx`, "no `null`" and top level key checks, the cross format checks of
  `level-consistency.test.ts`, and the diagnostic tools (`constant-audit`, `nan-finder`, `fts-offsets`) in
  `tests/tools`
- the file operations of `src`, `scripts` and `tests` are async (`node:fs/promises`, awaited
  `spawn`/`execFile`) and `xo` enforces it - see
  [.clinerules/01-project-conventions.md](.clinerules/01-project-conventions.md)
- the CI workflow (`.github/workflows/ci.yml`): lint, the typecheck of the tests, the schema check and the
  full test run over the game files on node 22, a CLI smoke test, and the packed tarball on node 18 (the
  declared lower bound of `engines.node`) - see [.clinerules/04-workflow.md](.clinerules/04-workflow.md)

## Next

| | task | notes |
|---|---|---|
| 1 | tuple representation | [#17](https://github.com/arx-tools/arx-convert/issues/17) task 3, measured ~9.4 MB on level 1 |
| 2 | sparse `cells` | [#17](https://github.com/arx-tools/arx-convert/issues/17) task 4, 25,600 entries of which only ~1,900-3,500 are not empty |
| 3 | re-measure every level | and update [docs/json-optimization.md](docs/json-optimization.md) |
| 4 | release `14.0.0` | the JSON format changed (the anchor fields), so it is a breaking release, it ships with a `dev` -> `main` release PR |

## Ideas, not planned

- leaving the dead data of the portals (`norm2`, the `rhw` of the vertices after the first) out of the JSON:
  it is ~0.08 MB and it would lose the garbage bytes - see [docs/constant-audit.md](docs/constant-audit.md)
- index table for repeated vertices/vectors (level 1: 235,852 vertices of which 117,236 are unique): it makes
  the JSON harder to read and edit by hand
- base64/columnar float storage or compression: much smaller, but the JSON would not be editable anymore
- dropping the 4th vertex of triangles or the `norm`/`norm2`/`normals` fields: lossy or needed by the game

## Release process

the day to day work goes into `dev`, `main` only moves with the release merges (see
[.clinerules/04-workflow.md](.clinerules/04-workflow.md))

1. update the version in `package.json` on `dev` (major for a JSON format change, e.g. `14.0.0`)
2. `npm run lint` and `npm test`
3. open the release PR (`dev` -> `main`), let the CI run and merge it
4. tag the merge commit on `main` (`vX.Y.Z`), push the tag, create the GitHub release
5. `npm publish` - the `prepublishOnly` script runs `lint`, `schemas:check` and a clean build before packing
   (it can't fail silently: a broken schema aborts the publish before anything is uploaded)
