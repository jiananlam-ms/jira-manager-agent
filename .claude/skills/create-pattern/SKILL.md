---
name: create-pattern
type: workflow
description: Creates or enhances pattern files with proper depth and structure. Use when enhancing thin companion patterns from create-skill; when creating new patterns for existing skills; or when creating standalone reference patterns not tied to any skill.
---

# Create Pattern

This skill guides Claude in creating well-structured, comprehensive pattern files.

It focuses on **generating pattern content with proper depth**, not on deciding whether something should be a skill or pattern (that's the `skill-vs-pattern-decision` gate's job).

---

## Purpose

Use this skill to:

- Enhance thin companion patterns scaffolded by `create-skill` into full-depth patterns
- Create new patterns for existing skills that need additional reference content
- Create standalone patterns (governance, role, framework) not tied to any skill
- Ensure patterns follow the established structure (Purpose, Content, Application Notes)
- Validate pattern cross-references when skill-associated

This skill is intended to be used:

- After `create-skill` produces thin companion patterns that need more depth
- Independently when standalone reference content is needed
- By any agent or user who needs to produce well-structured pattern files

---

## Applicability

### When to use this skill

Trigger this skill when:

- `create-skill` generated a thin companion pattern that needs enhancement
- An existing skill needs a new pattern that wasn't in the original spec
- A standalone pattern is needed (governance, role, MCP, or any domain framework)
- A pattern exists but lacks proper depth in Purpose, Content, or Application Notes

Common trigger phrases: "Enhance this pattern", "Create a new pattern for...", "I need a pattern that...", "This pattern needs more depth".

### When not to use this skill

Avoid using this skill when:

- The content is actually a procedure (use `create-skill-spec` instead)
- The pattern already has sufficient depth and structure
- The content is <100 lines and should be inlined in a skill's validation phase
- You need to determine IF something is a pattern (use `skill-vs-pattern-decision` gate first)

In those cases, use `create-skill-spec` for procedures, inline short content in the skill, or consult `patterns/skill-patterns/skill-vs-pattern-decision.md` for classification.

---

## Dependencies

This skill relies on:

- `patterns/skill-patterns/skill-vs-pattern-decision.md` - For validating content is pattern-like
- `patterns/skill-patterns/skill-type-taxonomy.md` - For understanding pattern types (Knowledge, Evaluation, Policy, Framework)
- `patterns/governance-patterns/naming-conventions.md` - For naming standards
- AskUserQuestion tool - For mode selection and standalone pattern elicitation
- WebSearch tool - For researching domain standards and best practices (Phase 2.5)

---

## Inputs

### From the Input Envelope

- **From `project-name`:**
  - Target project name for output (determines output directory `projects/{project-name}/`)
  - If not provided, ask user via AskUserQuestion before proceeding (see step 1.0)

- **From `goal`:**
  - Which mode: enhance existing pattern, create new skill-associated pattern, or create standalone pattern
  - For skill-associated: which skill and which pattern

- **From `context`:**
  - Domain context for the pattern's subject matter
  - Related patterns already in the project

- **From `constraints`:**
  - Pattern size limits (<200 lines typical)
  - Naming conventions to follow
  - Domain-specific requirements

- **From `upstream`:**
  - Mode 1 (Skill-associated): The skill's SKILL.md, existing pattern files, skill-spec artifact
  - Mode 2 (Standalone): User-provided description or domain requirements

- **From `extra`:**
  - Examples of similar patterns
  - Reference materials about the domain

### From the File System

Use file tools (Glob, Read) to locate:

- `projects/{project-name}/skills/*/SKILL.md` - For skill-associated patterns
- `projects/{project-name}/patterns/` - For existing patterns in the project
- `patterns/skill-patterns/skill-vs-pattern-decision.md` - For pattern validation
- `patterns/skill-patterns/skill-type-taxonomy.md` - For pattern type classification

### Missing Input Handling

- **Required inputs:** Mode selection (skill-associated or standalone). Cannot proceed without knowing which mode.
- **Optional inputs:** Domain context, examples, size constraints (proceed with defaults)
- **Document assumptions in:** The generated pattern's Application Notes section

