# Build Plan

Explore the codebase and produce a structured implementation plan. Do not write code until explicitly approved.

## Arguments

`$ARGUMENTS` — The task to plan (e.g. "add login with magic link", "create invoice status dashboard", "refactor this flow to server components", "add filters to users table").

## Rules

**NEVER** write code during this mode.

**NEVER** use Write, Edit, MultiEdit, or NotebookEdit.

**NEVER** run Bash commands that modify files, install packages, move files, or delete anything.

Allowed tools/actions are read-only only:
- Read
- Glob
- Grep
- Bash with read-only commands only (`ls`, `cat`, `find`, `git status`, `git diff`, `git log`, `git show`)
- WebFetch / WebSearch only when external docs are genuinely needed

**MODE: READ-ONLY PLANNING**
If you notice something broken or improvable, do not fix it. Surface it as a finding or a plan note.

---

## Steps

### 1. Understand

Restate the requested goal in 1–2 sentences.

If anything is ambiguous and materially changes implementation, clarify first before exploring. Do not hide assumptions inside the plan.

---

### 2. Explore

Before drafting the plan:

- Locate the relevant files with `Glob` and `Grep`
- Read the existing implementation in the affected areas
- Identify the current patterns already used in the codebase
- Check related tests, hooks, services, schemas, API calls, and shared dependencies
- Read `CLAUDE.md`, `AGENTS.md`, or equivalent local guidance in the relevant project/directory before drafting
- Search for a real example in the codebase before proposing a new pattern

Pay special attention to:
- naming conventions
- file placement
- state management style
- data fetching pattern
- test conventions
- error/loading/empty state handling
- server vs client boundaries
- form handling and validation patterns
- UI component conventions

**Timebox rule:**  
If after exploring the relevant area you still do not understand enough to plan safely, stop and surface specific open questions instead of pretending certainty.

---

### 3. Draft the Plan

Before writing the plan, apply these principles:

- **Always model existing patterns first**  
  Reuse an established approach from the codebase whenever possible.

- **Do not introduce a new pattern unless necessary**  
  If deviating from an existing pattern, explain why.

- **Cite concrete file references**  
  Point to the files that demonstrate the pattern you intend to follow.

- **Prefer minimal, surgical changes**  
  Keep scope tight and avoid opportunistic refactors.

- **Include validation strategy**  
  Mention how the change will be verified after implementation.

---

## Output Format

### Goal
One sentence describing the desired outcome.

### Current understanding
A short summary of how the relevant area works today.

### Assumptions
List explicit assumptions being made. If none, say "None."

### Proposed approach
Explain the implementation direction in 2–6 short paragraphs:
- why this approach fits the current codebase
- what existing patterns it follows
- what alternatives were considered
- why they were not chosen

### Files to change
| File | Planned change | Why this file is affected |
|------|----------------|---------------------------|
| `path/to/file.tsx` | Describe intended change | Reason |

### New files (if any)
| File | Purpose |
|------|---------|
| `path/to/new-file.ts` | Why it is needed |

If no new files are needed, say so explicitly.

### Implementation steps
1. Step one
2. Step two
3. Step three

Keep steps concrete and execution-oriented.

### Test plan
List the tests or verification steps that should confirm the feature/change works:
- unit tests
- integration tests
- manual checks
- lint / type-check / test commands

### Risks / edge cases
List the main things that could go wrong or be missed.

### Open questions
List any unresolved questions that should be answered before implementation.

### Out of scope
Clearly state what this plan will **not** do, to avoid scope creep.
