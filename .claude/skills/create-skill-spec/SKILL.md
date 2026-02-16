---
name: create-skill-spec
type: workflow
description: Guides conversational requirements gathering for new skills using AskUserQuestion tool. Use when a user wants to create a new skill; when skill requirements are vague or incomplete; or when you need to interview the user to understand skill design.
---

# Create Skill Spec

This skill guides Claude in transforming vague skill ideas into complete skill-spec artifacts through systematic conversational elicitation.

It focuses on **gathering requirements through targeted questions**, not on generating the final skill file (that's the `create-skill` skill's job).

---

## Purpose

Use this skill to:

- Analyze initial skill descriptions to identify knowledge gaps
- Use AskUserQuestion tool to gather missing requirements conversationally
- Classify skill type (tool vs workflow) based on gathered information
- Generate skill-spec artifacts that feed directly into the `create-skill` skill
- Ensure all required fields are populated before artifact generation

This skill is intended to feed into:

- `create-skill` skill for generating complete skill files

---

## Applicability

### When to use this skill

Trigger this skill when:

- User provides a vague or incomplete skill idea
- User explicitly requests help designing a new skill
- You need to gather requirements for a new skill
- Initial skill description lacks type, inputs, outputs, or procedure details

Common trigger phrases: "I need a skill that...", "Help me design a skill for...", "Create a skill to...".

### When not to use this skill

Avoid using this skill when:

- A complete skill-spec artifact already exists
- User provides detailed, structured skill specifications with all required fields
- Modifying or updating an existing skill
- The request is for a pattern, not a skill

In those cases, use `create-skill` directly for existing specs, or consult `patterns/skill-patterns/skill-vs-pattern-decision.md` if uncertain whether it's a skill or pattern.

---

## Dependencies

This skill relies on:

- `patterns/skill-patterns/skill-type-taxonomy.md` - For skill type classification criteria
- `patterns/skill-patterns/skill-vs-pattern-decision.md` - To validate the request is actually for a skill
- `patterns/mcp-patterns/mcp-server-catalog.md` - For MCP server capability lookup (Phase 2.6)
- `patterns/mcp-patterns/mcp-integration-guide.md` - For MCP integration decision framework (Phase 2.6)
- `setup-mcp-cli` skill - For inline mcp-cli installation when not present (Phase 2.6)
- `install-mcp-server` skill - For inline server installation after mcp-cli setup (Phase 2.6)
- AskUserQuestion tool - For conversational elicitation

---

## Inputs

### From the Input Envelope

The agent invoking this skill receives a standardized input envelope. This skill extracts:

- **From `project-name`:**
  - Target project name for output (determines output directory `projects/{project-name}/`)
  - If not provided, ask user via AskUserQuestion before proceeding (see step 1.0)

- **From `goal`:**
  - The initial skill idea or description from the user
  - Any specific problem the skill should solve

- **From `context`:**
  - Team or project context if provided
  - Related existing skills or workflows

- **From `constraints`:**
  - Any boundaries on what the skill should or shouldn't do
  - Naming conventions to follow

- **From `upstream`:**
  - Prior conversation context about the skill
  - Any partial specifications already discussed

- **From `extra`:**
  - Examples of similar skills if provided
  - Reference materials about the domain

### From the File System

Use file tools (Glob, Read) to locate:

- `patterns/skill-patterns/skill-type-taxonomy.md` - For type classification
- `patterns/skill-patterns/skill-vs-pattern-decision.md` - For skill vs pattern validation

### Missing Input Handling

If required inputs are missing:

- **Required inputs:** Initial skill idea (at minimum a brief description). Cannot proceed without any indication of what skill the user wants.
- **Optional inputs:** Team context, naming conventions, examples (proceed with defaults)
- **Document assumptions in:** The generated skill-spec artifact's constraints section

---

## Outputs

### Output Type

File Artifact

### Primary Output

- **Description:** A complete skill-spec artifact ready to feed into `create-skill`
- **Format:** Structured markdown document

### Written Artifacts

- **Tool:** Write tool
- **Location:** `projects/{project-name}/design-artifacts/`
- **Naming pattern:** `skill-spec-{skill-name}.md`
- **Example:** `projects/{project-name}/design-artifacts/skill-spec-keyword-research.md`
- **Validation:** All required sections populated (Identity, Purpose, Applicability, Inputs, Outputs, Procedure outline, Pattern references)

