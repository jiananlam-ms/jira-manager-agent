# Agent Skill Generation

A specification framework for generating AI agent teams using Claude Code. Transform design artifacts into consistent, well-structured agent and skill definitions.

## What This Project Does

This is a **Claude Code Factory System** - it provides skills and templates to systematically create AI agent teams. Instead of writing agent prompts from scratch, you:

1. Define your requirements in **design artifacts**
2. Use the included **skills** to generate standardized agent and skill files
3. Get consistent, well-structured outputs that follow best practices

**This is NOT traditional software** - there are no builds, tests, or package installations. The system generates specification files through Claude Code skills.

---

## Quick Start

### Prerequisites

- [Claude Code CLI](https://claude.ai/code) installed and configured
- This repository cloned locally

### Your First Agent Team (5 Steps)

**Step 1: Open the project in Claude Code**

```bash
cd agent-skill-generation
claude
```

**Step 2: Design your skill requirements**

Use the `create-skill-spec` skill to gather requirements through a guided conversation:

```
/create-skill-spec
```

Claude will ask you questions about:
- What problem the skill solves
- Whether it's a Tool Skill (wraps APIs) or Workflow Skill (multi-step procedures)
- What inputs it needs and outputs it produces
- The key procedure steps

**Step 3: Generate the skill file**

Once you have a skill-spec artifact, use `create-skill` to generate the complete skill:

```
/create-skill
```

This reads your skill-spec from `projects/{project-name}/design-artifacts/` and outputs a complete skill file to `projects/{project-name}/skills/{skill-name}/SKILL.md`.

**Step 4: Design your agent (role)**

Use the `create-role-design` skill to gather role requirements through a guided conversation:

```
/create-role-design
```

Claude will ask you questions about:
- What archetype best fits the role (Orchestrator, Creator, Reviewer, etc.)
- The role's primary mission and responsibilities
- Which tools and skills it needs
- How it collaborates with other agents

**Step 5: Generate the agent file**

Use `create-agent` to transform the role specification into an agent file:

```
/create-agent
```

This outputs a complete agent definition to `projects/{project-name}/agents/{agent-name}.md`.

---

## Core Concepts

### The Separation of Concerns

| Component | Owns | Example |
|-----------|------|---------|
| **Commands** | Multi-skill/multi-agent orchestration prompts | `/build` guides user through spec → generation |
| **Agents** | WHAT and WHY (orchestration, outcomes) | "Analyst produces research briefs" |
| **Skills** | HOW (detailed procedures) | "How to conduct keyword research" |
| **Patterns** | Reference guidance (frameworks, criteria) | "E-E-A-T quality framework" |
| **Templates** | Output structure (source of truth) | "Structure of a content brief" |

### The Two Valid Skill Types

1. **Tool Skills** - Wrap external APIs or services
   - Example: A skill that calls the DataForSEO API

2. **Workflow Skills** - Orchestrate multi-step procedures with tangible outputs
   - Example: A skill that guides content brief creation

Everything else (validation logic, frameworks, rules, checklists) belongs in `patterns/`, not skills.

### Design Artifacts

Design artifacts are the input specifications that drive the factory:

| Artifact Type | Purpose | Example |
|---------------|---------|---------|
| `skill-spec-*` | Specifies a single skill | `skill-spec-keyword-research.md` |
| `roles-design-*` | Specifies agent roles | `roles-design-seo-team.md` |

---

## Available Commands

Commands orchestrate multiple skills or agents into guided workflows.

### `/build`

**Purpose:** Guided entry point for building agents or skills. Routes to the right skill pipeline and threads project context through the workflow.

**When to use:**
- Starting any new agent or skill creation from scratch
- You want a guided walkthrough that handles both spec gathering and generation

**How it works:**
1. Asks whether you're building a skill or an agent
2. Asks for the project name (output goes to `projects/{project-name}/`)
3. Runs the spec/design gathering skill, then the generation skill automatically

---

## Available Skills

### `/create-skill-spec`

**Purpose:** Gather requirements for a new skill through guided conversation.

**When to use:**
- You have a vague idea for a skill
- You need help figuring out if it's a skill or a pattern
- You want to ensure all required fields are captured

**Output:** A skill-spec artifact in `projects/{project-name}/design-artifacts/`

**Example conversation:**
```
User: /create-skill-spec

Claude: What type of skill is this?
  - Tool Skill (wraps an external API)
  - Workflow Skill (multi-step procedure)

User: Workflow Skill

Claude: What is the primary problem this skill solves?
  - Data retrieval
  - Content transformation
  - Decision/classification
  - Orchestration

... (continues gathering requirements)
```

---

### `/create-role-design`

**Purpose:** Gather requirements for a new agent role through guided conversation.

**When to use:**
- You have a vague idea for an agent role
- You need help choosing the right role archetype
- You want to ensure all required fields are captured before generating an agent

**Output:** A roles-design artifact in `projects/{project-name}/design-artifacts/`

**Example conversation:**
```
User: /create-role-design

Claude: What category best describes this role?
  - Planning & Coordination
  - Execution
  - Quality & Review
  - Information & Research

User: Execution

Claude: Which specific execution role fits best?
  - Executor / Worker
  - Creator
  - Transformer

... (continues gathering requirements)
```

---

### `/create-skill`

**Purpose:** Generate a complete skill file from a skill-spec artifact.

**When to use:**
- A skill-spec artifact exists in `projects/{project-name}/design-artifacts/`
- You're ready to compile the specification into a usable skill

**Input:** Skill-spec artifact (e.g., `projects/{project-name}/design-artifacts/skill-spec-keyword-research.md`)

**Output:** Complete skill file at `projects/{project-name}/skills/{skill-name}/SKILL.md`

**What it produces:**
- YAML frontmatter (name, type, description with triggers)
- Purpose section with capabilities
- Applicability (when to use / when not to use)
- Dependencies on patterns and templates
- Detailed inputs and outputs
- Step-by-step procedure
- Failure modes and corrections
- Safety constraints

---

### `/create-agent`

**Purpose:** Generate a complete agent file from a roles-design artifact.

**When to use:**
- A roles-design artifact exists with the role specification
- You're ready to create an agent that can be invoked

**Input:** Role specification from roles-design artifact

**Output:** Complete agent file at `projects/{project-name}/agents/{agent-name}.md`

**What it produces:**
- YAML frontmatter (name, description, tools, skills, model)
- Identity section with do/don't lists
- Required first steps (skill invocations, file reads)
- Input envelope specification
- High-level behavior (3-5 outcome-focused points)
- Output contract
- Boundaries and failure modes

---

### `/create-pattern`

**Purpose:** Create or enhance pattern files with proper depth and structure.

**When to use:**
- Enhancing thin companion patterns that `create-skill` scaffolded
- Creating new patterns for an existing skill that needs additional reference content
- Creating standalone patterns not tied to any skill (governance, role, framework)

**Modes:**
1. **Enhance existing pattern** — Flesh out a thin pattern into a full-depth pattern
2. **New pattern for a skill** — Create a pattern and auto-wire it into the skill's Dependencies and procedure
3. **Standalone pattern** — Create reference content not tied to any skill

**Output:** Pattern file at `projects/{project-name}/patterns/{pattern-domain}/{pattern-key}.md`

---

### `/setup-mcp-cli`

**Purpose:** Detect, install, and configure the mcp-cli binary and its config directory.

**When to use:**
- Setting up MCP infrastructure for the first time
- mcp-cli is not found on the system
- Also invoked inline by `create-skill-spec` during Phase 2.6

**Output:** Installed `mcp-cli` binary, configured PATH, bootstrapped `~/.config/mcp/`

---

### `/install-mcp-server`

**Purpose:** Add an MCP server to your configuration from the server catalog.

**When to use:**
- You want to add an MCP server (e.g., context7, playwright, figma)
- A skill requires an MCP server that is not yet configured
- Also invoked inline by `create-skill-spec` during Phase 2.6

**Output:** Updated `~/.config/mcp/mcp_servers.json` with verified server entry

---

### `/structured-reasoning`

**Purpose:** Define and enforce the universal reasoning structure for all agents.

**When to use:**
- An agent or skill performs non-trivial decisions, designs, or multi-step reasoning
- You need to establish the `<analysis>` → `<reasoning>` → `<decision>` tag model

**Output:** Structured reasoning tags applied to the current task

---

## Project Structure

```
agent-skill-generation/
├── .claude/
│   ├── agents/           # Generated agent definitions
│   ├── commands/         # Slash commands
│   │   ├── build.md
│   │   └── how-it-works.md
│   └── skills/           # Available skills
│       ├── create-agent/
│       │   └── SKILL.md
│       ├── create-skill/
│       │   └── SKILL.md
│       ├── create-role-design/
│       │   └── SKILL.md
│       ├── create-skill-spec/
│       │   └── SKILL.md
│       ├── create-pattern/
│       │   └── SKILL.md
│       ├── setup-mcp-cli/
│       │   └── SKILL.md
│       ├── install-mcp-server/
│       │   └── SKILL.md
│       └── structured-reasoning/
│           └── SKILL.md
├── projects/              # Generated project outputs (gitignored)
├── patterns/             # Reference guidance and frameworks
│   ├── governance-patterns/
│   │   └── naming-conventions.md
│   ├── role-patterns/
│   │   └── common-role-archetypes.md
│   ├── mcp-patterns/
│   │   ├── mcp-integration-guide.md
│   │   ├── mcp-server-catalog.md
│   │   ├── mcp-cli-guide.md
│   │   ├── context7-mcp-cli-guide.md
│   │   ├── figma-mcp-cli-guide.md
│   │   ├── gmail-mcp-cli-guide.md
│   │   ├── playwright-mcp-cli-guide.md
│   │   └── n8n-mcp-cli-guide.md
│   └── skill-patterns/
│       ├── skill-procedure-model.md
│       ├── skill-type-taxonomy.md
│       └── skill-vs-pattern-decision.md
├── templates/            # Output structure templates (source of truth)
│   ├── create-agent-template.md
│   └── create-skill-template.md
├── CLAUDE.md             # Instructions for Claude Code
└── README.md             # This file
```

---

## Typical Workflow: Building an SEO Content Team

Here's a complete example of using this system to build an SEO content team:

### 1. Start with skill specifications

```
User: /create-skill-spec

(Answer questions about a "keyword-research" skill)
(Answer questions about a "content-brief" skill)
(Answer questions about a "seo-optimization" skill)
```

This creates:
- `projects/{project-name}/design-artifacts/skill-spec-keyword-research.md`
- `projects/{project-name}/design-artifacts/skill-spec-content-brief.md`
- `projects/{project-name}/design-artifacts/skill-spec-seo-optimization.md`

### 2. Generate the skill files

```
User: /create-skill
(Select keyword-research)

User: /create-skill
(Select content-brief)

User: /create-skill
(Select seo-optimization)
```

This creates skills in `.claude/skills/`.

### 3. Design your agent roles

```
User: /create-role-design
(Answer questions to design an "Analyst" role)

User: /create-role-design
(Answer questions to design a "Strategist" role)

User: /create-role-design
(Answer questions to design an "Editor" role)
```

This creates:
- `projects/{project-name}/design-artifacts/roles-design-analyst.md`
- `projects/{project-name}/design-artifacts/roles-design-strategist.md`
- `projects/{project-name}/design-artifacts/roles-design-editor.md`

### 4. Generate the agent files

```
User: /create-agent
(Select Analyst role)

User: /create-agent
(Select Strategist role)

User: /create-agent
(Select Editor role)
```

This creates agents in `.claude/agents/`.

### 5. Use your new team

Your agents can now be invoked in Claude Code:
- Each agent knows its responsibilities and boundaries
- Each agent invokes the appropriate skills
- Agents can collaborate through structured handoffs

---

## Key Patterns and Conventions

### Naming Conventions

- All files use **kebab-case** (lowercase with hyphens)
- Agents: `{role-name}.md` (e.g., `analyst.md`)
- Skills: `{skill-name}/SKILL.md` (e.g., `keyword-research/SKILL.md`)
- Patterns: `{domain}-{type}.md` (e.g., `skill-type-taxonomy.md`)

### The Three-Layer Procedure Model

Every procedural step in skills follows:
1. **Gather** - Collect context and inputs
2. **Reason** - Apply methodology and make decisions
3. **Document** - Reference templates and produce output

### Chain-of-Thought Tags

All agents use structured reasoning with these tags:
- `<analysis>` - Input understanding
- `<reasoning>` - Decision-making process
- `<decision>` - Final outputs/conclusions

---

## Decision Gate: Skill vs Pattern

Not sure if you need a skill or a pattern? Use this guide:

```
Is it a SKILL?
├── Wraps external API/service? → Tool Skill
├── Orchestrates multi-step procedure? → Workflow Skill
└── Otherwise → Probably a Pattern

Is it PATTERN-LIKE?
├── Validation logic/checklist? → Pattern
├── Framework/methodology? → Pattern
├── Rules/constraints/policy? → Pattern
└── How to package: <100 lines inline, ≥100 lines separate file
```

---

## Reference Documentation

For a complete registry of all factory components (skills, commands, patterns, templates), see `index.json`.

---

## Contributing

This is a specification framework, not traditional code. To contribute:

1. Design artifacts go in `projects/{project-name}/design-artifacts/`
2. New patterns go in `patterns/{domain}-patterns/`
3. Template updates modify `templates/`
4. Skill improvements follow the existing structure in `.claude/skills/`

---

## License

[Add your license here]
