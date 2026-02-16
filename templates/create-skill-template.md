---
name: {{skill-name}}
type: {{workflow/tool}}
description: {{What this skill does}}. Use when {{trigger condition 1}}; when {{trigger condition 2}}; or when {{trigger condition 3}}.
---

# {{Skill Name}}

This skill guides Claude in {{primary purpose}}.

It focuses on **{{main focus}}**, not on {{what it doesn't do}}.

---

## Purpose

Use this skill to:

- {{capability 1}}
- {{capability 2}}
- {{capability 3}}

This skill is intended to feed into:

- {{downstream use 1}}
- {{downstream use 2}}

---

## Applicability

### When to use this skill

Trigger this skill when:

- {{condition 1}}
- {{condition 2}}
- {{condition 3}}

Common trigger phrases: "{{phrase 1}}", "{{phrase 2}}", "{{phrase 3}}".

### When not to use this skill

Avoid using this skill when:

- {{anti-condition 1}}
- {{anti-condition 2}}

In those cases, {{what to do instead}}.

---

## Dependencies
This skill relies on:
- {{other-skill-dependencies}}
- {{pattern-dependencies}}
- {{config-dependencies}}
- {{template-dependencies}}

---

## Inputs

### From the Input Envelope

The agent invoking this skill receives a standardized input envelope. This skill extracts:

- **From `goal`:**
  - {{What domain-specific information to extract from the goal field}}

- **From `context`:**
  - {{What domain-specific information to extract from the context field}}

- **From `constraints`:**
  - {{What domain-specific constraints apply to this skill's execution}}

- **From `upstream`:**
  - {{What upstream artifacts this skill expects or builds upon}}

- **From `extra`:**
  - {{Additional materials this skill may receive}}

### From the File System

Use file tools (Glob, Read) to locate:

- {{File-based input 1}}
- {{File-based input 2}}

### Missing Input Handling

If required inputs are missing:

- **Required inputs:** {{List inputs that must be present, or "cannot proceed"}}
- **Optional inputs:** {{List inputs with their default values}}
- **Document assumptions in:** {{Where to record any assumptions made}}

---

## Outputs

### Output Type

{{One of: File Artifact | In-Memory Data | Reference Only}}

{{Choose based on what this skill produces:}}
{{- File Artifact: Skill produces documents, reports, or files that persist}}
{{- In-Memory Data: Skill produces data passed to next agent/step without file persistence}}
{{- Reference Only: Skill is reference material that agents read (knowledge/policy skills)}}

### Primary Output

- **Description:** {{What this skill produces or provides}}
- **Format:** {{Markdown document / JSON object / Decision / Scores / etc.}}

### Written Artifacts (for File Artifact type only)

{{Include this subsection only if Output Type is "File Artifact"}}

- **Tool:** Write tool
- **Location:** `workspace/`
- **Naming pattern:** `{{artifact-type}}-{agent-name}-{timestamp}.md`
- **Example:** `workspace/{{example-artifact-name}}.md`
- **Validation:** {{What makes output complete - e.g., all sections filled, no placeholders}}

### Downstream Usage

{{Who or what consumes this output:}}
- {{Consumer 1}}: {{How they use it}}
- {{Consumer 2}}: {{How they use it}}

---

## Procedure

Claude should follow this procedure when using this skill.

{{Choose flat steps for simple skills, or phased structure (Phase 1, Phase 2) for complex skills.}}

### Step 1: {{Step name}}

{{For file/web operations, name the tool explicitly. For cognitive steps, describe the thinking.}}

1. {{Use [Tool] to [action]}} OR {{[Cognitive action] - describe the reasoning}}
2. {{action}}

Output of Step 1: {{What this step produces that feeds into the next step}}

### Step 2: {{Step name}}

1. {{action}}
2. {{action}}

Output of Step 2: {{What this step produces}}

### Step 3: {{Step name}}

1. {{action}}
2. {{action}}

Output of Step 3: {{What this step produces}}

---

### Tool Usage Guidance

When writing procedure steps:

**Name Claude Code tools explicitly for:**
- File reading: `Use Read to open...` or `Use Glob to find...`
- File writing: `Use Write to save to workspace/...`
- Content search: `Use Grep to search for...`
- Web access: `Use WebFetch to retrieve...` or `Use WebSearch to find...`

**Describe cognitively for reasoning steps:**
- Analysis: "Analyze the data and identify patterns"
- Classification: "Classify each item by type"
- Decision: "Determine which approach best fits the constraints"

**For domain tools (MCP or external):**
- If MCP available: "Use the {{tool-name}} MCP tool to..."
- If manual: "Request {{data}} from {{source}} (manual step)"

---

## Failure Modes and Corrections

{{Include BOTH types of failure modes (4-6 total, at least 2 of each type):}}

{{**Execution failures** - Problems with HOW the skill is applied:}}
{{- Skipping required input validation}}
{{- Using wrong tools for file/web operations}}
{{- Missing output validation before completion}}
{{- Not following procedure phases in order}}

{{**Domain failures** - Problems with WHAT is produced:}}
{{- Quality issues specific to this skill's domain}}
{{- Incorrect or incomplete outputs}}
{{- Violations of domain constraints}}

1. **{{Execution or domain problem}}**
   - Symptom: {{What it looks like}}
   - Fix: {{How to correct it}}
2. **{{Execution or domain problem}}**
   - Symptom: {{What it looks like}}
   - Fix: {{How to correct it}}
3. **{{Execution or domain problem}}**
   - Symptom: {{What it looks like}}
   - Fix: {{How to correct it}}
4. **{{Execution or domain problem}}**
   - Symptom: {{What it looks like}}
   - Fix: {{How to correct it}}

---

## Safety and constraints

When using this skill:

- Do not {{constraint 1}}
- Do not {{constraint 2}}
- Be explicit about {{what to be explicit about}}

This skill's purpose is to {{ultimate goal}}.

---