### Downstream Usage

- `create-skill` skill: Consumes the artifact to generate the complete SKILL.md file
- Review the spec before proceeding to `create-skill`

---

## Procedure

Claude should follow this procedure when using this skill.

### Phase 1: Initial Analysis (1.0-1.3)

#### 1.0 Resolve project name

If `project-name` was not provided in the input envelope, use `AskUserQuestion` to ask the user:
- "What is the project name for this output? (used for the output directory `projects/{project-name}/`)"

Store the project name for use in all output paths.

#### 1.1 Receive and parse initial skill idea

Extract from the user's request:
- What problem does this skill solve?
- Any hints about type (API/tool vs workflow)?
- Any mentioned inputs or outputs?
- Any procedural steps mentioned?

Document what is KNOWN vs what is MISSING.

#### 1.2 Validate this is actually a skill

Use Read to open `patterns/skill-patterns/skill-vs-pattern-decision.md`.

Run through the decision gate:
- Does it wrap an external API? → Tool Skill
- Does it orchestrate multi-step procedures with tangible output? → Workflow Skill
- Is it validation logic, checklist, or framework? → PATTERN, not skill

If it's pattern-like content, inform the user and do NOT proceed with skill-spec generation. Suggest creating a pattern file instead.

#### 1.3 Identify knowledge gaps

Create a mental checklist of required skill-spec fields:

| Field | Status | Notes |
|-------|--------|-------|
| Skill name | Known/Missing | |
| Skill type | Known/Missing | tool or workflow |
| Description with triggers | Known/Missing | |
| Purpose & capabilities | Known/Missing | |
| When to use / not use | Known/Missing | |
| Inputs | Known/Missing | |
| Outputs | Known/Missing | |
| Procedure outline | Known/Missing | |
| Pattern references | Known/Missing | |

**Output of Phase 1:** List of known information and gaps to fill.

### Phase 2: Conversational Elicitation (2.1-2.5)

Use AskUserQuestion tool to gather missing information. Ask only about gaps identified in Phase 1. Skip questions for fields already known.

#### 2.1 Elicit skill type (if unknown)

Use AskUserQuestion with:

```
question: "What type of skill is this?"
header: "Skill Type"
options:
  - label: "Tool Skill"
    description: "Wraps an external API or service (e.g., calling Grammarly, DataForSEO, or a database)"
  - label: "Workflow Skill"
    description: "Orchestrates multiple steps to produce an artifact (e.g., research → analysis → report)"
multiSelect: false
```

#### 2.2 Elicit purpose and scope (if unknown)

Use AskUserQuestion with questions like:

```
question: "What is the primary problem this skill solves?"
header: "Purpose"
options:
  - label: "Data retrieval"
    description: "Fetch information from an external source"
  - label: "Content transformation"
    description: "Transform input into a different format or structure"
  - label: "Decision/classification"
    description: "Analyze input and produce a decision or categorization"
  - label: "Orchestration"
    description: "Coordinate multiple steps or other skills"
multiSelect: false
```

Follow up with boundary questions:

```
question: "What should this skill explicitly NOT do?"
header: "Scope"
options:
  - label: "Not persist data"
    description: "Produces output but doesn't save to database/file"
  - label: "Not make decisions"
    description: "Gathers/transforms data but doesn't decide next steps"
  - label: "Not call external APIs"
    description: "Works only with local data and patterns"
multiSelect: true
```

#### 2.3 Elicit inputs and outputs (if unknown)

Use AskUserQuestion:

```
question: "What inputs does this skill need to start?"
header: "Inputs"
options:
  - label: "User-provided text/data"
    description: "Text, keywords, URLs, or other content from the user"
  - label: "Upstream artifact"
    description: "Output from a previous skill or workflow step"
  - label: "Configuration/settings"
    description: "Parameters, thresholds, or preferences"
  - label: "External data source"
    description: "API credentials, database connection, file path"
multiSelect: true
```

```
question: "What does this skill produce as output?"
header: "Output"
options:
  - label: "File artifact"
    description: "A document, report, or data file saved to workspace"
  - label: "In-memory data"
    description: "Data passed to the next step without file persistence"
  - label: "API response"
    description: "Structured response from an external service"
  - label: "Decision/classification"
    description: "A determination or categorization with rationale"
multiSelect: false
```

