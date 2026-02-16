# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Claude Code Factory System** - a specification framework for generating agent and skill definitions. It transforms design artifacts (skill-spec, roles-design) into consistent, well-structured specification files.

**This is NOT traditional software** - there are no builds, tests, or linting. The system generates specification files through systematic application of included skills.

For a complete registry of all factory components (skills, commands, patterns, templates), see `index.json`.

## Key Operations

- **Build (unified entry point)**: Use `/build` command (`.claude/commands/build.md`) to be guided through agent or skill creation
- **Generate Agents**: Use `create-agent` skill → outputs `projects/{project-name}/agents/{agent-name}.md`
- **Generate Skills**: Use `create-skill` skill → outputs `projects/{project-name}/skills/{skill-name}/SKILL.md`
- **Validate**: Review generated artifacts against templates in `templates/`

## Architecture

### Separation of Concerns

| Component | Owns | Location |
|-----------|------|----------|
| Commands | Multi-skill/multi-agent orchestration prompts | `.claude/commands/` |
| Agents | WHAT and WHY (orchestration, outcomes) | `projects/{project-name}/agents/` |
| Skills | HOW (detailed procedures) | `projects/{project-name}/skills/` |
| Patterns | Reference guidance (frameworks, criteria) | `projects/{project-name}/patterns/` |
| Templates | Output structure (source of truth) | `templates/` |

```
Command → Agent → Skill → (reads Patterns + Templates)
```

A command orchestrates the pipeline. An agent decides what to do. A skill does it. Patterns and templates inform the doing.

### Design Artifact Flow

```
Design Artifacts → Factory Skills → Generated Specifications
     ↓                   ↓                    ↓
skill-spec        create-skill         projects/{project-name}/skills/*/SKILL.md
roles-design      create-agent         projects/{project-name}/agents/*.md
```

### Only Two Valid Skill Types

1. **Tool Skills**: Wrap external APIs/services
2. **Workflow Skills**: Orchestrate multi-step procedures with tangible outputs

Everything else (validation logic, frameworks, rules, checklists) belongs in `patterns/`.

## Required Patterns

### Three-Layer Procedure Model

Every procedural step follows: **Gather** (context) → **Reason** (methodology) → **Document** (reference template)

### Chain-of-Thought Tags (Required in All Agents)

- `<analysis>` - Input understanding
- `<reasoning>` - Decision-making process
- `<decision>` - Final outputs/conclusions

### Naming Conventions

- All files: **kebab-case** (lowercase with hyphens)
- Agents: `{role-name}.md` (role-based nouns)
- Skills: `{skill-name}/SKILL.md` (capability description)
- Patterns: `{domain}-{type}.md` (descriptive)

## Critical Constraints

**DO:**
- Start with design artifacts before generating anything
- Reference templates by path (never embed structure)
- Validate pattern references exist and are bidirectional
- Keep agent HIGH LEVEL BEHAVIOUR to 3-5 outcome-focused points
- Keep skill body under 500 lines

**DO NOT:**
- Create skills without design artifact specifications
- Duplicate template structure in skill body
- Create "policy", "validation", or "compliance" as skills (use patterns)
- Put step-by-step procedures in agent behaviors (belongs in skills)
- Use CamelCase, PascalCase, or snake_case for file names

## Key Decision Gate: Skill vs Pattern

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

