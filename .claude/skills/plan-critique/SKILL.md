# Plan Critique

Review the current implementation plan as a structured devil's advocate. Surface gaps, risks, wrong assumptions, and missing pieces before implementation begins.

## Arguments

`$ARGUMENTS` — The plan, task, or feature being critiqued.

## Rules

Stay in **plan review mode**.

**Do not implement anything.**  
**Do not edit files.**  
**Do not silently accept unsupported assumptions.**

Allowed tools/actions are read-only only:
- Read
- Glob
- Grep
- Bash with read-only commands only (`ls`, `cat`, `find`, `git status`, `git diff`, `git log`, `git show`)

If the codebase must be checked to validate claims in the plan, do so. Do not rely only on the wording of the plan.

---

## Review Lenses

Work through these lenses systematically.

### 1. Completeness
Check whether the plan covers:
- all affected files
- related usages/imports
- schemas/types/contracts
- loading/error/empty states
- tests
- configuration changes
- migrations if relevant
- analytics/tracking if relevant
- permissions/auth/role effects if relevant

Questions:
- Are any touched areas missing from the plan?
- Are there hidden dependencies?
- Are there consumers that would break if the change is implemented as written?

---

### 2. Correctness of approach
Evaluate whether the proposed approach matches the existing codebase patterns.

Questions:
- Does this follow how similar features are already implemented?
- Is there a simpler approach that better matches existing architecture?
- Is the plan trying to introduce a new pattern unnecessarily?
- Would this create technical debt or inconsistency?

---

### 3. Risks and edge cases
Look for scenarios the plan did not address.

Examples:
- null / undefined states
- async race conditions
- stale state
- cache invalidation
- optimistic updates
- partial failures
- retries
- loading skeletons
- permission edge cases
- SSR/CSR boundary issues
- form validation and dirty state
- accessibility regressions
- responsive layout issues

---

### 4. Assumptions
Identify assumptions that need validation.

Questions:
- What is the plan assuming to be true?
- Which assumptions are weak or unverified?
- Which assumption is most likely to break implementation?
- Should any assumption be verified before coding starts?

---

### 5. Scope control
Evaluate whether the plan is scoped appropriately.

Questions:
- Is the plan too broad?
- Is it too narrow and likely to require immediate follow-up?
- Can it be broken into safer, smaller increments?
- Does it include accidental refactors that should be excluded?

---

## Output Format

### Verdict
Choose one:
- **Ready to approve**
- **Needs revision**

### Critical issues
List the issues that should be resolved before implementation begins.

### Suggestions
List non-blocking improvements that would strengthen the plan.

### Looks solid
List what the plan got right.

### Missing validations
List anything that should be verified in the codebase before implementation starts.

### Recommended amendments
Rewrite or refine the weak parts of the plan into more concrete, safer guidance.

### Final note
A concise summary of whether implementation should proceed now or after revision.
