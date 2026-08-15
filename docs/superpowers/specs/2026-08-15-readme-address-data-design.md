# README Address Data Clarification

## Goal

Make it clear that `ph-address` provides both PSGC geographic data and Philippine postal-code data.

## README changes

- Describe the package as Philippine address data whose geographic hierarchy follows PSGC Revision 1.
- Add the existing `assets/psgc/coding-structure.png` diagram.
- Document the 10-digit PSGC layout as `RR-PPP-MM-BBB`: region, province/HUC, municipality/city, and barangay identifiers.
- Explain that four-digit postal codes describe delivery areas, are maintained separately from PSGC identifiers, and can have many-to-many relationships with municipalities or localities.
- Keep the current installation, performance, versioning, and API documentation intact.

## Scope and verification

Only `README.md` changes during implementation. Verify that its image path resolves, its examples match the exported API, and Markdown formatting passes Prettier.
