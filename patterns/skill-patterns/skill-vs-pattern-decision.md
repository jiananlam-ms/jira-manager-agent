# Skill vs Pattern Decision Gate

## Purpose
This pattern provides a decision framework for determining whether a capability should be implemented as a skill (executable procedure) or a pattern (referenceable content).

---

## The Core Distinction

| Aspect | Skill | Pattern |
|--------|-------|---------|
| **Nature** | Executable procedure | Referenceable content |
| **Output** | Tangible artifact (file, API response, decision) | Guidance applied by a skill |
| **Invocation** | Called by agent or other skill | Read and referenced within a skill |
| **Examples** | API wrapper, workflow orchestration | Checklist, policy criteria, framework |

---

## Decision Gate (Sequential Questions)

Ask these questions in order. Stop at the first YES.

### Step 1: Is it a SKILL?

| Question | If YES → |
|----------|----------|
| Does it wrap an external API or service? | **SKILL** (Tool type) |
| Does it orchestrate a multi-step workflow producing tangible output? | **SKILL** (Workflow type) |
| Does it require execution context (API calls, file I/O, state management)? | **SKILL** |

If all answers are NO → proceed to Step 2.

### Step 2: Is it PATTERN-LIKE content?

| Question | If YES → |
|----------|----------|
| Is it validation logic, checklist, or acceptance criteria? | **PATTERN-LIKE** |
| Is it a framework, methodology, or evaluation rubric? | **PATTERN-LIKE** |
| Is it rules, constraints, policies, or standards? | **PATTERN-LIKE** |
| Is it a classification system or decision tree? | **PATTERN-LIKE** |
| Does its "output" consist only of pass/fail or category labels? | **PATTERN-LIKE** |

### Step 3: How to package PATTERN-LIKE content?

| Size | Packaging |
|------|-----------|
| <100 lines | Inline in skill's validation phase |
| ≥100 lines | Separate pattern file, skill references it by path |

> **Note on threshold:** 50 lines was too aggressive. 100 lines (~3 screens of content) is a reasonable threshold where file extraction starts providing value through reusability and reduced cognitive load.

---

## Examples

### SKILL Examples (Correct)
- `grammarly-quality-check` — Wraps Grammarly API, returns structured report
- `keyword-research-workflow` — Orchestrates DataForSEO calls, prioritization, outputs calendar
- `editorial-review-orchestration` — Multi-step review process, outputs approval decision

### PATTERN Examples (Correct)
- `e-e-a-t-framework.md` — Quality framework checklist, referenced by multiple workflows
- `technical-seo-checklist.md` — Validation criteria, inline or referenced
- `ymyl-classification-criteria.md` — Decision tree for content classification

### WRONG (Anti-Patterns)
- `e-e-a-t-compliance` as a skill — This is validation logic, not a procedure
- `ymyl-classification` as a skill — This is a decision tree, not executable
- `technical-seo-standards` as a skill — This is a checklist, not a workflow

---

## Application When Designing Skills

When planning new skills:

1. For each candidate capability, run through this decision gate
2. Classify as SKILL or PATTERN-LIKE
3. For PATTERN-LIKE content:
   - If <100 lines: plan to inline in the workflow skill's validation phase
   - If ≥100 lines: plan to create a pattern file and reference it
4. Document pattern references in the skill-spec artifact

---

## Token Economy Rationale

Every skill invocation has overhead:
- Context switching between skills
- Risk of losing conversational context
- Increased token usage for skill handoffs

Keeping validation logic inline or in referenced patterns:
- Preserves workflow context
- Reduces skill count
- Improves token efficiency
- Prevents the "skill soup" anti-pattern

---

## Pattern Structure Guidance

When creating pattern files, include:

- **Purpose**: 1-2 sentences explaining what this pattern defines
- **Content**: The actual criteria, checklist, framework, or standards
- **Application Notes** (optional): When and how to apply this pattern

Skills must reference patterns explicitly by path:
```markdown
## Validation Phase
Read `patterns/e-e-a-t-framework.md` and apply each criterion to the content.
Verify all items in `patterns/technical-seo-checklist.md` pass before proceeding.
```

Not vague references like:
```markdown
## Validation Phase
Apply E-E-A-T framework and technical SEO standards.
```

---

## Pattern Naming Conventions

- Use kebab-case: `e-e-a-t-framework.md`, not `EEAT_Framework.md`
- Be descriptive: `content-policy-criteria.md`, not `policy.md`
- Include type hint where helpful: `*-checklist.md`, `*-framework.md`, `*-criteria.md`

---

## Validation Rules

- [ ] No orphan patterns (every pattern referenced by at least one skill)
- [ ] No circular references (patterns should not reference other patterns)
- [ ] Pattern size reasonable (<200 lines; if larger, consider splitting)
- [ ] Skills explicitly reference patterns by path

---

## Application Notes

This pattern is referenced by:
- `create-skill-spec` skill — runs through the decision gate in Phase 1.2 to validate skill vs pattern
- `create-skill` skill — references during skill generation to confirm type classification
