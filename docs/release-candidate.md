# 2026.2.0 release candidate

The RC workflow is the only package-publishing workflow. It is manual: open **Actions → Release candidate → Run workflow**
on `dev`, select `rc`, and enter the next number. It verifies generated PSGC
artifacts, build, types, all tests, and browser smoke before publishing
`2026.2.0-rc.N` with npm dist-tag `next`. It then runs the fresh published-RC
consumer test and creates a GitHub prerelease.

The stable path is manual on `main`, selects `stable`, and pauses at the
protected `npm-production` environment for approval. It publishes the reviewed
`2026.2.0` commit with npm dist-tag `latest` and creates the final GitHub
release. No npm token is stored in the repository or printed by the workflow.

The older push-to-`main` Changesets publisher is intentionally not used: a
push must not publish a stable package before its RC has been reviewed.

## Test an RC locally

From this package:

```bash
pnpm build
pnpm pack --pack-destination /tmp
pnpm test:published -- /tmp/aivangogh-ph-address-2026.2.0-rc.1.tgz
```

The smoke harness installs the exact tarball in a temporary consumer and checks
CommonJS, ESM, TypeScript declarations, and a real browser. For a published RC,
use `pnpm test:published -- @aivangogh/ph-address@2026.2.0-rc.1`.

## Test the deployed parent tooling locally

The deployed site is `apps/web`. Use a disposable parent checkout/worktree so
the link test cannot mix with unrelated local changes. Link the RC source
worktree (it retains its `pako` dependency), then build:

```bash
cd /home/van/projects/personal/aivangogh
pnpm --filter web link /home/van/projects/personal/aivangogh/packages/ph-address/.worktrees/issue-26
pnpm --filter web type-check
pnpm --filter web build
pnpm --filter web unlink @aivangogh/ph-address
```

Because this is a pnpm workspace, `link` may update the workspace manifest or
lockfile; discard those temporary changes after the test. Run
`pnpm run preview:web` to inspect the local production build for
`/tools/ph-address`. After the RC is published and approved, install the exact
version in the app and commit the manifest/lockfile change:

```bash
pnpm --filter web add @aivangogh/ph-address@2026.2.0-rc.1
pnpm --filter web type-check
pnpm --filter web build
```

Do not use a root `devDependencies` entry for this package: the deployed app
bundles it at runtime, so its committed entry belongs in `apps/web`'s runtime
`dependencies`.

## Deprecating a bad RC

Never delete a published version. Deprecate it and point `next` to the last
good RC:

```bash
npm deprecate @aivangogh/ph-address@2026.2.0-rc.2 "Use 2026.2.0-rc.3 instead"
npm dist-tag add @aivangogh/ph-address@2026.2.0-rc.1 next
```