---

## Outputs

### Output Type

File Artifact

### Primary Output

- **Description:** A complete, well-structured pattern file with Purpose, Content, and Application Notes
- **Format:** Structured markdown document

### Written Artifacts

- **Tool:** Write tool
- **Location:** `projects/{project-name}/patterns/{pattern-domain}/`
- **Naming pattern:** `{pattern-key}.md`
- **Example:** `projects/{project-name}/patterns/seo-patterns/e-e-a-t-framework.md`
- **Validation:** All required sections populated (Purpose, Content); Application Notes present if cross-referenced by skills; pattern under 200 lines

### Downstream Usage

- Skills that reference this pattern: Read it during validation or reasoning phases
- Other patterns: Should NOT reference this pattern (patterns stay flat, no inter-pattern dependencies)
- Agents: May read patterns directly for reference content

---

## Procedure

Claude should follow this procedure when using this skill.

### Phase 1: Mode Selection and Input Gathering (1.0-1.3)

#### 1.0 Resolve project name

If `project-name` was not provided in the input envelope, use `AskUserQuestion` to ask the user:
- "What is the project name for this output? (used for the output directory `projects/{project-name}/`)"

Store the project name for use in all output paths.

#### 1.1 Determine mode

Use AskUserQuestion:

```
question: "What would you like to do?"
header: "Mode"
options:
  - label: "Enhance existing pattern"
    description: "Flesh out a thin pattern that create-skill scaffolded or improve an existing pattern's depth"
  - label: "New pattern for a skill"
    description: "Create an additional pattern for an existing skill that needs more reference content"
  - label: "Standalone pattern"
    description: "Create a pattern not tied to any specific skill (governance, role, framework, etc.)"
multiSelect: false
```

Store the selected mode for branching in subsequent phases.

#### 1.2 Gather inputs based on mode

**Mode: Enhance existing pattern**

1. Use Glob to find existing patterns: `projects/{project-name}/patterns/**/*.md`
2. Present found patterns via AskUserQuestion for selection
3. Use Read to open the selected pattern file
4. Use Glob to find skills that reference this pattern: `projects/{project-name}/skills/*/SKILL.md`
5. Use Grep to confirm which skills reference this pattern by path
6. Use Read to open the referencing skill(s) to understand the pattern's expected role

**Mode: New pattern for a skill**

1. Use Glob to find existing skills: `projects/{project-name}/skills/*/SKILL.md`
2. Present found skills via AskUserQuestion for selection
3. Use Read to open the selected skill's SKILL.md
4. Identify what additional pattern content the skill needs — look at procedure steps that reference criteria, frameworks, or checklists without a corresponding pattern file
5. If a skill-spec artifact exists in `projects/{project-name}/design-artifacts/`, use Read to check for pattern specifications

**Mode: Standalone pattern**

1. Use AskUserQuestion to gather the pattern's subject:

```
question: "What domain does this pattern cover?"
header: "Domain"
options:
  - label: "Governance"
    description: "Naming conventions, policies, compliance rules"
  - label: "Role"
    description: "Role archetypes, collaboration models, team structures"
  - label: "Skill"
    description: "Skill methodology, procedure frameworks, type classifications"
  - label: "Domain-specific"
    description: "Custom domain (e.g., SEO, security, design)"
multiSelect: false
```

2. Use AskUserQuestion to gather what the pattern defines (free-text via "Other" option encouraged):

```
question: "What type of content does this pattern define?"
header: "Type"
options:
  - label: "Checklist / Criteria"
    description: "Validation items, acceptance criteria, quality gates"
  - label: "Framework / Methodology"
    description: "Decision trees, classification systems, evaluation rubrics"
  - label: "Reference / Knowledge"
    description: "Domain glossaries, style guides, best practices"
  - label: "Rules / Policy"
    description: "Constraints, standards, compliance requirements"
multiSelect: false
```

