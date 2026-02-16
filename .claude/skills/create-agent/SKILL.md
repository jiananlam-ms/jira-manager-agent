---
name: create-agent
type: workflow
description: Systematic methodology for creating agent definitions from roles-design artifact specifications. Use when you need to generate agent files from a roles-design artifact.
---

# Skill: create-agent

## 1. Purpose

This skill provides a systematic methodology for creating complete, valid agent definitions from roles-design artifact specifications. It transforms a role specification (from the roles-design artifact) into a fully-formed `projects/{project-name}/agents/{agent-name}.md` file.

The key distinction: This skill ensures agents are created following factory conventions, with proper separation of concerns (agent owns WHAT and WHY, skills own HOW) and correct structure.

## 2. Applicability

**Use when:**
- A role specification exists in the roles-design artifact
- Need to generate a new agent file in `projects/{project-name}/agents/`
- Creating agents for a downstream team project

**Do NOT use when:**
- Updating existing agents
- No roles-design artifact exists (design must precede compilation)
- Role specification is incomplete or missing

## 3. Dependencies

Required patterns, templates, and references:

- `templates/create-agent-template.md` - Agent structure reference (source of truth)
- `patterns/role-patterns/common-role-archetypes.md` - Role design patterns
- `patterns/governance-patterns/naming-conventions.md` - Naming standards

## 4. Inputs and Outputs

### 4.1 Inputs

The caller should collect:

- From the input envelope:
  - project-name:
    - Target project name for output (determines output directory `projects/{project-name}/`)
    - If not provided, ask user via AskUserQuestion before proceeding
  - goal:
    - Generate agent file from roles-design artifact role specification
    - Which role to compile (if multiple roles in artifact)
  - context:
    - Team name, mission, and domain
    - Path to roles-design artifact
  - constraints:
    - Naming conventions to follow
    - Model preferences (if not default)
    - Tool access restrictions
  - upstream:
    - Roles-design artifact (`roles-design-*.md`) containing role specifications:
      - Role name and description
      - Responsibilities and non-responsibilities
      - Tools and permissions
      - Skills this role invokes
      - Collaboration points with other roles
  - extra:
    - Any additional context about the team or domain
    - Existing skill files to review for skill mappings

- From the file system:
  - Roles-design artifact from workspace (authoritative source for role specifications)

### 4.2 Outputs

The output of this skill is:

- **Complete agent file** at `projects/{project-name}/agents/{agent-name}.md`:
  - Follows `templates/create-agent-template.md` structure exactly
  - All sections filled with no unresolved `{{placeholders}}`

## 5. Procedure

### Phase 1: Input Validation (5.0-5.2)

#### 5.0 Resolve project name

If `project-name` was not provided in the input envelope, use `AskUserQuestion` to ask the user:
- "What is the project name for this output? (used for the output directory `projects/{project-name}/`)"

Store the project name for use in all output paths.

#### 5.1 Validate role specification completeness

Check the role specification from roles-design artifact contains:

| Required Field | Check | If Missing |
|----------------|-------|------------|
| Role name | Non-empty, follows naming conventions | Cannot proceed |
| Description | Clear one-line purpose | Cannot proceed |
| Responsibilities | At least 3 items | Cannot proceed |
| Non-responsibilities | At least 2 items | Infer from responsibilities |
| Tools | List of tools | Use minimal safe defaults |
| Skills | List of skills to invoke | Check existing skill files in `projects/{project-name}/skills/` |

#### 5.2 Gather cross-references

Extract additional context:

1. **From existing skill files (`projects/{project-name}/skills/`):**
   - Which skills map to this role
   - Skill descriptions and purposes

2. **From the roles-design artifact:**
   - Collaboration points with other roles
   - Hand-off points and triggers

**Output of Phase 1:** Validated role specification with cross-references.

### Phase 2: Template Preparation (5.3-5.4)

#### 5.3 Read the agent template

Read `templates/create-agent-template.md` to understand:
- Required YAML frontmatter fields
- Required sections and their order
- Section semantics and constraints

#### 5.4 Determine which optional sections apply

Based on role specification, decide:

| Optional Section | Include If |
|------------------|------------|
| MULTI-INSTANCE AND PARTIAL SCOPE | Role can be called with scope constraints |
| COLLABORATION WITH OTHER AGENTS | Role has explicit hand-offs with other roles |
| Metaphor/analogy in identity | Helps clarify role's position |

