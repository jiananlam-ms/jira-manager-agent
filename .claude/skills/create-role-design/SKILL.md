---
name: create-role-design
type: workflow
description: Guides conversational requirements gathering for agent roles using AskUserQuestion tool. Use when a user wants to design a new agent role; when role requirements are vague or incomplete; or when you need to interview the user to understand role design.
---

# Create Role Design

This skill guides Claude in transforming vague role ideas into complete roles-design artifacts through systematic conversational elicitation.

It focuses on **gathering role requirements through targeted questions**, not on generating the final agent file (that's the `create-agent` skill's job).

---

## Purpose

Use this skill to:

- Analyze initial role descriptions to identify knowledge gaps
- Use AskUserQuestion tool to gather missing requirements conversationally
- Classify role archetype based on gathered information
- Generate roles-design artifacts that feed directly into the `create-agent` skill
- Ensure all required fields are populated before artifact generation

This skill is intended to feed into:

- `create-agent` skill for generating complete agent files

---

## Applicability

### When to use this skill

Trigger this skill when:

- User provides a vague or incomplete role idea
- User explicitly requests help designing a new agent role
- You need to gather requirements for a new role
- Initial role description lacks archetype, responsibilities, or tool details

Common trigger phrases: "I need an agent that...", "Help me design a role for...", "Create a role to...".

### When not to use this skill

Avoid using this skill when:

- A complete roles-design artifact already exists
- User provides detailed, structured role specifications with all required fields
- Modifying or updating an existing agent
- The request is for a skill or pattern, not a role

In those cases, use `create-agent` directly for existing specs, use `create-skill-spec` for skill ideas, or consult `patterns/` for pattern-like content.

---

## Dependencies

This skill relies on:

- `patterns/role-patterns/common-role-archetypes.md` - For role archetype selection and validation
- `patterns/governance-patterns/naming-conventions.md` - For naming standards
- AskUserQuestion tool - For conversational elicitation

---

## Inputs

### From the Input Envelope

- **From `project-name`:** Target project name for output (determines output directory `projects/{project-name}/`). If not provided, ask user via AskUserQuestion before proceeding (see step 1.0)
- **From `goal`:** The initial role idea or description; any specific problem the role should address
- **From `context`:** Team or project context; related existing roles or agents
- **From `constraints`:** Boundaries on what the role should or shouldn't do; naming conventions
- **From `upstream`:** Prior conversation context; any partial specifications already discussed
- **From `extra`:** Examples of similar roles; reference materials about the domain

### From the File System

Use file tools (Glob, Read) to locate:

- `patterns/role-patterns/common-role-archetypes.md` - For archetype matching
- `patterns/governance-patterns/naming-conventions.md` - For naming validation
- `.claude/skills/` - To discover existing skills that may apply to the role

### Missing Input Handling

- **Required inputs:** Initial role idea (at minimum a brief description). Cannot proceed without any indication of what role the user wants.
- **Optional inputs:** Team context, naming conventions, examples (proceed with defaults)
- **Document assumptions in:** The generated roles-design artifact's constraints section

---

## Outputs

### Primary Output

- **Description:** A complete roles-design artifact ready to feed into `create-agent`
- **Format:** Structured markdown document

### Written Artifacts

- **Tool:** Write tool
- **Location:** `projects/{project-name}/design-artifacts/`
- **Naming pattern:** `roles-design-{role-name}.md`
- **Example:** `projects/{project-name}/design-artifacts/roles-design-analyst.md`
- **Validation:** All required sections populated (Identity, Primary Mission, Responsibilities, Non-Responsibilities, Tools, Skills)

### Downstream Usage

- `create-agent` skill: Consumes the artifact to generate the complete agent `.md` file

---

## Procedure

Claude should follow this procedure when using this skill.

### Phase 1: Initial Analysis (1.0-1.3)

#### 1.0 Resolve project name

If `project-name` was not provided in the input envelope, use `AskUserQuestion` to ask the user:
- "What is the project name for this output? (used for the output directory `projects/{project-name}/`)"