3. Ask follow-up questions to understand the pattern's specific content — what items, criteria, or rules it should contain

#### 1.3 Validate this is pattern content

**Skip for "Enhance existing pattern" mode** — the file is already a pattern scaffolded by `create-skill`. Proceed directly.

**For "New pattern for a skill" and "Standalone" modes:**

Read `patterns/skill-patterns/skill-vs-pattern-decision.md` and run through the decision gate:

- Does this content wrap an external API? → SKILL, not pattern. Redirect to `create-skill-spec`.
- Does this content orchestrate multi-step procedures? → SKILL, not pattern. Redirect to `create-skill-spec`.
- Is it reference information, validation logic, a framework, rules, or a checklist? → PATTERN. Proceed.

If it's not a pattern, inform the user and suggest the appropriate path. Do NOT proceed.

**Output of Phase 1:** Mode selected, inputs gathered, content validated as pattern-like.

### Phase 2: Pattern Design (2.1-2.4)

#### 2.1 Classify pattern type

**For "Enhance existing pattern" mode:** Infer the type from the existing pattern's content and structure. Read the thin pattern and determine which type it already is. Do not re-classify from scratch.

**For "New pattern for a skill" and "Standalone" modes:** Read `patterns/skill-patterns/skill-type-taxonomy.md` sections 3.1-3.4 and classify:

| Pattern Type | Characteristics |
|-------------|-----------------|
| Knowledge Pattern | Domain knowledge, reference information, glossaries, style guides |
| Evaluation Pattern | Rubrics, checklists, scoring criteria, acceptance criteria |
| Policy Pattern | Rules, constraints, compliance requirements, content policies |
| Framework Pattern | Methodologies, decision trees, classification systems |

Document the classification and rationale.

#### 2.2 Determine pattern domain and naming

**For "Enhance existing pattern" mode:** Preserve the existing path and filename. The pattern already has its domain directory and name. Record the existing full path for use in Phase 4.

**For "New pattern for a skill" and "Standalone" modes:**

**Gather context:**
- Review the pattern's subject matter from Phase 1
- Read `patterns/governance-patterns/naming-conventions.md` for naming standards

**Reason through:**
- What domain does this pattern belong to? (e.g., `seo-patterns`, `governance-patterns`, `role-patterns`)
- What is the descriptive kebab-case name? (e.g., `e-e-a-t-framework`, `content-policy-criteria`)
- Does the name include a type hint? (`*-checklist`, `*-framework`, `*-criteria`, `*-guide`)

**Document:**
- Pattern domain directory: `projects/{project-name}/patterns/{pattern-domain}/`
- Pattern filename: `{pattern-key}.md`
- Full path: `projects/{project-name}/patterns/{pattern-domain}/{pattern-key}.md`

#### 2.3 Design pattern content structure

**Reason through:**
- What are the main sections or categories within this pattern's content?
- For checklists: What are the check items and their pass criteria?
- For frameworks: What are the dimensions, levels, or decision branches?
- For reference content: What are the key topics and their definitions?
- For policies: What are the rules and their rationale?
- Is the total content likely under 200 lines? If not, consider splitting.

#### 2.4 For enhance mode — identify gaps in existing pattern

**Only for "Enhance existing pattern" mode:**

Compare the existing thin pattern against the pattern type's expected depth:

| Pattern Type | Expected Depth |
|-------------|----------------|
| Knowledge | Comprehensive coverage of domain terms or concepts with examples |
| Evaluation | All criteria listed with clear pass/fail thresholds and scoring guidance |
| Policy | All rules stated with rationale and edge case handling |
| Framework | All dimensions/branches documented with decision guidance |

List specific gaps to fill.

**Output of Phase 2:** Pattern type classified, domain and name determined, content structure designed.

### Phase 2.5: Domain Research (optional)

#### 2.5.1 Determine if research applies

Skip this phase if the pattern covers **project-internal content** (internal naming rules, team-specific workflows, custom taxonomies). Proceed if the pattern is grounded in **external standards, industry practices, or established domain knowledge**.

