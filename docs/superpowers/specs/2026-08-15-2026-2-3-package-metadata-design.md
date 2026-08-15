# 2026.2.3 Package Metadata Design

## Goal

Publish the postal-code documentation and package metadata as a new patch PR after the original postal-code PR was merged.

## Changes

- Create `chore/2026.2.3-package-metadata` from the current `feat/postal-codes` tip so post-merge README and image commits remain included.
- Change `package.json` version from `2026.2.2` to `2026.2.3`.
- Update the package description to mention PSGC geographic data and Philippine postal codes.
- Add `postal-code`, `zip-code`, `philippine-postal-code`, and `philippine-zip-code` keywords.
- Do not change dependencies or public APIs.

## Verification and delivery

Run Prettier, typecheck, build, and the current-checkout test suite. Push the new branch and open a pull request against `dev` summarizing the post-merge documentation and `2026.2.3` metadata changes.