#### 2.4 Elicit procedure outline (if unknown)

Use AskUserQuestion:

```
question: "How complex is this skill's procedure?"
header: "Complexity"
options:
  - label: "Simple (3-5 steps)"
    description: "Linear flow, no branching or conditional logic"
  - label: "Moderate (multiple phases)"
    description: "Distinct phases like gather → process → output"
  - label: "Complex (conditional logic)"
    description: "Decision points, branching, or iteration"
multiSelect: false
```

If user selects moderate or complex, ask follow-up about phases:

```
question: "What are the main phases of this skill?"
header: "Phases"
(Allow free-text response via "Other" option)
```

#### 2.5 Elicit pattern dependencies (if applicable)

Use AskUserQuestion:

```
question: "Does this skill need to reference any validation criteria or frameworks?"
header: "Patterns"
options:
  - label: "Yes, existing patterns"
    description: "Uses patterns already defined in patterns/"
  - label: "Yes, new patterns needed"
    description: "Will require new pattern files to be created"
  - label: "No patterns needed"
    description: "Self-contained, no external validation criteria"
multiSelect: false
```

#### 2.6 Elicit MCP dependencies

Check if `mcp-cli` is available. Run via Bash: `mcp-cli --version 2>/dev/null`

**If mcp-cli is NOT available**, use AskUserQuestion:

```
question: "MCP servers can enhance skills with external tools (docs lookup, browser automation, workflow orchestration). mcp-cli is not installed. Would you like to set it up?"
header: "MCP Setup"
options:
  - label: "Yes, install now"
    description: "Runs setup-mcp-cli to install the binary, configure PATH, and bootstrap config"
  - label: "Skip for this skill"
    description: "Continue without MCP — you can add it later via setup-mcp-cli"
  - label: "Never ask again"
    description: "Skip MCP for this and future skill-specs in this session"
multiSelect: false
```

**If user selects "Yes, install now":**

1. Invoke the `setup-mcp-cli` skill (follow its full procedure inline)
2. After setup succeeds, read `patterns/mcp-patterns/mcp-server-catalog.md` and present available servers via AskUserQuestion so the user can install relevant ones using the `install-mcp-server` skill
3. Proceed to MCP discovery below

**If user selects "Skip for this skill":**

Record in the skill-spec artifact: "MCP integration declined — revisit with `setup-mcp-cli`". Proceed to Phase 3.

**If user selects "Never ask again":**

Skip Phase 2.6 for the remainder of this session. Proceed to Phase 3.

**If mcp-cli IS available** (or was just installed above):

1. Read `patterns/mcp-patterns/mcp-server-catalog.md` for the capability list
2. Read `patterns/mcp-patterns/mcp-integration-guide.md` for the discovery procedure
3. Follow the pattern's MCP Discovery Procedure (section 2.6.1–2.6.5) to determine whether any configured MCP servers match the skill's purpose
4. If matches are found, use AskUserQuestion to ask the user whether to include them as dependencies
5. Record selected MCP dependencies for inclusion in the skill-spec artifact

**Output of Phase 2:** Complete set of gathered requirements.

### Phase 3: Type Validation (3.1-3.2)

#### 3.1 Validate against taxonomy

Use Read to open `patterns/skill-patterns/skill-type-taxonomy.md`.

Check gathered information against decision criteria:

**For Tool Skills:**
- Does it call an external API or service? ✓/✗
- Does it require credentials or authentication? ✓/✗
- Is the complexity in integration, not business logic? ✓/✗

**For Workflow Skills:**
- Does it have multiple procedural steps? ✓/✗
- Does it produce a tangible artifact? ✓/✗
- Does it orchestrate other skills or apply patterns? ✓/✗

#### 3.2 Resolve type ambiguity

If type is still ambiguous after validation:

Use AskUserQuestion to present the classification with rationale:

```
question: "Based on your description, this seems like a [type]. Is that correct?"
header: "Confirm Type"
options:
  - label: "Yes, that's correct"
    description: "[Rationale for classification]"
  - label: "No, it should be [other type]"
    description: "[What would make it the other type]"
multiSelect: false
```

If it's actually a pattern (not a skill), inform the user:
"Based on the requirements, this appears to be validation criteria / a checklist / a framework rather than an executable skill. Consider creating a pattern file in `patterns/` instead."

