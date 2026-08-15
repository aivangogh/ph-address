# README API Types Design

## Goal

Make every public API's input and inferred return type explicit so TypeScript users do not have to inspect declarations or guess object fields.

## Documentation changes

- Add a complete signature table for all functions exported from `src/index.ts`.
- Show `readonly` array returns and `| undefined` for exact-code lookups.
- Add an explicit signature or return type to each detailed API section.
- Expand `Types` with the exact definitions of `PHRegion`, `PHProvince`, `PHMunicipality`, `PHBarangay`, `PHPostalCode`, and `PHAddress`.
- Include `PHAddress` in the type-import example and explain why `province` and `municipalityCode` are optional.
- Keep one canonical copy of each type definition instead of repeating object shapes under every function.

## Scope and verification

Modify only `README.md`. Cross-check every documented function and type against `src/index.ts`, `src/functions`, and `src/types`; run Prettier and repository tests before completion.
