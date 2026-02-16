# Skill Type Taxonomy

## 1. Core Philosophy

**The Fundamental Distinction:**
- **Skills** are executable procedures that produce tangible artifacts
- **Patterns** are reference content that informs skills during execution

**The 2-Tier Model:**
For any domain, expect only two types of skills:
1. **Tool Skills** — Wrap external APIs and services
2. **Workflow Skills** — Orchestrate multi-step procedures

Everything else (knowledge, evaluation criteria, policies, frameworks) belongs in patterns — either inlined in workflow skills (<100 lines) or as separate pattern files (≥100 lines).

> **OLD thinking**: "If it's important, make it a skill"
> **NEW thinking**: "Skills are executable procedures; validation/policy content lives in patterns referenced by skills"

---

## 2. Valid Skill Types

### 2.1 Tool Skills

**Purpose:** Wrap external APIs, services, or systems

**Characteristics:**
- Require execution context (API calls, authentication, I/O)
- Produce tangible output (data, reports, confirmations)
- Encapsulate integration complexity
- May include retry logic, error handling, rate limiting

**Examples:**
- `grammarly-quality-check` — Calls Grammarly API, returns structured report
- `dataforseo-keyword-research` — Queries DataForSEO, returns keyword data
- `wordpress-publishing` — Publishes content to CMS

**Structure:**
```yaml
skill:
  name: grammarly-quality-check
  type: tool
  wraps: "Grammarly API"
  inputs:
    - content_text
    - check_types: [grammar, spelling, plagiarism]
  outputs:
    - quality_report: {scores, issues, suggestions}
  procedure:
    - authenticate
    - submit_content
    - poll_for_results
    - parse_and_structure_response
```

**Decision criteria:**
- Does it call an external API or service? → Tool skill
- Does it require credentials or authentication? → Tool skill
- Is the complexity in the integration, not the business logic? → Tool skill

---

### 2.2 Workflow Skills

**Purpose:** Orchestrate multi-step procedures that produce tangible outputs

**Characteristics:**
- Multiple procedural steps in sequence
- May invoke tool skills
- May reference patterns for validation phases
- Produces tangible artifacts (files, decisions, reports)
- Contains business logic and decision points

**Examples:**
- `editorial-review-orchestration` — Multi-step review process, outputs approval decision
- `content-planning-workflow` — Research → strategy → calendar creation
- `keyword-research-workflow` — Data gathering → analysis → prioritization → output

**Structure:**
```yaml
skill:
  name: editorial-review-orchestration
  type: workflow

  skill_dependencies:        # Other skills this invokes
    - grammarly-quality-check

  pattern_references:        # Patterns this reads for validation
    - patterns/e-e-a-t-framework.md (Phase 3)
    - patterns/technical-seo-checklist.md (Phase 4)

  procedure:
    phases:
      - name: "1. Quality Check"
        action: "Invoke grammarly-quality-check"
        output: "Quality report"

      - name: "2. E-E-A-T Validation"
        action: "Read patterns/e-e-a-t-framework.md, apply criteria"
        output: "Compliance status"

      - name: "3. Decision"
        action: "Aggregate results, determine approval/revision/rejection"
        output: "Editorial decision with rationale"
```

**Decision criteria:**
- Does it have multiple procedural steps? → Workflow skill
- Does it produce a tangible artifact (not just pass/fail)? → Workflow skill
- Does it orchestrate other skills or apply patterns? → Workflow skill

---

## 3. Pattern Types (NOT Skills)

The following are NOT skill types. They are pattern types — reference content that skills read and apply during execution.

### 3.1 Knowledge Patterns

**What they are:** Domain knowledge, reference information, glossaries, style guides

**Why NOT skills:**
- Declarative content, not procedural
- No execution context required
- No steps to follow — just information to reference
- "No procedural steps" = pattern, not skill

**Correct packaging:**
- If <100 lines: Inline in agent prompt or workflow skill
- If ≥100 lines: Separate pattern file in `patterns/`

**Examples:**
- `patterns/style-guide.md` — Voice, tone, formatting standards
- `patterns/domain-terminology.md` — Glossary of terms
- `patterns/brand-guidelines.md` — Brand voice and visual standards

