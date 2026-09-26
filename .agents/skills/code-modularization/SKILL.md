---
name: code-modularization
description: Organize code by feature and responsibility. Use when adding files, splitting crowded directories, or refactoring module boundaries.
---

# Code modularization

Make the directory tree show where a feature lives and what each part does. Keep code near the feature that uses it; move it to a shared module only when unrelated features actually reuse it.

## Choose a location

1. Find the feature and follow its existing naming conventions.
2. Give each file one responsibility and keep it short enough to scan. Split independent work when a file becomes hard to read; do not split tightly related code to meet a size limit.
3. Prefer one primary function per file when practical, especially for business logic, validation, transformations, database operations, request handlers, normalization, authentication, and reusable utilities.
4. Group files by responsibility, not file type. Add a subdirectory when several files serve a distinct part of the feature. Do not create a folder for every file or keep unrelated code together to avoid new files.
5. Use specific folder and file names. Avoid `utils`, `helpers`, and `misc` unless the project gives them a defined role.
6. Keep paths as short as clarity allows. Avoid empty layers such as `logic/functions/handlers`.
7. When moving code, update imports and tests without changing behavior unless the task requires it.

## Examples of use

When adding filters to a property listing, group the related UI under the feature rather than under global `buttons` or `dropdowns` folders:

```text
components/properties-showcase/property-filter-toolbar/
├── property-type-filter/
│   ├── trigger.tsx
│   └── popover.tsx
└── price-range-filter/
    └── popover.tsx
```

When a filter module becomes crowded with application and search-parameter logic, separate those responsibilities. Avoid a large `filters.ts` that mixes both. Keep a small module flat until that distinction exists:

```text
lib/properties-showcase/property-filtering/
├── apply-property-filters.ts
└── search-parameters/
    ├── parse-property-filters.ts
    └── serialize-property-filters.ts
```

For a modularization request, show a short before-and-after path example, explain what responsibility each new directory represents, and note any imports or tests that need updating.
