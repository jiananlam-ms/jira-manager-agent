---
name: create-skill
type: workflow
description: Systematic methodology for creating skill definitions from skill-spec artifact specifications. Use when you need to generate skill files from a skill-spec design artifact.
---

# Skill: create-skill

## 1. Purpose

This skill transforms a skill specification (from the skill-spec artifact) into a fully-formed `projects/{project-name}/skills/{skill-name}/SKILL.md` file, and generates any companion pattern files into `projects/{project-name}/patterns/`. It ensures proper separation of concerns: skills own HOW (procedures), agents own WHAT/WHY (outcomes).

## 2. Applicability

**Use when:**
- A skill specification exists in the skill-spec artifact
- Need to generate a new skill file in `projects/{project-name}/skills/{skill-name}/`
- Need to generate companion pattern files in `projects/{project-name}/patterns/`

**Do NOT use when:**
- Updating existing skills
- No skill-spec artifact exists (design must precede compilation)
- Skill specification is incomplete or missing

## 3. Dependencies

Required patterns, templates, and references:

- `templates/create-skill-template.md` - Skill structure reference (source of truth)
- `patterns/skill-patterns/skill-type-taxonomy.md` - Skill type classification
- `patterns/skill-patterns/skill-procedure-model.md` - Three-layer model for procedure steps
- `patterns/skill-patterns/skill-vs-pattern-decision.md` - When to use patterns vs inline content

Reference materials:
- Skill-spec artifact (skill specifications with pattern_references)

## 4. Inputs and Outputs

### 4.1 Inputs

The caller should collect:

- From the input envelope:
  - project-name:
    - Target project name for output (determines output directory `projects/{project-name}/`)
    - If not provided, ask user via AskUserQuestion before proceeding
  - goal:
    - Generate skill file from skill-spec artifact specification
    - Which skill to compile (if multiple skills)
  - context:
    - Team name and domain
    - Path to skill-spec artifact
  - constraints:
    - Naming conventions to follow
    - Skill complexity limits (line count)
    - Frontmatter field restrictions
  - upstream:
    - Skill-spec artifact (`skill-spec-{skill-name}.md`) containing skill specification:
      - Skill name and description
      - Skill type (tool/workflow)
      - Purpose and capabilities
      - When to use / when not to use
      - Which roles use this skill
      - Key procedures or methodology
      - Pattern references (paths to patterns this skill uses)
  - extra:
    - Any additional context about intended usage or domain

- From the file system:
  - Skill-spec artifact from workspace (authoritative source for skill specification)

### 4.2 Outputs

The output of this skill is:

- **Skill directory** at `projects/{project-name}/skills/{skill-name}/`
- **Complete skill file** at `projects/{project-name}/skills/{skill-name}/SKILL.md`:
  - Follows `templates/create-skill-template.md` structure exactly
  - All sections filled with no unresolved `{{placeholders}}`
- **Companion pattern files** at `projects/{project-name}/patterns/{pattern-name}.md`:
  - One file per pattern referenced in the skill-spec artifact's pattern_references
  - Each pattern has: Purpose, Content, Application Notes (optional)

## 5. Procedure

### Phase 1: Input Validation (5.0-5.2)

#### 5.0 Resolve project name

If `project-name` was not provided in the input envelope, use `AskUserQuestion` to ask the user:
- "What is the project name for this output? (used for the output directory `projects/{project-name}/`)"

Store the project name for use in all output paths.

#### 5.1 Validate skill specification completeness

Check the skill specification from skill-spec artifact contains:

| Required Field | Check | If Missing |
|----------------|-------|------------|
| Skill name | Non-empty, kebab-case | Cannot proceed |
| Description | Clear purpose with triggers | Cannot proceed |
| Type | Valid type from taxonomy | Infer from purpose |
| Purpose | What it enables | Cannot proceed |
| Applicability | When to use | Derive from purpose |
| Procedure outline | Key steps | Cannot proceed |
| Pattern references | Valid paths if present | Derive from purpose |