**Output of Phase 3:** Confirmed skill type with validation.

### Phase 4: Artifact Generation (4.1-4.3)

#### 4.1 Consolidate gathered information

Assemble all information into skill-spec structure:

1. **Skill Identity:** name, type, description with triggers
2. **Purpose and Capabilities:** what it does, downstream usage
3. **Applicability:** when to use, when NOT to use
4. **Roles:** who uses this skill
5. **Inputs:** from envelope, from file system
6. **Outputs:** type, location, format
7. **Procedure Outline:** phases or steps (not full detail)
8. **Pattern References:** paths to patterns this skill needs
9. **Constraints:** do not / always / prefer statements
10. **MCP Dependencies:** server names, integration types, and fallback behavior (from Phase 2.6, if any)

#### 4.2 Generate skill-spec artifact

Use Write to save the artifact to `projects/{project-name}/design-artifacts/skill-spec-{skill-name}.md`.

Follow the structure from the skill-spec artifact format (see existing examples).

Ensure:
- Skill name is kebab-case
- Description includes "Use when" triggers
- All sections are populated (no empty sections)
- Pattern references use exact paths

#### 4.3 Present summary for confirmation

Present a concise summary to the user:

```
Skill Spec Generated: {skill-name}
Type: {tool/workflow}
Purpose: {one-line summary}
Output: {what it produces}
Location: projects/{project-name}/design-artifacts/skill-spec-{skill-name}.md

Ready to generate the full skill file using create-skill.
```

**Output of Phase 4:** Complete skill-spec artifact file.

---

## Failure Modes and Corrections

1. **Skipping skill-vs-pattern validation (Execution)**
   - Symptom: Proceeds to gather requirements without checking if it's actually a skill
   - Fix: Always read `patterns/skill-patterns/skill-vs-pattern-decision.md` in Phase 1.2

2. **Assuming instead of asking (Execution)**
   - Symptom: Fills in fields with assumptions rather than using AskUserQuestion
   - Fix: For any missing required field, use AskUserQuestion. Document assumptions only for optional fields.

3. **Not writing artifact to file (Execution)**
   - Symptom: Presents spec in conversation but doesn't use Write tool
   - Fix: Always use Write to save to `projects/{project-name}/design-artifacts/skill-spec-{skill-name}.md`

4. **Generating spec for pattern-like content (Domain)**
   - Symptom: Creates skill-spec for what should be a checklist, rubric, or policy
   - Fix: Run through skill-vs-pattern decision gate. If pattern-like, inform user and redirect.

5. **Incomplete procedure outline (Domain)**
   - Symptom: Procedure section has vague steps like "process the input"
   - Fix: Elicit specific phases or steps. Each step should have a clear action and output.

6. **Missing trigger conditions in description (Domain)**
   - Symptom: Description doesn't include "Use when" phrases
   - Fix: Always include 2-3 trigger conditions in the description field.

7. **Silently skipping MCP integration (Execution)**
   - Symptom: Phase 2.6 skips without informing the user when mcp-cli is not installed
   - Fix: Always present AskUserQuestion with install/skip/never options. Never skip silently.

---

## Safety and Constraints

When using this skill:

- **Do NOT** generate skill-spec if gathered info indicates this should be a pattern
- **Do NOT** proceed without confirming skill type (tool vs workflow)
- **Do NOT** leave required fields empty in generated artifact
- **Do NOT** assume answers to critical questions (type, inputs, outputs)
- **ALWAYS** use AskUserQuestion for missing required information
- **ALWAYS** validate against skill-type-taxonomy before generating artifact
- **ALWAYS** write the artifact to file using Write tool
- **PREFER** specific, actionable questions over vague open-ended ones
- **PREFER** multiple-choice options that guide the user toward valid choices

This skill's purpose is to ensure complete, accurate skill specifications that will successfully compile through the `create-skill` skill.

---

## Structured Reasoning Integration

Use these reasoning tags at key decision points:

- **Phase 1:** `<analysis>` — list known fields, missing fields, skill-vs-pattern verdict
- **Phase 2:** `<reasoning>` — gap to fill, question strategy, options rationale
- **Phase 4:** `<decision>` — confirmed type, capabilities, triggers, artifact path
