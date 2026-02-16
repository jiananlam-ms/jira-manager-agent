# Naming Conventions

Standard naming patterns for agents, skills, and documentation in agentic teams.

---

## General Principles

1. **Lowercase with hyphens** - Use `kebab-case` for files and directories
2. **Descriptive** - Names should indicate purpose
3. **Consistent** - Follow same pattern across the project
4. **Concise** - Short but clear (2-4 words typical)

---

## Agents

### Pattern
`{role-name}.md`

### Guidelines
- Name after the role, not the person
- Use singular nouns
- Prefer function over hierarchy

### Good Examples
```
orchestrator.md
content-writer.md
data-analyst.md
code-reviewer.md
policy-checker.md
```

### Avoid
```
ContentWriter.md        # Wrong case
the-orchestrator.md     # Don't use articles
agent-1.md              # Not descriptive
manager.md              # Too generic
senior-analyst.md       # Avoid hierarchy in names
```

---

## Skills

### Pattern
`{skill-name}/SKILL.md`

Directory contains skill and references.

### Guidelines
- Name describes the knowledge or capability
- Group related skills under category directories
- Use nouns or noun phrases

### Good Examples
```
skills/
├── style-guide/SKILL.md
├── seo-guidelines/SKILL.md
├── content-review/SKILL.md
├── api-reference/SKILL.md
└── quality-rubric/SKILL.md
```

### With Categories
```
skills/
├── knowledge/
│   ├── domain-knowledge/SKILL.md
│   └── policy-guide/SKILL.md
├── workflows/
│   ├── creation-workflow/SKILL.md
│   └── review-workflow/SKILL.md
└── evaluation/
    └── quality-rubric/SKILL.md
```

### Avoid
```
styleGuide/SKILL.md     # Wrong case
my-skill/SKILL.md       # Not descriptive
skill1/SKILL.md         # Not descriptive
the-guide/SKILL.md      # Don't use articles
```

---

## Documentation

### Pattern
`{topic}.md`

### Standard Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Quick start and overview |
| `domain-brief.md` | Domain context and constraints |
| `team-manifest.md` | Roles and skills summary |
| `workflows.md` | Workflow documentation |
| `evaluation.md` | Evaluation plan |
| `governance.md` | Safety and permissions |
| `glossary.md` | Terminology definitions |

### Good Examples
```
docs/
├── domain-brief.md
├── team-manifest.md
├── workflows.md
├── evaluation.md
├── governance.md
└── glossary.md
```

### Avoid
```
DOMAIN-BRIEF.md         # Don't use all caps (except README)
DomainBrief.md          # Wrong case
docs.md                 # Not specific
misc.md                 # Not specific
```

---

## Directories

### Guidelines
- Use plural for collections
- Use singular for single-purpose
- Group related items

### Standard Structure
```
project/
├── .claude/
│   ├── agents/         # Plural - collection of agents
│   └── skills/         # Plural - collection of skills
├── docs/               # Plural - collection of docs
└── tests/              # Plural - collection of tests
```

### Skill References
```
skills/
└── style-guide/
    ├── SKILL.md
    └── references/     # Plural - multiple reference files
        ├── examples.md
        └── templates/  # Plural - multiple templates
```

---

## Project Names

### Pattern
`{domain}-{type}` or `{descriptive-name}`

### Guidelines
- Describe what the team does
- Keep it short (2-4 words)
- Use lowercase with hyphens

### Good Examples
```
content-production-team
analytics-automation
customer-support-agent
code-review-system
```

### Avoid
```
ContentTeam             # Wrong case
my-project              # Not descriptive
team1                   # Not descriptive
the-best-team-ever      # Unprofessional
```

---

## Cross-References

When referencing other files, use relative paths:

### In Agents
```markdown
## Skills
This agent uses:
- [Style Guide](../skills/style-guide/SKILL.md)
- [Content Review](../skills/content-review/SKILL.md)
```

### In Skills
```markdown
See also: [Quality Rubric](../evaluation/quality-rubric/SKILL.md)
```

---

## Versioning in Names

Generally avoid versions in names. Use git for versioning.

### Exception: Major Incompatible Versions
```
skills/
├── api-v1/SKILL.md
└── api-v2/SKILL.md
```

Only when both versions must coexist and are incompatible.

---

## Abbreviations

### Acceptable Common Abbreviations
- `api` - Application Programming Interface
- `seo` - Search Engine Optimization
- `qa` - Quality Assurance
- `cms` - Content Management System
- `cli` - Command Line Interface

### Avoid Domain-Specific Abbreviations
Use full words unless universally understood in the domain.

```
# Good
customer-lifetime-value/SKILL.md

# Bad (unclear)
clv/SKILL.md
```

---

## Summary Checklist

- [ ] All file names are lowercase with hyphens
- [ ] Agent names are role-based nouns
- [ ] Skill names describe the knowledge/capability
- [ ] Documentation follows standard naming
- [ ] Directories use plural for collections
- [ ] No abbreviations unless universal
- [ ] Cross-references use relative paths

---

## Application Notes

This pattern is referenced by:
- `create-agent` skill — applies naming conventions when generating agent files
- `create-role-design` skill — validates role names against conventions
- `create-skill` skill — applies naming conventions when generating skill files