#### 5.2 Gather cross-references

Extract additional context:

1. **Skill type from taxonomy:**
   - tool or workflow (only valid types)
   - Characteristics of that type
   - Note: "policy" and "validation" are anti-patterns; that content should be patterns

2. **From the skill-spec artifact (Pattern Specifications):**
   - Which patterns this skill references
   - Pattern purpose and content outline
   - Approximate size of each pattern

**Output of Phase 1:** Validated skill specification with cross-references.

### Phase 2: Template Preparation (5.3-5.4)

#### 5.3 Read the skill template

Read `templates/create-skill-template.md` to understand:
- Required YAML frontmatter fields (name, type, description only)
- Required sections and their order
- Section semantics and constraints

#### 5.4 Determine skill complexity

Based on specification, decide:

| Complexity | Characteristics | Procedure Structure |
|------------|-----------------|---------------------|
| Simple | Single-purpose, few steps | Flat steps (5.1, 5.2, 5.3) |
| Complex | Multi-phase, conditional logic | Phased (Phase 1: 5.1-5.3, Phase 2: 5.4-5.6) |

**Output of Phase 2:** Template understanding and complexity decision.

### Phase 3: Reason Through and Document Each Section (5.5-5.14)

This phase uses a consistent pattern for each template section: **Gather** context, **Reason** through the content, then **Document** by referencing the template.

#### 5.5 Reason through and document frontmatter

**Gather context:**
- Review the skill specification's name and description from skill-spec artifact
- Check `patterns/skill-patterns/skill-type-taxonomy.md` for type classification criteria

**Reason through:**
- What is the exact kebab-case name that matches the directory structure?
- Which skill type (tool/workflow) best fits this skill's purpose?
- What are the 2-3 most common situations that should trigger this skill?
- How can the description capture both WHAT the skill does AND WHEN to use it?

**Document:**
- Read `templates/create-skill-template.md` frontmatter section
- Populate following the template's exact YAML structure
- Verify: only `name`, `type`, and `description` fields are present
- Verify: description includes "Use when" trigger phrases

#### 5.6 Reason through and document skill header

**Gather context:**
- Review the skill specification's purpose statement from skill-spec artifact
- Check how related skills in the team define their focus

**Reason through:**
- What is the ONE primary purpose this skill serves? (Express in 10 words or fewer)
- What is the main focus area that distinguishes this skill?
- What does this skill explicitly NOT cover? (This creates clear boundaries)
- Does the focus statement align with the skill type from the taxonomy?

**Document:**
- Read `templates/create-skill-template.md` header section
- Populate the header following the template structure exactly
- Verify the "not on" clause creates clear boundaries with related skills

#### 5.7 Reason through and document Purpose section

**Gather context:**
- Review the skill specification's capabilities list from skill-spec artifact
- Consider what downstream processes or artifacts consume this skill's output

**Reason through:**
- What are the 3-5 concrete capabilities this skill enables?
- For each capability: Is it an action the agent performs, or an outcome it produces?
- What downstream processes or artifacts consume this skill's output?
- Are the capabilities distinct, or do some overlap and need merging?

**Document:**
- Read `templates/create-skill-template.md` Purpose section
- Populate following the template structure exactly
- Verify capabilities are concrete and actionable, not vague

#### 5.8 Reason through and document Applicability section

**Gather context:**
- Review the skill specification's "when to use" and "when not to use" from skill-spec artifact
- Consider which roles or agents are likely to use this skill

**Reason through:**
- What are the specific conditions that should trigger this skill?
- What phrases would a user or upstream agent say that indicate this skill is needed?
- What are situations that SEEM like they need this skill but actually don't?
- For anti-conditions: What should the agent do instead in those cases?
- Is there clear separation from related skills' applicability?

**Document:**
- Read `templates/create-skill-template.md` Applicability section
- Populate following the template structure exactly
- Verify triggers are concrete and testable, not vague

