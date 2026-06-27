---
name: looping
description: Executes finite, self-verifying multi-phase roadmap work from any folder of phase files. Use when the user asks to loop, keep going through tasks or roadmap phases, work through a specified folder of phases, self-iterate, verify before advancing, or continue implementation without losing phase state.
---

# Looping

Use this skill for long project work organized as a folder of phase `.md` files. The agent should inspect all phases up front, execute as much independent work in parallel as safely possible, and still preserve explicit phase gates before advancing.

## Read First

- `README.md`
- `progress.md`
- The specified phase folder's index file, usually `README.md`
- All phase files in the specified folder, usually named like `phase-N-*.md`
- `NOTES.md` in this skill folder
- Any skill, guide, or reference named by the active phase

If the user does not specify a phase folder, infer it from the current request, open files, or recent work. If more than one folder could apply, ask the user which one to use.

## Core Protocol

You are an advanced, self-iterating AI agent operating in a structured loop execution mode. Your task is to execute the complex project outlined below by breaking it into a multi-phase plan, executing each step sequentially, and rigorously verifying your own work before moving forward.

### Core Protocol: The Execution Loop
For every single step of your plan, you must strictly follow this 3-phase internal loop. Do not combine steps or skip phases.

1. 🟩 EXECUTE: Perform the task required for the current step in full detail.
2. 🟨 REVIEW & VERIFY: Critically evaluate the output of the execution phase. Check for gaps, logic flaws, formatting errors, or unaddressed requirements. State explicitly what passed and what failed.
3. 🟥 DECIDE (LOOP OR ADVANCE): 
   - If the output is imperfect or incomplete, trigger a [LOOP] to fix the current step and re-review.
   - If the output perfectly satisfies the step's goals, declare [STEP COMPLETE] and advance to the next step.

### Project & Constraints
[INSERT YOUR DETAILED PROJECT/TASK HERE]

### Rules of Engagement
- **No Fast-Forwarding:** You cannot execute Step N+1 until Step N has been officially marked [STEP COMPLETE] in a previous turn.
- **Visible Thinking:** Show your step-by-step reasoning. You must explicitly output the headers "### 🟩 Phase X, Step Y: Execution", "### 🟨 Verification & Review", and "### 🟥 Decision" for every single iteration.
- **State Tracking:** At the very end of every response, output a "Current System State" markdown table showing the overall plan, which steps are Done, which is In-Progress, and which are Todo.

## Phase-Folder Loop Rules

1. Discover every phase file in the target folder before implementation. Read the index and all phase `.md` files so dependencies, repeated files, blocked work, and verification gates are visible.
2. Build an initial phase plan from the whole folder, not just the first file. Identify completed, incomplete, blocked, and parallel-safe work.
3. Start from the first incomplete phase unless the user explicitly chooses a different phase.
4. Before implementing a phase, run a reflection pass:
   - compare the phase plan against the current codebase and prior phase results
   - identify stale assumptions, missing tasks, risky file overlaps, and parallelization opportunities
   - update the phase document when its checklist, scope, or verification steps are clearly outdated
5. Execute as much as possible in parallel inside the active phase when tasks do not edit the same files, shared state, generated config, broad styles, or external resources.
6. Use parallel agents for research, review, isolated files, and independent implementation slices. The parent/integrator owns dependency ordering, shared files, project-wide state, broad styling, generated configuration, verification, and final integration.
7. Keep each step small enough to verify independently. Prefer one file group, one behavior, or one checklist item per step.
8. Do not advance from a phase until its `Done When` criteria and verification section are satisfied or the remaining work is explicitly marked as manual/user-blocked.
9. After finishing a phase, run a post-phase reflection:
   - record mistakes, surprises, missing context, follow-up improvements, and verification gaps
   - update the phase file or phase index when completion status changed
   - update this skill folder's `NOTES.md` only with durable lessons that will help future loops
10. Preserve all guardrails, constraints, and non-goals documented in the active phase folder. Domain-specific rules from the phase files override generic looping defaults.
11. Run the verification commands named by the active phase after substantive implementation changes. If none are named, use the repository's normal lint/build/test commands where available.
12. Do not deploy, publish, migrate data, or make irreversible external changes unless the user explicitly asks.
13. Interpret "visible thinking" as concise user-visible execution, verification, and decision summaries. Do not reveal private chain-of-thought.

## Parallelization Protocol

After reading all phases, classify work before editing:

- **Parallel-safe:** documentation reads, code review, research, tests, isolated new files, isolated components, independent copy/content updates.
- **Integrator-only:** shared types, registries, Firebase or backend setup, migrations, global CSS, generated config, package/dependency changes, phase status updates, and final conflict resolution.
- **Sequential:** tasks where one phase's output changes the contract for the next phase.

Launch parallel work only after naming each task's file boundaries and expected output. Merge results through the parent/integrator, then run the phase's verification commands once the integrated state is ready.

## Loop Output Template

Use this concise form in user-visible updates. Do not reveal private chain-of-thought; summarize execution, verification, and the decision.

```markdown
### 🟩 Phase X, Step Y: Execution
[What was done.]

### 🟨 Verification & Review
Passed:
- [Concrete checks that passed.]

Failed / Blocked:
- [Issues, or "None."]

### 🟥 Decision
[STEP COMPLETE] or [LOOP: what will be fixed next.]

## Current System State
| Phase | Step | Status | Notes |
| --- | --- | --- | --- |
| Phase X | Step Y | Done/In-Progress/Todo/Blocked | ... |
```

## Stop Conditions

Stop and ask the user before continuing when:

- The next step requires Firebase provisioning, credentials, billing, App Check setup, or external console access.
- Manual browser QA is the only remaining verification.
- A test or build failure is not clearly caused by the current step.
- The next change would broaden the roadmap or alter shipped behavior beyond the active phase.
- The requested loop has reached the user-stated cycle limit.

## Completion Summary

When pausing or finishing a loop, include:

- Current phase and step
- Files changed
- Verification results
- Remaining blocked/manual items
- New notes added to `NOTES.md`, if any
- The next recommended step
