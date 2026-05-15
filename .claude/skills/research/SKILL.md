# Research

Investigate how something works in the codebase and produce a clear written explanation. Do not create, edit, move, or delete files.

## Arguments

`$ARGUMENTS` — What to investigate (e.g. "how does auth flow work in this project?", "where is the API client configured?", "how are server actions organized?", "how does this feature load data?").

## Rules

**NEVER** use Write, Edit, MultiEdit, NotebookEdit, or any command that modifies files.

Allowed tools/actions are read-only only:
- Read
- Glob
- Grep
- Bash with read-only commands only (`ls`, `cat`, `find`, `git status`, `git diff`, `git log`, `git show`)
- WebFetch / WebSearch only if explicitly necessary for external documentation

If you find something that looks wrong while researching:
- **do not fix it**
- **do not propose code immediately**
- note it under **Incidental Findings**

**MODE: READ-ONLY IDENTIFICATION**
Your job is to understand and explain, not implement.

---

## Steps

### 1. Understand the Question

If `$ARGUMENTS` is empty, ask what should be investigated before proceeding.

Restate the research goal in 1–2 sentences.

If the scope is ambiguous, resolve the ambiguity before exploring. Do not proceed with hidden assumptions.

---

### 2. Explore

Start from the entry point implied by `$ARGUMENTS`, then follow imports, references, and call chains inward.

During exploration:

- Use `Glob` and `Grep` to locate relevant files
- Read the entry points first, then follow the flow
- Check related hooks, services, utilities, schemas, and components
- Read any `CLAUDE.md`, `AGENTS.md`, or equivalent local guidance in the relevant directory before going deeper
- When architecture is involved, cross-check config files like:
  - `package.json`
  - `tsconfig.json`
  - framework config files
  - lint/test/build configs
- Prefer understanding the real implementation over inferring from file names

**Timebox rule:**  
If you have read many files and still do not have a clear model, stop digging and surface:
- what is already known
- what is still unclear
- which file likely contains the missing answer

---

### 3. Synthesis

Produce a structured explanation with the sections below.

## Output Format

### Summary
A short explanation of what was investigated and the answer at a high level.

### How it works
A plain-language explanation of the mechanism, flow, or architecture.

### Data / control flow
Describe the step-by-step flow from entry point to outcome. Example:
- user action
- component
- hook
- service
- request / mutation
- response handling
- state update
- UI render

If the question is about static structure only, say that explicitly.

### Key files
| File | Role |
|------|------|
| `path/to/file.ts` | What this file is responsible for in the investigated flow |

### Important patterns
List the main implementation patterns used, such as:
- server/client split
- custom hooks
- repository/service pattern
- schema validation
- query/mutation organization
- feature folder structure

### Constraints / boundaries
Clarify what this part of the system owns, and what it delegates elsewhere.

### Incidental findings
Only list notable findings discovered during research, without fixing them.

### Open questions
List anything that could not be verified confidently.
