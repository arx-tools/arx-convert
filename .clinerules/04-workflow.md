# Workflow

## Branches and commits

- `main` is the released state: it only receives the release merges (`dev` -> `main`), so its head is the
  version which is on npm
- `dev` is the integration branch: the per issue branches start from it and their PRs are merged into it. The
  release pull requests are the only way into `main`, the day to day work never lands there directly
- a hotfix which can not wait for the next release starts from `main` and is merged into `main`, then `main` is
  merged back into `dev` so the next release keeps the fix as well
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

1. bump the version in `package.json` on `dev` (major for a breaking JSON change)
2. `npm run lint`, `npm run schemas:check`, `npm test`, `npm run build`
3. open the release PR (`dev` -> `main`), wait for the CI and merge it
4. on `main`: commit + tag (`vX.Y.Z`) + GitHub release (the notes should mention breaking format changes)
5. `npm publish` - `prepublishOnly` runs the checks and a clean build before packing, so a broken schema source
   aborts the release, and `dist/schemas` is regenerated with the version of the release
6. if the release changed a schema, refresh the copy which is served: the just regenerated `dist/schemas` goes
   into `public/schemas` of [arx-tools.github.io](https://github.com/arx-tools/arx-tools.github.io), the
   package itself does not carry the schemas (see [docs/schemas.md](../docs/schemas.md))

`npm run build` only compiles the typescript files: `npm run schemas:build` is a separate script, chained after
the build by the `pretest` of `npm test` and by the `prepublishOnly` of `npm publish`, so both regenerate
`dist/schemas`: there is no separate generation step to remember before publishing.

## CI

`.github/workflows/ci.yml` runs on every push to `main` and `dev`, and on every pull request. The pull request
side has no branch filter, so the issue PRs into `dev` and the release PRs into `main` are checked alike, on the
merge commit which the merge would produce. It has two jobs:

| job | what it does |
|---|---|
| `test` | node 22: `npm ci`, lint, the typecheck of the tests, the schema check, the full test run (`ARX_FULL_TEST=1`) and a CLI smoke test (`node dist/bin/convert.js --version`) |
| `node18` | builds and packs with node 22, then installs the tarball on node 18.0.0 - the declared floor of `engines.node` - and runs the CLI |

- the repo is checked out into `arx-convert/` and the fixtures of
  [pkware-test-files](https://github.com/arx-tools/pkware-test-files) into the sibling `pkware-test-files/`:
  `tests/fixtures.ts` resolves the fixture folder relative to the repository root, so the repo can not be the
  workspace root in that job. The fixture repo is public and shallow-cloned (159.63 MiB pack), and only the
  `test` job needs it
- the full run of the suite is 291 tests in ~116 seconds locally (`ARX_FULL_TEST=1`, level 0-21)
- the smoke test is there because no test loads the bin entry point, the shebang or the rewritten aliases
- the `node18` job builds on node 22 on purpose: `scripts/schemas.ts` needs the native typescript support of
  node >= 22.18.0, only the packed tarball is installed on 18. `npm pack` does not run `prepublishOnly`, so
  the build is an explicit step
- both jobs run on `ubuntu-latest`. There is no Debian/Ubuntu LTS runner label (the distro images are
  container based, and `container:` would need an `apt-get install git` before the checkout), and the distro
  does not matter here: the 464 packages of the lockfile are all prebuilt (the only two install scripts are
  `unrs-resolver`'s `napi-postinstall ... check`, which just verifies the platform binding, and `fsevents`,
  which is macOS only), the runtime dependencies (`minimist-lite`, `yaml`) are pure javascript, and the jobs
  only use `git`, `tar`/`zstd` and `node`. `ubuntu-latest` is 24.04 now and GitHub plans to move it to 26.04 -
  pin `ubuntu-24.04` in a job if that ever breaks it

## Local tooling

| tool | what it is |
|---|---|
| `../ArxLibertatis/src` | the source of truth for every format question, the JSDoc `@see` links point to it |
| `../pkware-test-files` | test files from the game (`arx-fatalis/levelN/*.unpacked`), used by the tests |
| `explode` / `implode` | [node-pkware](https://github.com/arx-tools/node-pkware), the FTS/DLF/LLF files are partially compressed with it |
| `arx-header-size` | [arx-header-size](https://github.com/arx-tools/arx-header-size), prints the size of the uncompressed header (the `--offset` for `explode`) |
| `arx-convert` | the CLI of this repository (globally linked, needs `chmod +x dist/bin/convert.js` after a rebuild - the build script does it) |