#### 5.9 Reason through and document Dependencies section

**Gather context:**
- Review the skill specification's dependencies from skill-spec artifact
- Check what templates this skill's output should follow
- Check what patterns inform this skill's methodology

**Reason through:**
- What other skills must be invoked before or alongside this one?
- What patterns provide methodology guidance for this skill's domain?
- What templates define the structure of this skill's output?
- What configs or reference documents does this skill need access to?
- Are there circular dependencies that need to be resolved?

**Document:**
- Read `templates/create-skill-template.md` Dependencies section
- Populate following the template structure exactly
- Verify all referenced paths are correct and resources exist

#### 5.10 Reason through and document Inputs section

**Gather context:**
- Review the skill specification's inputs from skill-spec artifact

**Reason through:**
- For each envelope field (goal, context, constraints, upstream, extra): What domain-specific information does THIS skill need? Avoid generic placeholders.
- What templates, patterns, and domain documents must this skill read from the file system?
- Which inputs are truly required vs optional with sensible defaults?

**Document:**
- Read `templates/create-skill-template.md` Inputs section
- Populate following the template's three-subsection structure exactly
- Verify envelope field mappings are domain-specific, not generic placeholders

#### 5.11 Reason through and document Outputs section

**Gather context:**
- Review the skill specification's outputs from skill-spec artifact
- Review `patterns/skill-patterns/skill-type-taxonomy.md` for output patterns by skill type

**Reason through output type:**
- Is this a tool skill or a workflow skill?
- Does this skill produce persistent file artifacts, or does it pass data in-memory?
- If file artifacts: What type of document? Where should it be saved?
- If in-memory: What format? Who receives it?

**Determine output category:**

| If skill type is... | Output category is likely... |
|---------------------|------------------------------|
| Workflow (produces documents) | File Artifact |
| Workflow (passes data) | In-Memory Data |
| Tool | In-Memory Data |

**For File Artifact outputs, reason through:**
- What artifact type name should prefix the filename?
- What validation criteria determine completeness?
- What template (if any) defines the structure?

**For In-Memory outputs, reason through:**
- What format is the data in?
- What does the downstream consumer expect?

**Document:**
- Read `templates/create-skill-template.md` Outputs section
- Select appropriate output type (File Artifact / In-Memory Data / Reference Only)
- Populate following the template structure exactly
- Include "Written Artifacts" subsection ONLY for File Artifact type
- Verify downstream usage is specified for all output types

#### 5.12 Reason through and document Procedure section

**Gather context:**
- Review the skill specification's procedure outline from skill-spec artifact
- Check `patterns/skill-patterns/skill-type-taxonomy.md` for procedure patterns by skill type
- Review reference skills of the same type for structural patterns

**Reason through the overall structure:**
- Is this skill simple (single-purpose, few steps) or complex (multi-phase, conditional)?
- If complex: What are the natural phases? What does each phase accomplish?
- What is the logical flow from inputs to outputs?

**For each procedure step, reason through:**
- What is the specific action or decision at this step?
- What criteria guide decisions? What makes a "good" vs "bad" choice?
- What quality checks should occur at this step?
- What is the output of this step that feeds into the next?

**Procedure content principles:**
- Include specific decision criteria, not vague guidance
- Include quality gates and validation points
- Use tables for complex decision logic
- End each phase with "Output of Phase N:" statement
- Name tools explicitly for file/web operations (e.g., "Use Glob to find `workspace/*.md`"), describe thinking for cognitive steps

**Document:**
- Read `templates/create-skill-template.md` Procedure section
- Choose simple (flat steps) or complex (phased) structure based on complexity decision
- Populate following the template structure exactly
- Verify steps teach HOW to think, not just WHAT to produce

#### 5.13 Reason through and document Failure Modes section