**Output of Phase 2:** Template understanding and section decisions.

### Phase 3: Frontmatter Generation (5.5)

#### 5.5 Reason through and document frontmatter

**Gather context:**
- Review role name and description from roles-design artifact
- Check tools listed in role specification
- Identify skills mapped to this role from the roles-design artifact and existing skill files
- Note team's model preference (or use default)

**Reason through:**
- What is the kebab-case version of the role name?
- What one-line description captures the agent's purpose AND when to use it?
- Which tools are justified by this role's responsibilities? (least privilege)
- Which skills does this role invoke? (always include structured-reasoning first)
- Is the model appropriate for this role's complexity?

**Document:**
- Read `templates/create-agent-template.md` frontmatter section
- Populate following template structure exactly
- Verify all required fields are present: name, description, tools, skills, model
- Confirm tools list follows least-privilege principle

### Phase 4: Identity Section (5.6-5.7)

#### 5.6 Reason through and document role identity

**Gather context:**
- Review role name and primary mission from roles-design artifact
- Note team name and domain context
- Consider if a metaphor/analogy would clarify the role's position

**Reason through:**
- How should this role identify itself in relation to the team?
- What is the single most important mission this role fulfills?
- Would a metaphor help clarify the role's position between other system elements?
- Is the purpose statement action-oriented and outcome-focused?

**Document:**
- Read `templates/create-agent-template.md` identity section
- Populate the identity statement following template structure
- Include metaphor only if it genuinely clarifies the role

#### 5.7 Reason through and document do/don't lists

**Gather context:**
- Review responsibilities from roles-design artifact
- Review non-responsibilities from roles-design artifact
- Note any boundaries between this role and others

**Reason through:**
- Which 3 non-responsibilities are most critical to state? (Be specific, not vague)
- Which 3 responsibilities best capture what this role DOES? (Focus on outcomes)
- Are any responsibilities stated as procedures that should be outcomes instead?
- Do the lists create clear boundaries with other roles?

**Document:**
- Read `templates/create-agent-template.md` do/don't section
- Populate lists following template structure (3 items each maximum)
- Add CRITICAL reminder for structured reasoning (required in all agents)
- Verify items are specific and outcome-focused

### Phase 5: Required First Steps (5.8)

#### 5.8 Reason through and document REQUIRED FIRST STEPS section

**Gather context:**
- Review skills mapped to this role from the roles-design artifact and existing skill files
- Identify the primary skill and any secondary skills
- Determine which templates this role outputs to
- Check if domain-specific file discovery is needed

**Reason through:**
- Which skills must this agent invoke on every call? (Always structured-reasoning first)
- What files must the agent read before doing any work?
  - Skill files for each invoked skill
  - Output templates the agent produces
- Does this agent need to discover domain inputs via Glob/Grep?
- What should happen when required files are missing?

**Document:**
- Read `templates/create-agent-template.md` REQUIRED FIRST STEPS section
- Populate following template structure with three parts:
  1. Skill invocations (structured-reasoning first, then primary skill)
  2. File reads (skill files, templates)
  3. Missing file handling (state missing, propose fallback)
- Optional: Add domain-specific discovery step if applicable

### Phase 6: Input Envelope (5.9)

#### 5.9 Generate INPUT ENVELOPE section

Describe what this agent receives when invoked:

- **goal**: What task this agent handles
- **context**: Background information needed
- **constraints**: Boundaries that must be respected
- **upstream**: Previous artifacts this agent builds on
- **requested_output_template**: Expected output format
- **extra**: Additional materials or scope hints

Derive examples from the roles-design artifact and the agent's intended domain.

### Phase 7: High Level Behaviour (5.10-5.11)

#### 5.10 Reason through and document HIGH LEVEL BEHAVIOUR

**Gather context:**
- Review role's primary responsibilities from roles-design artifact
- Identify the primary skill from the roles-design artifact
- Note key outcomes this role must achieve (not procedures)

**Reason through:**
- What are the 3-5 behavioral outcomes this agent must achieve? (WHAT, not HOW)
- Points 1-2 are standard: structured reasoning + primary skill reference
- Points 3-5: What outcomes matter for this role's mission?
- For each outcome: Why does this matter to downstream agents or users?
- Are any points describing procedures? (If so, they belong in the skill)
- Would more than 5 points be needed? (Signal that a skill should be created)

