---
name: clean-code
description: Cleans up dead code, unused files, stale exports, obsolete comments, and redundant dependencies. Use when the user asks to clean code, remove dead code, prune unused code, simplify stale modules, or reduce unused imports/files without changing behavior.
---

# Clean Code

Use this skill to remove dead code safely. The goal is smaller, clearer code with no behavior changes.

## Scope

Good targets:

- unused imports, variables, props, helpers, types, and exports
- unreachable branches and stale feature flags
- obsolete comments, TODOs, and docs that no longer match the code
- unreferenced components, screens, services, styles, assets, and tests
- duplicate helpers when one clear local pattern already exists
- dependencies that are no longer imported anywhere

Do not remove:

- public APIs, exported types, Firebase/hosting/config entrypoints, route files, generated files, migrations, schema files, or assets that may be loaded dynamically unless usage is disproven
- compatibility code for persisted data, user progress, auth, security rules, or deployed behavior without explicit approval
- user changes unrelated to the cleanup

## Workflow

1. Establish the current state.
   - Check `git status` and do not revert unrelated changes.
   - Read nearby code before judging something as unused.
   - Prefer exact searches for symbol/file usage, then semantic exploration if usage may be indirect.

2. Build a candidate list.
   - Classify each candidate as `safe`, `needs proof`, or `do not touch`.
   - Treat dynamic imports, string-based registry keys, CSS class names, Firebase config names, and serialized data fields as `needs proof`.
   - If many candidates appear, clean one module or feature area at a time.

3. Remove in small batches.
   - Delete the smallest coherent set first.
   - Keep public behavior and data shape unchanged.
   - Prefer removing code over adding shims or compatibility layers for unshipped local work.
   - When removing a file, also remove registry entries, imports, CSS references, tests, docs, and package dependencies that only existed for it.

4. Verify immediately.
   - Run focused lint/type checks when available.
   - Run the repo's normal `lint`, `build`, or test commands after substantive cleanup.
   - If verification fails, fix the cleanup or restore only the code you removed in this cleanup batch.

5. Summarize clearly.
   - List what was removed and why it was safe.
   - Mention verification commands and results.
   - Call out anything intentionally left because usage was dynamic, public, persisted, or uncertain.

## Dead-Code Proof Checklist

Before deleting a symbol/file, confirm at least one of these:

- no exact references exist outside its own definition
- all references are tests/docs for already removed code
- all references are exports from an unused barrel file and no consumers import the barrel member
- it is unreachable from the active registry, route map, entrypoint, or feature flag path
- it is a dependency with no imports, no tool config usage, and no scripts requiring it

If proof depends on runtime behavior, do not delete until a test/build/manual check covers that path.

## Output Format

```markdown
## Cleanup Summary
- Removed ...
- Simplified ...

## Verification
- `command`: pass/fail

## Left In Place
- ...
```

## Guardrails

- Never use broad destructive commands.
- Never delete secrets, config, or generated artifacts just because they look unused.
- Never modify git history or create a commit unless explicitly asked.
- Ask before deleting code that may be part of a shipped public interface or persisted data contract.
