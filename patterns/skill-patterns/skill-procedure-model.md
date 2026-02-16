# Skill Procedure Model

This pattern defines how to write procedure steps in skill files. It ensures skills teach methodology (HOW to think) rather than embedding template structure (WHAT to write).

---

## Core Principle: Separation of Concerns

Skills and templates have distinct responsibilities:

| Component | Owns | Does NOT Own |
|-----------|------|--------------|
| **Skill** | Methodology, reasoning guidance, context gathering, decision-making | Structure, sections, placeholders |
| **Template** | Structure, sections, fields, placeholders | Methodology, reasoning guidance |

**From CLAUDE.md Critical Constraints:** "Reference templates by path, never embed structure"

> Template defines: Structure, sections, fields, placeholders.
> Template is source of truth for structure and semantics.

---

## The Three-Layer Procedure Model

Each procedural step in a skill should have three layers:

| Layer | Purpose | Questions to Answer |
|-------|---------|---------------------|
| **Gather** | What context/inputs to collect for THIS step | What files to read? What upstream artifacts to reference? What patterns to consult? |
| **Reason** | How to think through THIS specific decision | What questions to ask? What trade-offs to consider? What criteria to apply? |
| **Document** | Reference template for structure | Which template section? How does reasoning map to fields? |

### Why This Model Works

1. **Gather** ensures the agent has the right inputs before reasoning
2. **Reason** teaches the agent HOW to think, not just what to produce
3. **Document** delegates structure to the template (single source of truth)

---

## Correct Pattern Example

```markdown
#### 5.6 Reason through and document the skill header

**Gather context:**
- Review the skill specification from skill-spec artifact
- Check `patterns/skill-patterns/skill-type-taxonomy.md` for how skills of this type frame their purpose

**Reason through:**
- What is the ONE thing this skill teaches an agent to do?
- How would you explain this skill's focus in 10 words?
- What does this skill explicitly NOT cover? (prevents scope creep)
- Does the focus align with the skill type from the taxonomy?

**Document:**
- Read `templates/create-skill-template.md` header section
- Populate the header following the template structure
- Verify the "not on" clause creates clear boundaries
```

### What Makes This Correct

1. **References** template instead of embedding it
2. **Connects** reasoning phases to template sections
3. **Delegates** structure to template
4. **Teaches** what reasoning to apply, not what structure to produce

---

## Anti-Pattern Example

```markdown
#### 5.6 Write skill header

```markdown
# Skill: {skill-name}

This skill guides Claude in {primary purpose}.

It focuses on **{main focus}**, not on {what it doesn't do}.
```
```

### Why This Is Wrong

1. **Duplication** - Structure exists in both skill and template
2. **Drift risk** - Template changes don't propagate to skill
3. **Missing methodology** - No guidance on HOW to think, just WHAT to write
4. **Conflation** - Skill acts as both methodology AND template

An agent following this anti-pattern has no guidance on HOW to determine the primary purpose or main focus. It only knows the shape of the output.

---

## Layer Guidelines

### Gather Layer

The Gather layer should be **specific to this step**, not generic.

**Good:**
```markdown
**Gather context:**
- Review the skill specification's purpose statement from skill-spec artifact
- Check how related skills in the team define their focus
```

**Bad:**
```markdown
**Gather context:**
- Read the relevant files
- Get the needed information
```

### Reason Layer

The Reason layer should ask **questions that teach thinking**, derived from template field semantics.

**Good:**
```markdown
**Reason through:**
- What is the ONE primary purpose this skill serves? (Express in 10 words or fewer)
- What does this skill explicitly NOT cover? (This creates clear boundaries)
- Does the focus statement align with the skill type from the taxonomy?
```

**Bad:**
```markdown
**Reason through:**
- Figure out what to write
- Make sure it's correct
```

### Document Layer

The Document layer should **always reference the template**, never embed structure.

**Good:**
```markdown
**Document:**
- Read `templates/create-skill-template.md` header section
- Populate following the template structure exactly
- Verify the "not on" clause creates clear boundaries
```

**Bad:**
```markdown
**Document:**
Write the following structure:
```markdown
# Skill: {name}
...
```
```

---

## When to Use This Model

Use the three-layer model for procedure steps that:

- Produce output that maps to a template section
- Require reasoning or judgment (not mechanical copying)
- Could benefit from explicit context gathering

You may use simpler steps for:

- Validation checks (pass/fail with clear criteria)
- Direct file operations (read X, write to Y)
- Mechanical transformations (kebab-case conversion, etc.)

---

## Validation Checklist

When writing or reviewing skill procedure sections, verify:

- [ ] No code blocks with `{meta-variables}` in procedure steps
- [ ] Each substantive step has Gather/Reason/Document layers
- [ ] Template is referenced by path, not duplicated
- [ ] Reasoning guidance is specific to the step, not generic
- [ ] Questions in Reason layer teach HOW to think
- [ ] Document layer names specific template sections
- [ ] Template contains all structure needed for the skill's output

---

## Integration with Skills

Skills that create artifacts should:

1. **Reference this pattern** in their Dependencies section
2. **Follow this model** in their Procedure section
3. **Validate against the checklist** before finalizing

Example dependency reference:
```markdown
## 3. Dependencies

- `patterns/skill-patterns/skill-procedure-model.md` - Three-layer procedure model
- `templates/create-X-template.md` - Output structure (source of truth)
```

---

## Application Notes

This pattern is referenced by:
- `create-skill` skill — applies the three-layer procedure model when generating skill procedures

## Related Principles

- CLAUDE.md: Separation of Concerns (agents own WHAT/WHY, skills own HOW)
- CLAUDE.md: Critical Constraints (don't put procedures in agent behaviors)
- CLAUDE.md: Critical Constraints (reference templates by path, never embed structure)