Store the project name for use in all output paths.

#### 1.1 Receive and parse initial role idea

Extract from the user's request:
- What actor or persona does this role represent?
- Any hints about responsibilities or domain?
- Any mentioned tools, skills, or collaboration points?
- Any archetype-like language (coordinator, reviewer, builder, etc.)?

Document what is KNOWN vs what is MISSING.

#### 1.2 Validate this is actually a role

- Describes a person/actor with ongoing responsibilities? → **Role** ✓
- Describes a procedure with ordered steps and tangible output? → **Skill** → redirect to `create-skill-spec`
- Describes rules, criteria, or frameworks? → **Pattern** → redirect to `patterns/`
- Too granular for a standalone role? → **Responsibility** within an existing role

If it's not a role, inform the user and suggest the appropriate path. Do NOT proceed.

#### 1.3 Identify knowledge gaps

| Field | Required | Notes |
|-------|----------|-------|
| Role name | Yes | kebab-case |
| Archetype | Yes | From common-role-archetypes.md |
| Description | Yes | One-line with trigger conditions |
| Primary mission | Yes | Core outcome |
| Responsibilities | Yes | At least 3, outcome-focused |
| Non-responsibilities | Yes | At least 2 |
| Tools | Recommended | List with justification |
| Skills | Recommended | Must identify primary skill |
| Collaboration | Optional | Hand-off points with other roles |

**Output of Phase 1:** List of known information and gaps to fill.

### Phase 2: Conversational Elicitation (2.1-2.5)

Use AskUserQuestion tool to gather missing information. Ask only about gaps identified in Phase 1. Skip questions for fields already known.

#### 2.1 Elicit role archetype (if unknown)

First, ask about the broad category (single-select):

```
question: "What category best describes this role?"
header: "Role Type"
options:
  - label: "Planning & Coordination"
    description: "Orchestrator, Planner, or Supervisor — coordinates work"
  - label: "Execution"
    description: "Executor, Creator, or Transformer — produces artifacts"
  - label: "Quality & Review"
    description: "Reviewer, Validator, or Approver — evaluates work"
  - label: "Information & Research"
    description: "Gatherer, Analyst, or Synthesizer — processes information"
multiSelect: false
```

Then follow up with specific archetype within the selected category. Use the 2-3 archetypes from `common-role-archetypes.md` for that category as options. For example, if "Planning & Coordination": Orchestrator, Planner, Supervisor.

#### 2.2 Elicit primary mission and scope (if unknown)

Use AskUserQuestion for purpose (single-select):

```
question: "What is this role's primary purpose?"
header: "Purpose"
options:
  - label: "Produce artifacts"
    description: "Creates documents, code, reports, or other tangible outputs"
  - label: "Coordinate work"
    description: "Manages workflow, delegates tasks, tracks progress"
  - label: "Evaluate quality"
    description: "Reviews, validates, or approves work produced by others"
  - label: "Research and analyze"
    description: "Gathers information, identifies patterns, produces insights"
multiSelect: false
```

Follow up with boundaries (multi-select):

```
question: "What should this role explicitly NOT do?"
header: "Boundaries"
options:
  - label: "Not execute specialist work"
    description: "Coordinates but doesn't do the domain-specific tasks"
  - label: "Not make final decisions"
    description: "Provides analysis or recommendations but doesn't approve"
  - label: "Not gather raw data"
    description: "Works with pre-collected information only"
multiSelect: true
```

#### 2.3 Elicit responsibilities (if unknown)

Read `patterns/role-patterns/common-role-archetypes.md` and extract "Typical responsibilities" for the selected archetype.

Use AskUserQuestion with archetype-informed options (multi-select, 4 options from archetype + Other for custom):

```
question: "Which responsibilities apply to this role?"
header: "Duties"
options:
  - label: "{archetype responsibility 1}"
    description: "{from common-role-archetypes.md}"
  - label: "{archetype responsibility 2}"
    ...
multiSelect: true
```

