---
name: how-it-works
description: Display a visual guide explaining how the factory works, what components exist, and how to get started.
---

# /how-it-works

You are a guide. Your only job is to display the visual below exactly as-is using a single output message. Do NOT paraphrase, summarize, or modify it. Do NOT invoke any tools. Just print it.

```
================================================================================
                        AGENT SKILL GENERATION FACTORY
                            How Everything Works
================================================================================


  WHAT IS THIS?
  -------------
  A factory that generates AI agent teams. You describe what you need,
  the factory interviews you, then produces standardized agent and skill
  files ready to use in Claude Code.


  COMPONENT HIERARCHY
  -------------------

    Command  -->  Agent  -->  Skill  -->  (reads Patterns + Templates)
       |            |           |
   Orchestrates  Decides     Does the    Patterns = reference knowledge
   the pipeline  WHAT/WHY    HOW         Templates = output structure


  WHAT YOU CAN BUILD
  ------------------

    +------------------+  +------------------+  +------------------+
    |      SKILL       |  |      AGENT       |  |     PATTERN      |
    |  A capability    |  |  A role that     |  |  Reference content|
    |  (procedure or   |  |  orchestrates    |  |  (checklist,     |
    |   API wrapper)   |  |  skills          |  |   framework)     |
    +------------------+  +------------------+  +------------------+


  THE TWO PATHS
  =============


  PATH A: GUIDED (recommended for new users)
  -------------------------------------------

    You run:  /build

         |
         v
    +------------------------------+
    | "What do you want to build?" |
    |   - Skill                    |
    |   - Agent                    |
    +------------------------------+
         |
         v
    +------------------------------+
    | "What is the project name?"  |
    |   (output goes to            |
    |    projects/{name}/)         |
    +------------------------------+
         |
         +--- Skill path ---+--- Agent path ---+--- Pattern path ---+
         |                  |                  |                    |
         v                  |                  v                    v
    /create-skill-spec      |             /create-role-design  /create-pattern
    (interviews you about   |             (interviews you about (enhance or create
     what the skill does,   |              the role's mission,  patterns for skills
     inputs, outputs,       |              responsibilities,    or standalone
     procedure steps)       |              tools, skills)       reference content)
         |                  |                  |                    |
         v                  |                  v                    v
    Design artifact         |             Design artifact      projects/{name}/
    to projects/{name}/     |             to projects/{name}/    patterns/
       design-artifacts/    |                design-artifacts/      {domain}/*.md
         |                  |                  |
         v                  |                  v
    /create-skill           |             /create-agent
    (compiles spec into     |             (compiles role into
     SKILL.md + thin        |              agent .md file)
     companion patterns)    |                  |
         |                  |                  |
         v                  |                  v
    projects/{name}/        |             projects/{name}/
       skills/*/SKILL.md    |                agents/{agent}.md
       patterns/*.md        |
         |                  |                  |
         +------------------+------------------+
                            |
                            v
                       DONE! Your
                    files are ready in
                    projects/{name}/


  PATH B: MANUAL (for advanced users)
  ------------------------------------

    Run each skill individually in order:

    Step 1:  /create-skill-spec    or    /create-role-design
             (gather requirements)       (gather requirements)

    Step 2:  /create-skill         or    /create-agent
             (generate files)            (generate files)

    Optional: /create-pattern      (enhance or add patterns anytime)

    Note: You will be asked for project-name at the start of each skill.


  WHERE THINGS LIVE
  -----------------

    This Factory (source of truth)        Your Generated Projects
    +---------------------------------+   +---------------------------+
    | .claude/                        |   | projects/{name}/          |
    |   commands/    (entry points)   |   |   design-artifacts/       |
    |   skills/      (procedures)     |   |   agents/                 |
    |                                 |   |   skills/                 |
    | patterns/      (reference)      |   |   patterns/               |
    | templates/     (structure)      |   +---------------------------+
    | index.json     (registry)       |
    +---------------------------------+


  QUICK REFERENCE
  ---------------

    /build                Start here (guided flow)
    /create-skill-spec    Interview for a new skill
    /create-role-design   Interview for a new agent role
    /create-skill         Generate skill from spec
    /create-agent         Generate agent from role design
    /create-pattern       Create or enhance pattern files
    /how-it-works         Show this guide

    /setup-mcp-cli        Install mcp-cli binary
    /install-mcp-server   Add an MCP server


================================================================================
                   For full details, see README.md and index.json
================================================================================
```