Use this gate:

| Signal | Action |
|--------|--------|
| Pattern references an industry standard (OWASP, WCAG, ISO, etc.) | Research |
| Pattern covers a well-established methodology or framework | Research |
| Domain has recognized best practices the user may not have specified | Research |
| Content is entirely project-specific or organizational | Skip |

#### 2.5.2 Execute targeted research

Run **2-3 focused WebSearch queries** based on the pattern type and domain from Phase 2:

| Pattern Type | Query Strategy |
|-------------|---------------|
| Knowledge | `"{domain} glossary"`, `"{domain} key concepts definitions"` |
| Evaluation | `"{domain} evaluation criteria standard"`, `"{domain} quality checklist"` |
| Policy | `"{domain} policy best practices"`, `"{domain} compliance requirements"` |
| Framework | `"{domain} framework methodology"`, `"{domain} decision model"` |

Tailor query terms to the specific subject — e.g., for an SEO content quality pattern, search `"E-E-A-T evaluation criteria"` not generic `"SEO best practices"`.

#### 2.5.3 Synthesize findings

From research results, extract **only items that fit the content structure designed in Phase 2.3**. Do not reshape the pattern around search results.

- Identify established criteria, terms, or rules that strengthen the Content section
- Note the source standard or authority for each adopted item (for attribution in Application Notes)
- Discard tangential findings — if it doesn't map to a planned content section, drop it

**Output of Phase 2.5:** A shortlist of research-backed items to incorporate, with source attribution.

### Phase 3: Pattern Generation (3.1-3.3)

#### 3.1 Reason through and document Purpose section

**Gather context:**
- Review the pattern's subject matter and type from Phase 2
- For skill-associated: review the referencing skill's procedure to understand how the pattern is used

**Reason through:**
- What does this pattern define in 1-2 sentences?
- What question does someone answer by reading this pattern?
- Is the purpose specific enough that someone can decide whether this pattern applies to their need?

**Document:**
Write the Purpose section (1-2 sentences). It should answer: "This pattern defines {what} for use when {context}."

#### 3.2 Reason through and document Content section

**Gather context:**
- Review the content structure from Phase 2.3
- If Phase 2.5 was executed, review the shortlist of research-backed items and their source attributions
- For enhance mode: read the existing thin pattern to preserve any content already there
- For skill-associated: review the skill's procedure to understand what the skill expects from this pattern

**Reason through:**
- If Phase 2.5 produced research findings, integrate them into the appropriate content sections. Attribute sourced items (e.g., "Per WCAG 2.1..." or note the standard in Application Notes).
- Is each item in the content actionable and specific?
- For checklists: Can someone unambiguously determine pass/fail for each item?
- For frameworks: Are decision branches clear with no ambiguous paths?
- For reference: Is each entry complete enough to apply without external lookup?
- For policies: Is each rule enforceable and testable?

**Document:**
Write the Content section using the appropriate structure for the pattern type:

- **Checklists:** Bulleted items with clear criteria, optionally organized by category
- **Frameworks:** Dimensions or branches with levels, scores, or decision paths
- **Reference:** Terms or concepts with definitions and usage guidance
- **Policies:** Rules with rationale, organized by scope or priority

Ensure content is specific to the domain, not generic filler.

#### 3.3 Reason through and document Application Notes section

**Gather context:**
- Determine which skills or agents will reference this pattern
- For skill-associated: identify the exact procedure step(s) that read this pattern

**Reason through:**
- Who references this pattern and in what context?
- Are there any caveats or conditions on how this pattern should be applied?
- Does this pattern interact with or complement other patterns?

**Document:**
Write the Application Notes section:

```markdown
## Application Notes

This pattern is referenced by:
- `{skill-name}` skill — {how it uses this pattern}

{If Phase 2.5 research was used, include: "Content informed by: {standard/source name(s)}"}
{Optional: additional notes on application, caveats, or related patterns}
```

For standalone patterns with no current consumers, write: "This pattern is available for use by skills and agents that need {what it provides}."