---

### 3.2 Evaluation Patterns

**What they are:** Rubrics, checklists, scoring criteria, acceptance criteria

**Why NOT skills:**
- Rubric-based content, not procedural
- "Apply this checklist" is a step in a workflow, not a skill itself
- Output is pass/fail or scores — not a tangible artifact
- The workflow that USES the rubric is the skill

**Correct packaging:**
- If <100 lines: Inline in workflow's validation phase
- If ≥100 lines: Separate pattern file, workflow references by path

**Examples:**
- `patterns/e-e-a-t-framework.md` — Quality evaluation criteria
- `patterns/content-quality-rubric.md` — Scoring dimensions with levels
- `patterns/code-review-checklist.md` — Review criteria

---

### 3.3 Policy Patterns

**What they are:** Rules, constraints, compliance requirements, content policies

**Why NOT skills:**
- Validation logic, not executable procedures
- Policies tell you WHAT to check, not HOW to execute
- Creating separate "policy skills" fragments context

**Correct packaging:**
- If <100 lines: Inline in workflow's validation phase
- If ≥100 lines: Separate pattern file

**Examples:**
- `patterns/content-policy-criteria.md` — Content rules and constraints
- `patterns/data-handling-policy.md` — Data governance rules
- `patterns/compliance-requirements.md` — Regulatory requirements

---

### 3.4 Framework Patterns

**What they are:** Methodologies, decision trees, classification systems

**Why NOT skills:**
- Frameworks guide decisions, they don't execute
- Decision trees produce classifications, not artifacts
- The workflow applying the framework is the skill

**Correct packaging:**
- Same as above: inline if <100 lines, separate file if ≥100 lines

**Examples:**
- `patterns/ymyl-classification-criteria.md` — Classification decision tree
- `patterns/risk-assessment-framework.md` — Risk evaluation methodology

---

## 4. Decision Gate

For each capability, run through this gate:

### Step 1: Is it a SKILL?

| Question | If YES → |
|----------|----------|
| Does it wrap an external API or service? | **Tool Skill** |
| Does it orchestrate multi-step procedures with tangible output? | **Workflow Skill** |
| Does it require execution context (API calls, file I/O, state)? | **Skill** |

If all answers are NO → proceed to Step 2.

### Step 2: Is it PATTERN-LIKE content?

| Question | If YES → |
|----------|----------|
| Is it reference information with no procedural steps? | **Pattern** |
| Is it validation logic, checklist, or acceptance criteria? | **Pattern** |
| Is it a rubric, scoring system, or evaluation criteria? | **Pattern** |
| Is it rules, constraints, policies, or standards? | **Pattern** |
| Is it a framework, methodology, or decision tree? | **Pattern** |
| Does its only "output" consist of pass/fail or a classification? | **Pattern** |

### Step 3: How to package PATTERN-LIKE content?

| Size | Packaging |
|------|-----------|
| <100 lines | Inline in skill's validation phase |
| ≥100 lines | Separate pattern file, skill references by path |

See the skill-vs-pattern decision gate for detailed guidance.

---

## 5. Granularity Guidelines

**Too granular (merge up):**
- Single-use content
- Very small (<50 lines)
- Only used by one parent skill

**Too coarse (split):**
- Unrelated content mixed together
- Used by very different roles
- >500 lines with distinct concerns

**Right-sized:**
- Complete coverage of one concern
- Used by 1-3 related workflows
- 50-300 lines typical for skills
- <200 lines typical for patterns

---

## 6. Dependencies

### 6.1 Skill Dependencies

Skills may invoke other skills:
```
workflow-skill → tool-skill (for API calls)
workflow-skill → workflow-skill (for sub-processes)
```

Keep dependencies shallow (max 2-3 levels). Avoid circular dependencies.

### 6.2 Pattern References

Skills may reference patterns:
```
workflow-skill → pattern (for validation criteria)
```

Patterns should NOT reference other patterns — keep flat.

---

## 7. Anti-Patterns

### 7.1 Knowledge "Skills" (ANTI-PATTERN)

