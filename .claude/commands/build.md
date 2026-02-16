---
name: build
description: Guided entry point for building agents or skills. Routes to the right skill pipeline and threads project context through the workflow.
---

# /build

You are an orchestrator. Your job is to guide the user through building an agent or skill by loading the right skills at the right time. You do NOT perform any procedures yourself — you delegate to skills.

## Primer

- **Agents** = roles (WHAT/WHY). **Skills** = capabilities (HOW). **Patterns** = reference content. Don't blur these.
- Only two skill types exist: **Tool** (wraps API) or **Workflow** (multi-step procedure). Everything else is a pattern.
- Design artifacts are mandatory intermediate steps — never skip writing them to `projects/{project-name}/design-artifacts/`.
- Output goes to `projects/{project-name}/`. Key references: `CLAUDE.md`, `templates/`, `patterns/`.
- Let the delegated skills run fully. Don't rush users through their questions.

## Step 1: Determine Intent

Use `AskUserQuestion` to ask:

- **Question:** "What do you want to build?"
- **Options:**
  - **Skill** — "A new skill (procedure/recipe for a specific capability)"
  - **Agent** — "A new agent (role definition that orchestrates skills)"

Store the answer as `intent`.

## Step 2: Get Project Name

Use `AskUserQuestion` to ask:

- **Question:** "What is the project name? (output goes to `projects/{project-name}/`)"

Store the answer as `project-name`.

## Step 3: Execute Pipeline

### If intent = Skill

1. Tell the user you are starting the skill specification gathering phase.
2. Read and follow `.claude/skills/create-skill-spec/SKILL.md` — execute it fully. Pass into the skill's input envelope:
   - `project-name` → from Step 2
   - `context` → any description the user provided alongside their intent
3. This will produce a design artifact at `projects/{project-name}/design-artifacts/skill-spec-{skill-name}.md`.
4. Once the artifact is written, tell the user you are moving to the skill generation phase.
5. Read and follow `.claude/skills/create-skill/SKILL.md` — execute it fully. Pass into the skill's input envelope:
   - `project-name` → from Step 2 (do not ask again)
   - `context` → path to the artifact written in step 3

### If intent = Agent

1. Tell the user you are starting the role design gathering phase.
2. Read and follow `.claude/skills/create-role-design/SKILL.md` — execute it fully. Pass into the skill's input envelope:
   - `project-name` → from Step 2
   - `context` → any description the user provided alongside their intent
3. This will produce a design artifact at `projects/{project-name}/design-artifacts/roles-design-{role-name}.md`.
4. Once the artifact is written, tell the user you are moving to the agent generation phase.
5. Read and follow `.claude/skills/create-agent/SKILL.md` — execute it fully. Pass into the skill's input envelope:
   - `project-name` → from Step 2 (do not ask again)
   - `context` → path to the artifact written in step 3

## Rules

- Do NOT skip the specification/design phase. The design artifact must be written to disk before generation begins.
- Do NOT ask for `project-name` again during the generation phase — reuse the value from Step 2.
- Do NOT perform any skill procedures yourself. Read the skill file and follow its instructions.
- If a skill invokes sub-skills inline (e.g., `create-skill-spec` may trigger `setup-mcp-cli` or `install-mcp-server`), let that happen naturally — do not interfere.
