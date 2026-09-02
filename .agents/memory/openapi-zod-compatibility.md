---
name: OpenAPI Zod compatibility
description: Shared Zod version constraint for the generated OpenAPI validation package.
---

The shared Zod dependency must stay on a Zod 4 release when the workspace uses the current Orval Zod generator.

**Why:** Orval emits helpers such as `email()` and `int()` that are not available on the workspace's older Zod 3 runtime, causing the generated validation package to fail typechecking even though code generation succeeds.

**How to apply:** If generated `@workspace/api-zod` output reports missing Zod helpers, check the workspace catalog and package lock before editing generated files; align Zod rather than patching generated output.