**Output of Phase 3:** Complete pattern content in all three sections.

### Phase 4: Validation and Output (4.1-4.3)

#### 4.1 Validate pattern structure

| Check | Pass Criteria |
|-------|---------------|
| Purpose section present | 1-2 sentences, specific and scoped |
| Content section present | Substantive domain content, not generic filler |
| Application Notes present | At least one reference or availability statement |
| Filename is kebab-case | Matches `{pattern-key}.md` |
| Pattern under 200 lines | If over, consider splitting |
| No inter-pattern references | Patterns should not depend on other patterns |
| Content items are specific | No vague items like "ensure quality" without criteria |
| Research attribution present (if Phase 2.5 ran) | Sources noted in Application Notes |

#### 4.2 Cross-reference with skill (skill-associated modes only)

**For "Enhance existing pattern" mode:**
- Verify the enhanced pattern still matches the skill's expectations
- Confirm the pattern's path hasn't changed

**For "New pattern for a skill" mode:**

Automatically update the skill's SKILL.md to wire in the new pattern:

1. **Update Dependencies section:**
   - Use Read to open the skill's SKILL.md
   - Locate the `## Dependencies` section
   - Use Edit to add the new pattern reference: `- \`projects/{project-name}/patterns/{pattern-domain}/{pattern-key}.md\` - {brief description of what the pattern provides}`
   - Place it alongside existing pattern dependencies

2. **Insert Read step in procedure:**
   - Identify the procedure phase where this pattern is most relevant (e.g., a validation phase, a reasoning step, or a gather step that references criteria without a corresponding pattern)
   - Use Edit to insert a `Read \`projects/{project-name}/patterns/{pattern-domain}/{pattern-key}.md\`` instruction at the appropriate gather step
   - If no obvious insertion point exists, add it to the earliest phase where the pattern's content would inform a decision

3. **Validate the updates:**

| Check | Pass Criteria | If Failed |
|-------|---------------|-----------|
| Skill Dependencies lists this pattern | Path matches exactly | Re-edit Dependencies section |
| Skill procedure reads this pattern | Explicit Read step with correct path | Re-edit procedure section |
| Pattern path matches skill reference | Exact path match | Fix path or filename |
| Skill file still valid after edits | No broken formatting or orphaned references | Review and fix edits |

#### 4.3 Write pattern file and present summary

Use Write to save the pattern to `projects/{project-name}/patterns/{pattern-domain}/{pattern-key}.md`.

Present summary (adjust heading based on mode):

**For "Enhance existing pattern" mode:**
```
Pattern Enhanced: {pattern-key}
Type: {Knowledge/Evaluation/Policy/Framework}
Location: {existing path}
Gaps filled: {brief list of what was added}

Referenced by: {skill-name(s)}
```

**For "New pattern for a skill" mode:**
```
Pattern Created: {pattern-key}
Type: {Knowledge/Evaluation/Policy/Framework}
Domain: {pattern-domain}
Location: projects/{project-name}/patterns/{pattern-domain}/{pattern-key}.md

Skill updated: {skill-name} SKILL.md
  - Added to Dependencies section
  - Read step inserted at Phase {N}
```

**For "Standalone" mode:**
```
Pattern Created: {pattern-key}
Type: {Knowledge/Evaluation/Policy/Framework}
Domain: {pattern-domain}
Location: projects/{project-name}/patterns/{pattern-domain}/{pattern-key}.md

Referenced by: standalone — no current consumers
```

**Output of Phase 4:** Complete, validated pattern file written to disk.

---

## Failure Modes and Corrections

1. **Generating a skill instead of a pattern (Execution)**
   - Symptom: Output contains procedural steps, tool invocations, or multi-phase workflows
   - Fix: Run through `skill-vs-pattern-decision` gate in Phase 1.3. If procedural, redirect to `create-skill-spec`.

2. **Generic filler content (Domain)**
   - Symptom: Content items like "ensure quality", "follow best practices" without specific criteria
   - Fix: Every content item must be specific and actionable. For checklists, include pass/fail criteria. For frameworks, include concrete decision branches.