**Problem:** Reference information elevated to skill status

**Symptom:**
- Skills with "No procedural steps"
- Skills that are just glossaries, style guides, or reference docs
- Skills whose only action is "read this information"

**Why wrong:**
- If there are no steps, it's not a procedure
- Reference content belongs in patterns or agent prompts

**Fix:** Convert to pattern file or inline in agent/workflow.

---

### 7.2 Evaluation "Skills" (ANTI-PATTERN)

**Problem:** Rubrics and checklists elevated to skill status

**Symptom:**
- Skills that are scoring rubrics with dimensions and levels
- Skills named like "content-evaluation", "quality-assessment"
- Skills whose only output is a score or pass/fail

**Why wrong:**
- A rubric is reference content, not a procedure
- The workflow APPLYING the rubric is the skill
- Evaluation skills fragment context unnecessarily

**Fix:** Convert rubric to pattern. Evaluation becomes a phase in the workflow skill.

---

### 7.3 Policy Skills (ANTI-PATTERN)

**Problem:** Policies/validation criteria as standalone skills

**Symptom:**
- Skills named like "content-policy-validation", "compliance-check"
- Skills whose output is just "validated" or "compliant"
- Skills that are checklists or decision trees

**Why wrong:**
- Policies are validation rules, not procedures
- They belong as phases WITHIN workflow skills
- Creating separate skills fragments context

**Fix:** Merge into parent workflow. Extract lengthy criteria to pattern files.

---

### 7.4 Constraint Skills (ANTI-PATTERN)

**Problem:** Business rules or classification logic as standalone skills

**Symptom:**
- Skills that classify/categorize (e.g., "ymyl-classification")
- Skills that are decision trees with no execution
- Skills whose output is just a category label

**Why wrong:**
- Classification belongs in the workflow making routing decisions
- Every skill invocation has context-switching overhead

**Fix:** Inline classification logic in workflow skill.

---

### 7.5 Template "Skills" (ANTI-PATTERN)

**Problem:** Templates packaged as skills

**Symptom:**
- Skills that are just placeholder structures
- Skills named like "report-template", "email-template"

**Why wrong:**
- Templates are a separate factory resource type (`templates/`)
- Skills are procedures, templates are structures

**Fix:** Use factory template system. Skills reference templates, not become them.

---

### 7.6 Skill Soup

**Problem:** Too many tiny skills
**Symptom:** Agents constantly switching between skills
**Fix:** Consolidate related content; merge into parent workflows

---

### 7.7 Monolith Skill

**Problem:** One massive skill with everything
**Symptom:** >500 lines; hard to navigate; role-inappropriate content
**Fix:** Split by concern; extract patterns for validation content

---

### 7.8 Circular Dependencies

**Problem:** Skill A depends on B which depends on A
**Symptom:** Can't determine execution order
**Fix:** Extract common content to pattern or shared skill

---

### 7.9 Orphan Skills/Patterns

**Problem:** Skills or patterns not referenced by anything
**Symptom:** Maintenance burden without value
**Fix:** Remove or assign to a workflow

---

## 8. Summary

| Content Type | Classification | Packaging |
|--------------|---------------|-----------|
| API wrapper | Tool Skill | Skill file |
| Multi-step procedure | Workflow Skill | Skill file |
| Reference information | Knowledge Pattern | Inline or pattern file |
| Rubric/checklist | Evaluation Pattern | Inline or pattern file |
| Rules/constraints | Policy Pattern | Inline or pattern file |
| Methodology/decision tree | Framework Pattern | Inline or pattern file |
| Output structure | Template | Factory template |

**Expected skill count:** (number of tools) + (number of workflows) ± 4

**Red flags:**
- Skill count outside expected range
- Skills named with "policy", "validation", "compliance", "evaluation"
- Skills with no procedural steps
- Skills whose only output is pass/fail or a classification

---

## Application Notes

This pattern is referenced by:
- `create-skill-spec` skill — validates skill type classification during Phase 3
- `create-skill` skill — references type criteria when generating skill files
- `CLAUDE.md` — summarizes the skill-vs-pattern decision gate
