---
name: Artifact service working directory
description: Working-directory behavior for managed artifact services in this workspace.
---

Managed development service commands start from their artifact directory rather than the repository root. Use paths relative to `artifacts/<slug>/` in development commands.

**Why:** A Python API workflow failed when its command tried to enter `artifacts/<slug>/backend` from inside `artifacts/<slug>`. Changing it to `cd backend` fixed startup.

**How to apply:** For development commands in an artifact's `artifact.toml`, treat the artifact directory as the starting point. Production commands may run from the workspace root, so inspect the existing production service conventions separately.