**Gather context:**
- Review the skill specification's risks and edge cases from skill-spec artifact
- Consider common failure patterns for this skill type
- Check what has gone wrong in similar skills

**Reason through two types of failure modes:**

Skills need BOTH execution failures (skill process errors) AND domain failures (outcome errors). Include 4-6 failure modes total, with at least 2 execution-focused.

**Common execution failure patterns to adapt:**
- Skipping input validation (proceeds with missing inputs)
- Wrong tool for file operations (e.g., Read without Glob)
- Missing output validation (incomplete artifacts)
- Under-specified tool usage ("read the files" without naming tool or path)

**Domain failure questions:**
- What quality issues are common in this domain?
- What domain constraints might be violated?
- What would make the output unusable by downstream consumers?

**Document:**
- Read `templates/create-skill-template.md` Failure Modes section
- Include at least 2 execution failures and 2 domain failures
- Populate following the template structure exactly

#### 5.14 Reason through and document Safety section

**Gather context:**
- Review the skill specification's constraints from skill-spec artifact
- Check skill-spec artifact constraints for domain-specific safety requirements

**Reason through:**
- What actions should this skill NEVER take?
- What actions should this skill ALWAYS take?
- What preferences guide decision-making when multiple options exist?
- What are the domain-specific risks this skill could introduce?
- How does this skill's safety profile align with the roles that invoke it?

**Document:**
- Read `templates/create-skill-template.md` Safety section
- Populate with "Do NOT", "ALWAYS", and "PREFER" statements
- Populate following the template structure exactly
- Verify constraints are specific and enforceable

### Phase 3b: Generate Companion Patterns (5.14a-5.14c)

This phase generates pattern files for any patterns referenced by the skill.

#### 5.14a Identify patterns to generate

**Check:**
1. Read the skill specification's `pattern_references` field
2. For each referenced pattern path, find its specification in the skill-spec artifact
3. If a referenced pattern has no specification, flag as error and halt

**Output:** List of patterns to generate with their specifications.

#### 5.14b Generate each pattern file

**For each pattern specification in the skill-spec artifact that this skill references:**

1. Create file at: `projects/{project-name}/patterns/{pattern-domain}/{pattern-key}.md`
2. Include sections: Purpose (1-2 sentences), Content (criteria/checklist/framework), Application Notes (optional)
3. Use kebab-case for filename (e.g., `e-e-a-t-framework.md`)
4. Verify the skill's procedure references this pattern by exact path

#### 5.14c Validate pattern references

**Cross-reference checks:**

| Check | Pass Criteria | If Failed |
|-------|---------------|-----------|
| Every pattern_reference resolves | Path matches a pattern specification | Add missing pattern or remove reference |
| Every pattern specification is referenced | At least one skill uses it | Flag as orphan, add reference or remove pattern |
| Skill procedure includes pattern read | Explicit `Read projects/{project-name}/patterns/{name}.md` step | Add read step to procedure |
| Pattern filename matches reference | kebab-case, exact match | Fix path or filename |

**Output of Phase 3b:** Validated pattern files with confirmed skill references. Orphan patterns must be fixed (add reference or remove), not just warned about.

### Phase 4: Structured Reasoning (5.15)

#### 5.15 Reason through and document Structured Reasoning section (if applicable)

**Gather context:**
- Check if this is a complex workflow skill that benefits from explicit reasoning
- Review `.claude/skills/structured-reasoning/SKILL.md` for universal tag definitions
- Consider what domain-specific reasoning this skill requires

**Reason through:**
- Does this skill involve multi-step reasoning that benefits from explicit structure?
- If yes: What reasoning happens at each procedure phase? What domain-specific tags would help?
- Simple skills: Omit this section. Complex workflow skills: Include with phase-mapped reasoning tags.

**Document (if applicable):**
- Map reasoning tags to procedure phases
- Reference universal shells: `<analysis>`, `<reasoning>`, `<decision>`

### Phase 5: Final Assembly and Validation (5.16)

