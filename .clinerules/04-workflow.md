# Workflow

## Branches and commits

- branch per issue, named `<issue-number>-<short-slug>`, e.g. `17-fts-json-size-optimization`
- [Conventional Commits](https://www.conventionalcommits.org/): `feat|fix|refactor|docs|chore|ci(scope): subject`,
  with a `!` after the scope when the change is breaking, e.g. `refactor(fts)!: drop the constant ...`
- the subject is imperative and short, the body explains the *why*, and mentions the measured numbers when
  there are any
- **the maintainer commits and pushes** - prepare the changes, show the diff and stop there. Do not add
  `Co-Authored-By`/generated-by lines.
- ask before destructive steps: deleting files, force push, rebase of a published branch, dropping data
- a change which affects the JSON shape, the schemas or the documentation is done in one commit

## Documentation

- user facing behaviour, format decisions and the results of measurements go into `docs/` (see
  [docs/README.md](../docs/README.md))
- the plans are kept in [ROADMAP.md](../ROADMAP.md), the open tasks of the JSON optimization in
  [issue #17](https://github.com/arx-tools/arx-convert/issues/17)
- everything written into the repository is **english**, including the schemas, the commit messages and the
  code comments

## Releases

1. bump the version in `package.json` (major for a breaking JSON change)
2. `npm run lint`, `npm run schemas:check`, `npm test`, `npm run build`
3. commit + tag (`vX.Y.Z`) + GitHub release (the notes should mention breaking format changes)
4. `npm publish` - `prepublishOnly` runs the checks before packing, so a stale schema aborts the release

## Local tooling

| tool | what it is |
|---|---|
| `../ArxLibertatis/src` | the source of truth for every format question, the JSDoc `@see` links point to it |
| `../pkware-test-files` | test files from the game (`arx-fatalis/levelN/*.unpacked`), used by the tests |
| `explode` / `implode` | [node-pkware](https://github.com/arx-tools/node-pkware), the FTS/DLF/LLF files are partially compressed with it |
| `arx-header-size` | prints the size of the uncompressed header (the `--offset` for `explode`) |
| `arx-convert` | the CLI of this repository (globally linked, needs `chmod +x dist/bin/convert.js` after a rebuild - the build script does it) |
