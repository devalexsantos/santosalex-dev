# Polish Changes

Review all current changes for quality, correctness, and consistency before commit or PR. Fix issues directly in changed files when appropriate, then produce a concise summary.

## Context

You are a senior engineer performing a final polish pass on in-progress work. Your goal is to catch problems that are easy to miss mid-flow:
- dead code
- style inconsistencies
- anti-patterns
- convention drift
- small correctness issues
- weak tests
- avoidable complexity

Be surgical:
- fix what is wrong
- keep what is already right
- only touch files in the current diff
- do not refactor unrelated files
- do not rewrite architecture during polish

Before starting, check whether there is a `CLAUDE.md`, `AGENTS.md`, or similar guidance in the current project directory and follow it.

---

## Process

### 1. Understand the diff

Inspect the current working tree first.

Typical commands:
```bash
git diff HEAD
git status
```

If the diff is empty and there are no untracked files, state clearly that the working tree is clean and stop.

Read every changed and new file in full before judging implementation details.

---

### 2. Run baseline verification

Before making edits, run the project's validation commands so you know which failures already existed.

Use the project's actual commands from `package.json`, `CLAUDE.md`, or project docs.

Typical examples:
```bash
npm run lint
npm run type-check
npm test
```

Rules:
- note pre-existing failures
- do not silently ignore them
- do not attempt broad unrelated fixes
- any failure introduced by your polish pass must be resolved

---

### 3. React / TypeScript hygiene

Check each changed file for:

- **Unused imports** — remove anything not referenced
- **Dead code** — remove commented-out JSX/logic, `console.log`, `debugger`, `alert`, abandoned branches
- **Weak typing** — replace `any` where reasonably possible; avoid widening types just to silence errors
- **Dependency arrays** — ensure `useEffect`, `useMemo`, and `useCallback` dependencies are correct
- **Over-memoization** — remove unnecessary `useMemo` / `useCallback` when they add noise without benefit
- **State misuse** — avoid derived state that can be computed from props/state directly
- **Hooks correctness** — never call hooks conditionally or after early returns
- **List rendering** — check key stability; avoid index when order can change
- **Conditional rendering clarity** — simplify nested ternaries or repeated guards when appropriate
- **Prop/API consistency** — names and types should align with surrounding code patterns

---

### 4. Codebase pattern compliance

Check changed files against established conventions in the codebase:

- **Design system usage** — no imports from deprecated/legacy component packages when established alternatives exist
- **Styling consistency** — tokens, class names, spacing, and utility conventions should match nearby code
- **File structure** — colocate files as the codebase expects; avoid unnecessary new abstractions
- **Data fetching pattern** — queries/mutations/hooks should follow project conventions
- **Naming** — handlers, variables, functions, and files should match local naming style
- **Forms and validation** — follow the project's established schema/form patterns
- **Server/client boundaries** — verify components/hooks are on the correct side of the boundary

---

### 5. Code cleanliness

Remove or improve:

- **Redundant comments** — comments that merely restate the code
- **Overly verbose code** — repeated logic or conditionals that can be simplified safely
- **Magic values** — extract repeated or non-obvious values when appropriate
- **Inconsistent naming** — align with surrounding terminology
- **Accidental duplication** — repeated helpers, repeated literals, repeated UI fragments
- **Unreadable branching** — simplify when possible without changing behavior

---

### 6. Test coverage review

For any new component, hook, utility, or changed behavior:

- check whether a corresponding test exists
- if missing, note it clearly
- verify tests still reflect the updated behavior
- look for shallow assertions that do not validate real behavior
- flag missing edge cases such as:
  - empty state
  - loading state
  - error state
  - disabled state
  - permission-based rendering
  - interaction side effects

Flag low-value tests such as those that only assert static text presence without validating behavior.

---

### 7. Re-run verification

After edits:

- run lint again
- run type-check again
- run tests again

Any failures introduced by this pass must be fixed before completion.

If there were pre-existing failures, surface them explicitly in the final output.

---

## Output

After the polish pass, produce:

### Polish Summary

**Fixed**
- list of issues fixed inline

**Flagged (needs a human decision)**
- list of issues intentionally not changed because they require product/engineering decision

**Verification**
- Lint: ✅ / ❌
- Type-check: ✅ / ❌
- Tests: ✅ / ❌

**Notes**
- include any relevant pre-existing failures
- mention if the tree was already clean
- mention if no changes were necessary