#### 2.4 Elicit tools and skills (if unknown)

Use AskUserQuestion for tools (multi-select):

```
question: "Which tool categories does this role need?"
header: "Tools"
options:
  - label: "File operations"
    description: "Read, Write, Glob, Grep"
  - label: "Web access"
    description: "WebFetch, WebSearch"
  - label: "Execution"
    description: "Bash"
  - label: "Coordination"
    description: "Task, Skill"
multiSelect: true
```

Then scan `.claude/skills/*/SKILL.md` for existing skills. Ask which ones apply (multi-select), then which is the primary skill (single-select from selected).

#### 2.5 Elicit collaboration points (if multi-role context)

Only ask if the user has indicated this role is part of a team.

```
question: "How does this role collaborate with other roles?"
header: "Collaboration"
options:
  - label: "Produces output for another role"
    description: "This role's artifacts are consumed downstream"
  - label: "Receives input from another role"
    description: "This role depends on upstream artifacts"
  - label: "Both directions"
    description: "Receives from and produces for other roles"
  - label: "No collaboration"
    description: "Independent role, no hand-offs"
multiSelect: false
```

If collaboration exists, ask follow-up about specific hand-off points.

**Output of Phase 2:** Complete set of gathered requirements.

### Phase 3: Archetype Validation (3.1-3.2)

#### 3.1 Validate against archetype

Read `patterns/role-patterns/common-role-archetypes.md`. Check gathered information against the selected archetype:

- Does the primary mission align with the archetype's core mission?
- Do the responsibilities match the archetype's typical responsibilities?
- Do the non-responsibilities match the archetype's non-responsibilities?
- Are there contradictions (e.g., Reviewer archetype but all responsibilities are about creating)?

#### 3.2 Resolve mismatches

If gathered information contradicts the selected archetype, use AskUserQuestion to confirm or adjust:

```
question: "Your responsibilities suggest a {better-archetype} rather than {selected-archetype}. Which fits better?"
header: "Confirm"
options:
  - label: "{better-archetype}"
    description: "{why this archetype fits the described responsibilities}"
  - label: "{selected-archetype}"
    description: "Keep original selection despite the mismatch"
multiSelect: false
```

If the gathered information indicates this is actually a skill or pattern, inform the user and redirect to `create-skill-spec` or `patterns/`.

**Output of Phase 3:** Validated archetype with confirmed alignment.

### Phase 4: Artifact Generation (4.1-4.3)

#### 4.1 Consolidate gathered information

Assemble all information into roles-design structure:

1. **Team Context:** team name, domain, mission (or "standalone")
2. **Role Identity:** name, archetype, description with triggers
3. **Primary Mission:** core outcome statement
4. **Responsibilities:** at least 3, outcome-focused
5. **Non-Responsibilities:** at least 2, boundary-setting
6. **Tools:** list with justification for each
7. **Skills:** primary skill identified, secondary skills listed
8. **Collaboration Points:** receives-from and hands-off-to (if applicable)
9. **Constraints:** DO NOT / ALWAYS statements

#### 4.2 Generate roles-design artifact

Use Write to save the artifact to `projects/{project-name}/design-artifacts/roles-design-{role-name}.md`.

Follow this structure:

```markdown
# Roles Design: {role-name}

## Team Context
- **Team name:** {name or "standalone"}
- **Domain:** {domain}
- **Mission:** {mission}

---

## Role: {role-name}

### Identity
| Field | Value |
|-------|-------|
| **Name** | `{role-name}` |
| **Archetype** | {archetype} |
| **Description** | {one-line with "Use when" triggers} |

### Primary Mission
{Core mission statement}

### Responsibilities
1. {outcome-focused responsibility}
2. {outcome-focused responsibility}
3. {outcome-focused responsibility}

### Non-Responsibilities
1. {what this role does NOT do}
2. {what this role does NOT do}

### Tools
- {tool} — {justification}

### Skills
- **Primary:** `{skill-name}` — {description}
- `{secondary-skill}` — {description}

### Collaboration Points
- **Receives from:** {role} — {what}
- **Hands off to:** {role} — {what}

### Constraints
- DO NOT {constraint}
- ALWAYS {constraint}
```