3. **Pattern too large (Domain)**
   - Symptom: Pattern exceeds 200 lines
   - Fix: Split into multiple focused patterns. Each pattern should cover one concern.

4. **Missing skill wiring after new pattern creation (Execution)**
   - Symptom: Pattern created for a skill but skill's Dependencies and procedure were not updated
   - Fix: In "New pattern for a skill" mode, Phase 4.2 must auto-update the skill's SKILL.md — add to Dependencies and insert Read step in procedure. Verify edits with the validation table.

5. **Wrong pattern type classification (Domain)**
   - Symptom: A checklist classified as a framework, or reference content classified as policy
   - Fix: Re-check against taxonomy in Phase 2.1. Classification affects content structure.

6. **Research bloat (Execution)**
   - Symptom: Pattern stuffed with search results, exceeds 200 lines, or content structure reshaped around findings
   - Fix: Research must serve the content structure from Phase 2.3, not replace it. Limit to 2-3 queries. Discard tangential findings.

7. **Orphan standalone pattern (Execution)**
   - Symptom: Standalone pattern created but never referenced by any skill or agent
   - Fix: Document in Application Notes that the pattern is available. When skills are later created or updated, reference this pattern if applicable.

---

## Safety and Constraints

When using this skill:

- **Do NOT** generate patterns that are actually procedures (redirect to `create-skill-spec`)
- **Do NOT** create patterns with inter-pattern dependencies (patterns must stay flat)
- **Do NOT** leave Content section with generic filler — every item must be specific
- **Do NOT** exceed 200 lines without considering a split
- **Do NOT** modify a skill's SKILL.md in "Enhance" or "Standalone" modes — only auto-update in "New pattern for a skill" mode
- **Do NOT** run more than 3 WebSearch queries per pattern — research supports content, it doesn't drive it
- **Do NOT** reshape the content structure around search results — findings must fit the Phase 2.3 design
- **ALWAYS** validate against `skill-vs-pattern-decision` gate before generating
- **ALWAYS** skip Phase 2.5 for project-internal patterns where web research adds no value
- **ALWAYS** attribute content sourced from external standards in Application Notes
- **ALWAYS** use kebab-case for filenames with type hints where helpful
- **ALWAYS** include Application Notes with consumer references
- **ALWAYS** run cross-reference validation for skill-associated patterns
- **PREFER** specific, actionable content items over vague guidance
- **PREFER** structured formats (tables, bulleted criteria) over prose

This skill's purpose is to ensure pattern files have sufficient depth and structure to be genuinely useful as reference content for skills and agents.

---

## Structured Reasoning Integration

When applying this skill, use these reasoning patterns:

**During Phase 1 (Mode Selection and Input Gathering):**
```
<analysis>
Mode selected: [enhance/new-for-skill/standalone]
Inputs gathered: [list]
Pattern validation: [is this actually pattern content?]
</analysis>
```

**During Phase 2 (Pattern Design):**
```
<reasoning>
Pattern type: [Knowledge/Evaluation/Policy/Framework]
Classification rationale: [why this type]
Domain: [pattern-domain]
Name: [pattern-key]
Content structure: [sections/categories planned]
</reasoning>
```

**During Phase 2.5 (Domain Research):**
```
<reasoning>
Research applicable: [yes/no — external standards or project-internal?]
Queries executed: [list queries, max 3]
Findings adopted: [items with source attribution]
Findings discarded: [items that didn't fit content structure]
</reasoning>
```

**During Phase 3 (Pattern Generation):**
```
<reasoning>
Purpose clarity: [does the purpose answer what and when?]
Content specificity: [are items actionable and testable?]
Application context: [who uses this and how?]
</reasoning>
```

**During Phase 4 (Validation):**
```
<decision>
Pattern path: [full path]
Validation passed: [checklist results]
Cross-references: [valid/needs-update]
Summary: [final output]
</decision>
```

All tags nest inside universal shells: `<analysis>`, `<reasoning>`, `<decision>`.
