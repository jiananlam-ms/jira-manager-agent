---
name: jira-ticket-intake
type: workflow
description: Parses PRDs, briefs, or requirements documents and generates structured JIRA ticket hierarchies (Epic → Stories → Subtasks). Use when a user shares a document and wants tickets auto-generated from it. Works with the jira-ticket-creation skill for the actual creation.
---

# JIRA Ticket Intake

This skill guides Claude in parsing requirements documents and converting them into structured JIRA ticket hierarchies.

It focuses on **understanding documents and extracting ticket structure**, not on the mechanics of creating tickets (that's `jira-ticket-creation`), querying the board (that's `jira-board-query`), or updating tickets (that's `jira-ticket-update`).

---

## Purpose

Use this skill to:

- Parse a PRD, brief, or requirements document into a structured ticket hierarchy
- Extract epic themes, story groupings, and subtask breakdowns from unstructured text
- Determine whether to create a new epic or add to an existing one
- Generate a complete preview table for user approval before creation

This skill is intended to feed into:

- `jira-ticket-creation` skill for the actual ticket creation (Epic → Stories → Subtasks)
- `jira-board-manager` agent as the intake pipeline for document-to-ticket conversion

---

## Applicability

### When to use this skill

Trigger this skill when:

- User shares a PRD, brief, requirements doc, or any structured/unstructured document and wants tickets created from it
- User says "create tickets from this", "parse this into tickets", "here's the PRD"
- User pastes or references a document and expects a ticket breakdown

Common trigger phrases: "here's the PRD", "create tickets from this doc", "break this into JIRA tickets", "parse this brief".

### When not to use this skill

Avoid using this skill when:

- User already has a clear ticket structure in mind (use `jira-ticket-creation` directly)
- User wants to query or audit the board (use `jira-board-query`)
- User wants to update existing tickets (use `jira-ticket-update`)

---

## Dependencies

This skill relies on:

- `jira-ticket-creation` skill — for the actual ticket creation after parsing
- `mcp__ms_jira_mcp__Get_Epic` — to check for existing epics when adding to an existing initiative
- `mcp__ms_jira_mcp__Get_Stories` — to check existing stories under an epic to avoid duplicates

---

## Team Member Directory

When assigning tickets, resolve display names to JIRA account IDs:

| Display Name | Account ID |
|-------------|------------|
| Jian An Lam | `712020:2c69d3c5-729e-44b2-9bf3-29e93382f899` |
| Muhammad Tayyab | `62e769b832850ea2a3237b7a` |
| Muhammad Ali | `557058:33bfe2fd-6b7f-4cc3-8abf-e20e8b109fd3` |
| Haseeb Ahmad | `712020:7e204e9c-8c07-4615-8930-142f6a198535` |

---

## Inputs

### From the User

- **Document:** A PRD, brief, requirements doc, or description — provided as:
  - Pasted text in the conversation
  - A file path to read
  - A URL to fetch
- **Target:** (Optional) An existing epic key to add stories/subtasks to, instead of creating a new epic
- **Assignee hints:** (Optional) Who should own which parts of the work

### Missing Input Handling

- **Required:** At least a document or description to parse. Cannot proceed without content.
- **Optional:** Target epic, assignee hints, hierarchy depth constraints.
- If the document is too vague to extract meaningful tickets, ask the user for clarification before proceeding.

---

## Outputs

### Output Type

In-Memory Data

### Primary Output

- **Description:** Structured ticket hierarchy extracted from the document, presented as a preview table
- **Format:** Markdown preview table ready for user approval, then handed off to `jira-ticket-creation`

### Downstream Usage

- `jira-ticket-creation` skill: Receives the approved hierarchy for creation
- User: Reviews and approves the proposed structure before any tickets are created

---

## Procedure

Claude should follow this procedure when using this skill.

### Phase 1: Document Ingestion (1.1-1.2)

#### 1.1 Read the document

Accept the input in any of these forms:
- **Pasted text:** Use directly
- **File path:** Read the file using the Read tool
- **URL:** Fetch the content using WebFetch

If the document is very long (>2000 lines), summarize sections first and confirm scope with the user.

#### 1.2 Identify document type

Classify the input:
- **Structured PRD:** Has clear sections (Overview, Requirements, User Stories, etc.)
- **Brief:** Short description of an initiative or feature
- **Meeting notes / brainstorm:** Unstructured ideas that need organizing
- **Feature list:** Bullet points of features or tasks

This classification affects how aggressively to decompose in Phase 2.

**Output of Phase 1:** Document content loaded and classified.

### Phase 2: Requirement Extraction (2.1-2.4)

#### 2.1 Extract the epic theme

Identify the overarching initiative or project from the document:
- **Title:** What is this initiative called?
- **Description:** 2-3 sentence summary of the initiative's purpose and scope
- **Scope boundaries:** What's in scope vs out of scope?

If the user provided a target epic key, skip epic creation — use the existing epic instead. Fetch the existing epic and its stories using `Get_Epic` and `Get_Stories` to understand what already exists.

#### 2.2 Extract story groupings

Break the document into logical story groupings. Look for:
- **Sections or headings** in the document → each becomes a story
- **Functional areas** (frontend, backend, API, data) → each becomes a story
- **Phases or milestones** → each becomes a story
- **User-facing features** → each becomes a story

For each story, extract:
- **Title:** Concise, action-oriented
- **Description:** Scope and acceptance criteria derived from the document
- **Estimate:** Based on complexity (see `jira-ticket-creation` Phase 1.5 for estimation rules)

#### 2.3 Extract subtasks

Within each story, identify individual implementation tasks:
- **Technical steps** mentioned in the document
- **Sub-features** within a larger feature
- **Setup, build, test, deploy** phases of a story

For each subtask, extract:
- **Title:** Specific, actionable task
- **Description:** What needs to be done
- **Estimate:** Hours based on complexity

#### 2.4 Apply mandatory ticket rules

Follow the same mandatory ticket rules as `jira-ticket-creation` (Phase 1.3):

**Every epic MUST include these mandatory stories:**
1. `📃 | Internal Working Doc`
2. `♻️ | Product Requirements Doc`

**If the initiative involves building an agent**, add the agent story with 6 mandatory subtasks (see `jira-ticket-creation` Phase 1.3 for the full list).

**Check for duplicates:** If adding to an existing epic, compare proposed stories against existing ones. Skip any that already exist and note them.

**Output of Phase 2:** Complete hierarchy extracted from the document.

### Phase 3: Assignee Resolution (3.1)

#### 3.1 Determine assignees

Assign team members based on:

1. **Explicit mentions in the document** — if the PRD names someone, use that
2. **User hints** — if the user specified who should own what
3. **Domain matching** — match work areas to team expertise based on existing ticket patterns
4. **Ask the user** — if unclear, present the hierarchy and ask who should own each story

Resolve all names to account IDs using the Team Member Directory.

**Output of Phase 3:** Hierarchy with assignees resolved.

### Phase 4: Preview and Handoff (4.1-4.3)

#### 4.1 Generate preview table

Present the full proposed hierarchy:

```
## Proposed Ticket Structure

**Source:** {document name or "User-provided brief"}

| Level | Title | Description | Estimate | Assignee | Parent |
|-------|-------|-------------|----------|----------|--------|
| Epic | [Initiative Name] | [Description] | {sum} | [Assignee] | — |
| Story | 📃 \| Internal Working Doc | Internal documentation | — | [Assignee] | Epic |
| Story | ♻️ \| Product Requirements Doc | PRD documentation | — | [Assignee] | Epic |
| Story | [Story 1] | [Description] | 35h | [Assignee] | Epic |
| Subtask | [Subtask 1a] | [Description] | 17.5h | [Assignee] | Story 1 |
| Subtask | [Subtask 1b] | [Description] | 17.5h | [Assignee] | Story 1 |
| Story | [Story 2] | [Description] | 20h | [Assignee] | Epic |
```

If adding to an existing epic, show:
- **Existing:** tickets that already exist (greyed out / marked as "exists")
- **New:** tickets to be created

#### 4.2 Present for approval

Ask the user:
- "Here is the proposed ticket structure parsed from your document. Please review and approve, or let me know what changes you'd like."

#### 4.3 Handle revisions

If the user requests changes:
- Apply modifications
- Regenerate preview
- Re-present for approval
- Repeat until approved

**Output of Phase 4:** User-approved ticket hierarchy.

### Phase 5: Create Tickets (5.1)

#### 5.1 Execute creation

Once approved, create all tickets following the `jira-ticket-creation` procedure (Phase 3):

1. **Create Epic** (or skip if using existing epic)
2. **Create Stories** using the epic key — can be parallelized
3. **Create Subtasks** using story keys — can be parallelized

Follow strict parent-before-child ordering. Use only API-returned keys.

Present the post-creation summary with the full hierarchy and ticket keys.

**Output of Phase 5:** All tickets created with JIRA keys.

---

## Failure Modes and Corrections

1. **Over-decomposition (Domain)**
   - Symptom: 30 subtasks for a simple feature — too granular
   - Fix: Match decomposition depth to document complexity. A short brief → fewer stories. A detailed PRD → more stories/subtasks. When in doubt, keep it simpler and let the user ask for more detail.

2. **Under-decomposition (Domain)**
   - Symptom: A complex PRD reduced to just an epic and 2 stories
   - Fix: Look for distinct functional areas, phases, or user-facing features. Each should be its own story. If the document has sections, each section is likely a story.

3. **Ignoring document structure (Execution)**
   - Symptom: Ignoring headings, sections, or bullet points in the PRD and imposing an arbitrary structure
   - Fix: Respect the document's own organization. If it has clear sections, use those as story boundaries.

4. **Duplicate tickets when adding to existing epic (Execution)**
   - Symptom: Creating stories that already exist under the epic
   - Fix: Always fetch existing stories when adding to an existing epic. Compare titles and skip duplicates.

5. **Missing assignees (Domain)**
   - Symptom: All tickets created without assignees
   - Fix: Try to resolve from document mentions or user hints first. If still unclear, ask before creating.

6. **Vague descriptions (Domain)**
   - Symptom: Ticket descriptions say "TBD" or repeat the title
   - Fix: Extract actual scope and acceptance criteria from the document. If the document doesn't have enough detail for a section, ask the user to clarify that section.

---

## Safety and Constraints

When using this skill:

- **Do NOT** create tickets without presenting a preview table and getting user approval
- **Do NOT** ignore the document's own structure — use its sections and headings as guides
- **Do NOT** create duplicate stories when adding to an existing epic
- **Do NOT** skip mandatory stories (Internal Working Doc, Product Requirements Doc)
- **Do NOT** leave descriptions empty — extract from the document or ask the user
- **ALWAYS** classify the document type before decomposing
- **ALWAYS** check for existing stories when adding to an existing epic
- **ALWAYS** present a preview table with the full hierarchy before creation
- **ALWAYS** follow strict creation order: Epic → Stories → Subtasks
- **ALWAYS** resolve assignees from the Team Member Directory
- **PREFER** respecting the document's own structure over imposing an arbitrary one
- **PREFER** asking for clarification over guessing when the document is vague

This skill's purpose is to bridge the gap between requirements documents and JIRA tickets — turning unstructured plans into structured, actionable work items with full user control.