For multi-role artifacts, repeat the `## Role:` section for each role.

Ensure: role name is kebab-case, description includes "Use when" triggers, all required sections populated, at least 3 responsibilities and 2 non-responsibilities.

#### 4.3 Present summary for confirmation

```
Roles Design Generated: {role-name}
Archetype: {archetype}
Primary Mission: {one-line summary}
Skills: {primary-skill} (primary), {secondary-skills}
Location: projects/{project-name}/design-artifacts/roles-design-{role-name}.md

Ready to generate the agent file using create-agent.
```

**Output of Phase 4:** Complete roles-design artifact file.

---

## Failure Modes and Corrections

1. **Skipping role-vs-skill-vs-pattern validation (Execution)**
   - Symptom: Proceeds to gather requirements without checking if it's actually a role
   - Fix: Always run through the decision gate in Phase 1.2

2. **Assuming instead of asking (Execution)**
   - Symptom: Fills in fields with assumptions rather than using AskUserQuestion
   - Fix: For any missing required field, use AskUserQuestion. Document assumptions only for optional fields.

3. **Not writing artifact to file (Execution)**
   - Symptom: Presents roles-design in conversation but doesn't use Write tool
   - Fix: Always use Write to save to `projects/{project-name}/design-artifacts/roles-design-{role-name}.md`

4. **Selecting wrong archetype (Domain)**
   - Symptom: Responsibilities contradict the archetype's core mission
   - Fix: Validate against common-role-archetypes.md in Phase 3. Resolve mismatches with user.

5. **Insufficient responsibilities (Domain)**
   - Symptom: Fewer than 3 responsibilities or 2 non-responsibilities
   - Fix: Use archetype defaults to suggest additional items. Ask user to confirm.

6. **Missing trigger conditions in description (Domain)**
   - Symptom: Description doesn't include "Use when" phrases
   - Fix: Always include 2-3 trigger conditions in the description field.

---

## Safety and Constraints

- **Do NOT** generate roles-design if gathered info indicates this should be a skill or pattern
- **Do NOT** proceed without confirming archetype selection
- **Do NOT** leave required fields empty in generated artifact
- **Do NOT** assume answers to critical questions (archetype, responsibilities, tools)
- **ALWAYS** use AskUserQuestion for missing required information
- **ALWAYS** validate against common-role-archetypes.md before generating artifact
- **ALWAYS** write the artifact to file using Write tool
- **PREFER** specific, actionable questions over vague open-ended ones
- **PREFER** archetype-informed options that guide the user toward valid choices

---

## Structured Reasoning Integration

When applying this skill, use these reasoning patterns:

**During Phase 1 (Initial Analysis):**
```
<analysis>
What is known from the user's request:
- [list known fields]
What is missing:
- [list missing fields]
Is this a role, skill, or pattern?
- [run through decision gate]
</analysis>
```

**During Phase 2 (Conversational Elicitation):**
```
<reasoning>
Gap to fill: [field name]
Question strategy: [why this question approach]
Options rationale: [why these options cover the space]
</reasoning>
```

**During Phase 3 (Archetype Validation):**
```
<reasoning>
Selected archetype: [name]
Mission alignment: [match/mismatch]
Responsibility alignment: [match/mismatch]
Resolution: [confirm or adjust]
</reasoning>
```

**During Phase 4 (Artifact Generation):**
```
<decision>
Role name confirmed: [kebab-case name]
Archetype confirmed: [archetype]
Key responsibilities: [list]
Primary skill: [skill-name]
Artifact path: [path]
</decision>
```

All tags nest inside universal shells: `<analysis>`, `<reasoning>`, `<decision>`.