**Document:**
- Read `templates/create-agent-template.md` HIGH LEVEL BEHAVIOUR section
- Populate following template structure (3-5 points only):
  1. Use structured reasoning (always first)
  2. Apply primary skill (reference skill, don't duplicate procedures)
  3-5. Outcome-focused behaviors with "why this matters"
- Verify: No step-by-step actions, no procedure duplication

#### 5.11 Validate no procedure duplication

Check that HIGH LEVEL BEHAVIOUR:
- Does NOT list step-by-step actions
- Does NOT duplicate content from skills
- Describes outcomes and constraints only

If more than 5 points seem needed → signal that a skill should be created.

### Phase 8: Multi-Instance Section (5.12)

#### 5.12 Generate MULTI-INSTANCE section (if applicable)

Include only if role can be called with scope constraints.

Derive scope examples from:
- Different aspects of the domain this role handles
- Section coverage of output templates

### Phase 9: Output Contract (5.13)

#### 5.13 Reason through and document OUTPUT CONTRACT section

**Gather context:**
- Identify the output template this role produces (from the roles-design artifact)
- Review which roles/agents consume this output (from the roles-design artifact)
- Note any scope-limited vs full output variations

**Reason through:**
- What template does this agent output to? (Reference by path)
- Which downstream agents consume this output?
- How do downstream agents use this output? (What capabilities does it enable?)
- Does this agent support scope-limited calls with partial outputs?
- Are there any additional output requirements beyond the template?

**Document:**
- Read `templates/create-agent-template.md` OUTPUT CONTRACT section
- Populate following template structure:
  1. Structured reasoning requirement (always first)
  2. Template reference (path only, template is source of truth - DO NOT list sections)
  3. Downstream usability (name consumers, describe how they use it)
  4. Additional requirements (if any)
- Verify: Template path referenced, no structure duplication

### Phase 9.5: Output Location (5.14)

#### 5.14 Reason through and document OUTPUT LOCATION section

**Gather context:**
- Review the role specification from roles-design artifact
- Identify the role archetype (producer, analyst, reviewer, approver, orchestrator)

**Reason through role type:**
- What type of role is this agent?
  - Producer (writer, creator): Creates documents, drafts, content
  - Analyst (researcher, strategist): Produces research reports, briefs
  - Reviewer (editor, QA): May produce review reports OR just decisions
  - Approver (final sign-off): Usually just decisions
  - Orchestrator (coordinator): Delegates to others, may not produce artifacts

**Determine which OUTPUT LOCATION subsections to include:**

| If role type is... | Include these subsections |
|--------------------|---------------------------|
| Producer | "For Agents That Produce File Artifacts" + "Reading Outputs" |
| Analyst | "For Agents That Produce File Artifacts" + "Reading Outputs" |
| Reviewer (with reports) | "For Agents That Produce File Artifacts" + "Reading Outputs" |
| Reviewer (decisions only) | "For Agents That Produce Decisions" + "Reading Outputs" |
| Approver | "For Agents That Produce Decisions" + "Reading Outputs" |
| Orchestrator | "For Orchestrator Agents" + "Reading Outputs" |

**For file-producing roles, reason through:**
- What artifact type name should this agent use in filenames?
- What pattern will downstream agents use to find these outputs?

**Document:**
- Read `templates/create-agent-template.md` OUTPUT LOCATION section
- Include only the relevant subsections based on role type
- Always include "Reading Outputs from Other Agents" subsection
- Populate with role-specific examples (artifact type, agent name)

### Phase 10: Boundaries and Failure Modes (5.15-5.16)

#### 5.15 Generate BOUNDARIES AND NON-GOALS

Pair each prohibition with guidance:
- MUST NOT → Instead, MUST
- Out-of-scope request → How to respond

Derive from role's non-responsibilities.

#### 5.16 Generate FAILURE MODES AND MITIGATIONS

Include 5+ realistic failure modes with:
- **Symptom**: How to recognize
- **Mitigation**: How to avoid/fix

Common failure modes for most agents:
1. Duplicating skill procedures
2. Detailing template contents
3. Scope creep into other roles
4. Missing structured reasoning
5. Incomplete outputs

### Phase 11: Collaboration Section (5.17)

#### 5.17 Generate COLLABORATION section (if applicable)

Include only if role has explicit hand-offs.

For each collaborating role:
- How they interact
- What they receive from / provide to this role

Derive from the roles-design artifact's collaboration points.

### Phase 12: Final Assembly and Validation (5.18-5.19)

#### 5.18 Assemble complete agent file

Combine all sections in template order:
1. YAML frontmatter
2. Identity and CRITICAL reminder
3. REQUIRED FIRST STEPS
4. INPUT ENVELOPE
5. HIGH LEVEL BEHAVIOUR
6. MULTI-INSTANCE (if applicable)
7. OUTPUT CONTRACT
8. OUTPUT LOCATION
9. BOUNDARIES AND NON-GOALS
10. FAILURE MODES
11. COLLABORATION (if applicable)
12. Final goal statement

#### 5.19 Validate against template

Final checks:

| Check | Pass Criteria |
|-------|---------------|
| All required sections present | Compare to template |
| No `{{placeholders}}` remain | Search for `{{` |
| HIGH LEVEL BEHAVIOUR ≤ 5 points | Count items |
| No procedure duplication | Review skill references |
| Frontmatter complete | All required fields |
| CRITICAL reminder present | In identity section |
| OUTPUT LOCATION matches role type | Correct subsections included |

**Output of Procedure:** Complete, validated agent file.

## 6. Failure Modes and Corrections

1. **Procedure duplication in HIGH LEVEL BEHAVIOUR**
   - Symptom: Step-by-step actions in behavior section
   - Correction: Move to skill, reference skill by name

2. **Template structure in OUTPUT CONTRACT**
   - Symptom: Listing output sections instead of referencing template
   - Correction: Remove list, add template path reference

3. **More than 5 behavior points**
   - Symptom: HIGH LEVEL BEHAVIOUR has 6+ items
   - Correction: Extract to skill or consolidate

4. **Missing MULTI-INSTANCE when needed**
   - Symptom: Agent fails when called with scope constraints
   - Correction: Add section if role can be scope-limited

5. **Vague boundaries**
   - Symptom: Generic "don't do domain work" without specifics
   - Correction: Be specific, pair with guidance

6. **Skills not in frontmatter**
   - Symptom: Agent invokes skills not listed in `skills:` field
   - Correction: Add all invoked skills to frontmatter

7. **Missing structured reasoning reminder**
   - Symptom: No CRITICAL tag in identity section
   - Correction: Add after do/don't lists

## 7. Safety and Constraints

- **Do NOT** create agents without roles-design artifact role specification
- **Do NOT** duplicate skill procedures in agent prompts
- **Do NOT** list template sections in OUTPUT CONTRACT
- **Do NOT** exceed 5 points in HIGH LEVEL BEHAVIOUR
- **ALWAYS** validate against `templates/create-agent-template.md`
- **ALWAYS** include structured-reasoning in skills list
- **ALWAYS** include CRITICAL thinking reminder
- **ALWAYS** derive from design artifacts, not assumptions
- **PREFER** minimal tool access (least privilege)
- **PREFER** referencing skills over embedding procedures

## 8. Structured Reasoning Integration

When applying this skill, use structured-reasoning tags to encapsulate reasoning steps:

All tags nest inside universal shells: `<analysis>`, `<reasoning>`, `<decision>`.

**During Phase 1-2 (Validation and Template - 5.1-5.4):**
- `<role_analysis>` for understanding role specification
- `<cross_reference_analysis>` for gathering context from design artifacts and skill files

**During Phase 3-7 (Core Sections - 5.5-5.11):**
- `<agent_structure_reasoning>` for reasoning through each section
- `<tool_permission_reasoning>` for tool access justification in frontmatter
- `<behavior_scope_reasoning>` for HIGH LEVEL BEHAVIOUR decisions

**During Phase 8-11 (Optional and Contract Sections - 5.12-5.16):**
- `<scope_analysis>` for multi-instance decisions
- `<collaboration_analysis>` for hand-off points
- `<output_contract_reasoning>` for downstream consumer analysis

**During Phase 12 (Validation - 5.18-5.19):**
- `<template_validation>` for checking against official template
- `<agent_summary>` for final output