#### 5.16 Assemble complete skill file

Combine all sections in template order (frontmatter → header → purpose → applicability → dependencies → inputs/outputs → procedure → failure modes → safety → structured reasoning). Ensure companion pattern files from Phase 3b are complete.

#### 5.17 Validate against template

Final checks:

| Check | Pass Criteria |
|-------|---------------|
| Frontmatter has only name, type, description | No extra fields |
| Description includes "Use when" | Triggers present |
| All required sections present | Compare to template |
| No `{{placeholders}}` remain | Search for `{{` |
| Procedure is detailed | Not just outcomes |
| Body under 500 lines | Count lines |
| No template structure duplication | References templates |
| Pattern files created | One per pattern_reference in skill-spec |
| Pattern references valid | All paths resolve |
| No orphan patterns | Every referenced pattern used |
| Skill procedure reads patterns | Explicit Read step |

**Output of Procedure:** Complete, validated skill file AND pattern files.

## 6. Failure Modes and Corrections

1. **Description missing triggers**
   - Symptom: Frontmatter description doesn't say when to use
   - Correction: Add "Use when X; when Y; or when Z" to description

2. **Extra frontmatter fields**
   - Symptom: Fields besides name, type, description in YAML
   - Correction: Remove extra fields; only three allowed

3. **Procedure too vague**
   - Symptom: Steps like "analyze the input" without criteria
   - Correction: Add specific decision criteria and quality checks

4. **Template structure duplication**
   - Symptom: Listing output sections instead of referencing template
   - Correction: Reference template path, remove duplicated structure

5. **Under-specified tool usage**
   - Symptom: "Read the relevant files" without naming which tool or which files
   - Correction: Name the tool and be specific: "Use Glob to find `config/*.yaml`, then Read each file"

6. **Skill body exceeds 500 lines**
   - Symptom: SKILL.md is too long
   - Correction: Move detailed reference material to references/ subdirectory

7. **Missing failure modes**
   - Symptom: No Failure Modes section or fewer than 3 items
   - Correction: Add 4-6 realistic failure modes with corrections

8. **Pattern reference inconsistency**
   - Symptom: Missing pattern files, orphan patterns, path mismatches, or procedure missing pattern reads
   - Correction: Ensure every pattern_reference has a matching file, every pattern is referenced, paths match exactly, and procedure includes explicit Read steps

## 7. Safety and Constraints

- **Do NOT** create skills without skill-spec artifact specification
- **Do NOT** add extra fields to frontmatter (only name, type, description)
- **Do NOT** duplicate template structure in skill body
- **Do NOT** exceed 500 lines in SKILL.md body
- **Do NOT** create "policy" or "validation" skills—that content should be patterns
- **Do NOT** generate pattern files without pattern specifications in the skill-spec
- **Do NOT** leave orphan pattern specifications (validate AND fix)
- **ALWAYS** validate against `templates/create-skill-template.md`
- **ALWAYS** include "Use when" triggers in description
- **ALWAYS** create skill directory before writing file
- **ALWAYS** derive from design artifacts, not assumptions
- **ALWAYS** ensure pattern files use kebab-case, exist at referenced paths, and are read in procedures
- **PREFER** explicit tool naming for file/web operations, cognitive descriptions for reasoning steps
- **PREFER** phased structure for complex skills

## 8. Structured Reasoning Integration

When applying this skill, use structured-reasoning tags (nested inside universal shells `<analysis>`, `<reasoning>`, `<decision>`):

- **Phase 1-2:** `<skill_analysis>` for spec understanding, `<type_classification>` for type decisions
- **Phase 3:** `<skill_structure_reasoning>` for section decisions, `<procedure_design>` for methodology, `<step_reasoning>` for step design, `<constraint_analysis>` for safety
- **Phase 4:** `<reasoning_design>` for domain-specific reasoning tags
- **Phase 5:** `<template_validation>` for template checking, `<skill_summary>` for final output
