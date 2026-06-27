# Looping Notes

Use this file for durable lessons that should improve future phase-folder loops. Keep notes concise and broadly reusable. Do not turn this into a task log; phase-specific task status belongs in the phase folder.

## Before Each Loop

- Read the phase folder index and every `phase-*.md` file before implementation.
- Build a dependency map across phases so later work does not invalidate earlier assumptions.
- Check whether phase docs are stale before coding. If the plan no longer matches the codebase, update the phase doc first.
- Identify shared files early and reserve them for the parent/integrator.
- Prefer parallel research/review before parallel implementation.

## Parallel Work Heuristics

- Parallelize tasks that have separate file boundaries and no shared state.
- Keep shared types, registries, global styles, generated config, migrations, and external service setup with the integrator.
- Ask subagents for specific outputs: findings, proposed patches, file-scoped implementation, or test results.
- Integrate one slice at a time and verify after the integrated state is coherent.

## Phase Reflection Template

Before implementation:

```markdown
## Pre-Phase Reflection
- What changed since this phase was written?
- Which assumptions are stale or risky?
- Which tasks can run in parallel?
- Which files must be integrator-only?
- Does the phase doc need edits before coding?
```

After implementation:

```markdown
## Post-Phase Reflection
- What passed?
- What failed, surprised us, or took longer than expected?
- What mistakes should future loops avoid?
- What improvements should be carried into later phases?
- Which phase docs or index status changed?
```

## Mistakes To Watch For

- Starting phase 1 work before reading later phases that change the contract.
- Treating checklist completion as enough when the `Done When` criteria are stricter.
- Running parallel agents against shared files without one integrator.
- Forgetting to update phase docs after implementation changes the plan.
- Recording temporary task status here instead of durable looping lessons.
- Using nullish coalescing for optional env overrides when an empty string should fall back to the app default.
- Treating generated fallback data as a successful AI result; return an explicit generated/fallback status when UX or caching depends on it.
- Letting prompts reveal category counts before a counting challenge; make learners inspect or infer counts from the visual.
- Blocking only the final answer in AI hints when an intermediate count can reveal the same solution path.
- Letting flexible AI copy include numeric facts; keep counts, equations, and answers assembled by code even when surrounding language is themed.
- Mixing decorative theme tokens with stable math identifiers; motif shapes and colors should never replace stable item IDs or category keys.
- Shipping reusable visual primitives that only barely work for one theme; polish hats, shirts, pants, and limbs before reusing them across themes.
- Character clothing primitives need connected sleeves and layered torsos so pants/shorts do not peek through the shirt.
- When polishing SVG character clothes, preserve the layer stack: legs first, arms behind clothing, sleeves/torso above arms, hands visible at cuffs, accessories above the face.
- If repeated SVG tweaks make a character look worse, replace the primitive with a simpler readable construction instead of compounding path complexity.
- For theme characters that recolor on selection, use generated inline SVG primitives with explicit slots instead of external images that cannot be recolored safely.
