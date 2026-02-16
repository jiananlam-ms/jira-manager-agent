---
name: structured-reasoning
type: workflow
description: Define and enforce the universal reasoning structure for all Agents. Establishes the analysis → reasoning → decision tag model, nesting rules for agent-specific tags, and tool-call discipline. Use when agent or skill performs non-trivial decisions, designs, or multi-step reasoning.
---

# Skill: structured-reasoning

## 1. Purpose

This skill enforces a consistent, explicit chain-of-thought structure for all Agents.

It defines:
- The universal reasoning shell tags that every agent must use.
- Minimum standards for visibility, structure, and correctness of reasoning.

The structured-reasoning skill is the global enforcement layer that all agents and complex skills must respect.

## 2. Applicability

This skill applies to:

- Any new agent generated that:
    - Makes non-trivial decisions.
    - Designs structures, workflows, or evaluation plans.
    - Performs multi-step reasoning.


## 3. Dependencies

This skill has no external dependecies.


## 4. Universal Chain-of-Thought Tags
These tags form the required outer shell for all structured reasoning.

| Tag | Purpose | Example Usage |
|-----|---------|---------------|
| `<analysis>` | Initial understanding of inputs and context | Understanding a domain brief before designing a team |
| `<reasoning>` | Explaining decision-making process | Why a particular role structure was chosen |
| `<decision>` | Final output or conclusion | The actual team manifest or agent spec |

### 4.1 Optional Support Tags

These may appear inside `<analysis>` or `<reasoning>`, or as separate blocks when explicitly recommended.

| Tag | Purpose | Example Usage |
|-----|---------|---------------|
| `<alternatives>` | Options considered but not selected | Other team topologies that were rejected |
| `<assumptions>` | Explicit assumptions when info incomplete | Assumed compliance requirements when not specified |
| `<open_questions>` | Unresolved issues for follow-up | Questions for the user or downstream agents |
| `<constraints>` | Identified limitations and boundaries | Budget, timeline, or regulatory constraints |

### 4.2 Required Structure

Every non-trivial factory response MUST contain, at minimum:

1. One `<analysis>` block (appears first)
2. One `<reasoning>` block (follows analysis)
3. One `<decision>` block (appears last)

The final artifact (brief, plan, blueprint, manifest, evaluation plan, etc.) MUST be contained inside `<decision>`.


## 5. Tool-Call Discipline

This skill does not ban tools before tags, but it enforces a clear relationship between reasoning and tool use.

Rules:

1) Tag backbone:
   - For non-trivial tasks, the agent MUST anchor its response in the universal tags.
   - This means:
     - `<analysis>, <reasoning>, <decision>` must be clearly present and correctly closed.

2) Interleaving tools and reasoning:
   - The agent SHOULD:
     - Begin `<analysis>` by summarising the input goal, context, and known constraints.
     - Optionally note what information it needs to fetch (files, web, etc.).
     - Use tools (Read, WebSearch, WebFetch, etc.) to gather additional information.
     - Reflect the results of those tools back into `<analysis>` or `<reasoning>`.
   - The key constraint is:
     - All tool-driven insights must be incorporated explicitly into the tagged reasoning structure, not left implicit.

3) No reasoning outside tags:
   - Substantive reasoning MUST appear inside `<analysis>` or `<reasoning>`.
   - Free-floating, untagged reasoning paragraphs are not allowed.
   - Unstructured commentary outside tags should be avoided; if needed at all, it must be clearly non-reasoning (for example, minimal operational notes to the orchestrator).

4) Decision stability:
   - Once `<decision>` is written, the agent should not introduce new reasoning outside of it.
   - If the agent needs to revise its decision, it should:
     - Recompute `<analysis>` and `<reasoning>` as needed.
     - Rewrite `<decision>` to match the updated reasoning.


## 6. Failure Modes and Corrections

Common failure modes:

1) Missing universal shells:
   - Problem:
     - Response lacks `<analysis>`, `<reasoning>`, or `<decision>`.
   - Correction:
     - Rewrite the response, ensuring all three tags are present in order.

2) Reasoning outside tags:
   - Problem:
     - Large blocks of reasoning text appear outside `<analysis>` or `<reasoning>`.
   - Correction:
     - Wrap all substantive reasoning inside the appropriate tags.
     - Leave only minimal non-reasoning content outside tags if absolutely necessary.

3) Decision not matching reasoning:
   - Problem:
     - The artifact in `<decision>` contradicts what `<reasoning>` concluded.
   - Correction:
     - Either adjust `<decision>` to reflect the actual reasoning, or update `<reasoning>` and `<analysis>` to capture any new considerations.


## 7. Self-Check Questions

Ask yourself before proceeding:

1. Did I start my response with an XML tag?
2. Are all required tags present?
3. Does each tag have all its specified sections?
4. Is each tag properly closed (once)?

If any answer is "no", fix it before continuing.


## 8. Summary of Obligations

Any agent or skill using structured-reasoning MUST:

- Use `<analysis>`, `<reasoning>`, and `<decision>` in that order.
- Place final artifacts and verdicts inside `<decision>`.
- Reflect tool-driven insights inside tagged reasoning, not outside.
- Avoid creating ad-hoc tag structures that are inconsistent with the pattern file.

This skill ensures that, across the agents, all reasoning is explicit, inspectable, and structurally consistent, while allowing each agent and skill to use specialised tags appropriate to its domain.
