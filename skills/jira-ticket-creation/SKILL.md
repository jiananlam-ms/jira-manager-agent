---
name: jira-ticket-creation
type: workflow
description: Creates JIRA ticket hierarchies (Epic → Stories → Subtasks) from feature descriptions with preview approval. Use when a user provides a feature description and needs JIRA tickets created; when decomposing requirements into structured ticket hierarchies; or when creating epics with associated stories and subtasks.
---

# JIRA Ticket Creation

This skill guides Claude in creating structured JIRA ticket hierarchies from user requirements.

It focuses on **decomposing requirements into Epic → Stories → Subtasks and creating them in strict order**, not on querying board state or auditing existing tickets (that's the `jira-board-query` skill).

---

## Purpose

Use this skill to:

- Analyze feature descriptions and decompose them into Epic → Stories → Subtasks hierarchies
- Generate preview tables of proposed tickets for user approval before creation
- Create tickets in strict hierarchical order using JIRA MCP tools
- Produce post-creation summaries with complete hierarchy and ticket keys

This skill is intended to feed into:

- `jira-board-manager` agent as the primary skill for ticket creation operations

---

## Applicability

### When to use this skill

Trigger this skill when:

- User provides a feature description, initiative, or set of requirements and wants JIRA tickets created
- User explicitly asks to create an epic, stories, or subtasks
- User wants to structure work items into a JIRA ticket hierarchy

Common trigger phrases: "Create tickets for...", "Set up a JIRA epic for...", "Break this feature into stories and subtasks...".

### When not to use this skill

Avoid using this skill when:

- User wants to query or audit the board (use `jira-board-query`)
- User wants to modify, delete, or update existing tickets (out of scope)
- User wants to assign priorities or team members to tickets (out of scope)

In those cases, use `jira-board-query` for board queries, or direct the user to JIRA for ticket modifications.

---

## Dependencies

This skill relies on:

- `mcp__ms_jira_mcp__Create_Epic` — MCP tool for creating epics
- `mcp__ms_jira_mcp__Create_Stories` — MCP tool for creating stories under an epic
- `mcp__ms_jira_mcp__Create_Subtasks` — MCP tool for creating subtasks under a story

---

## Team Member Directory

When assigning tickets, resolve display names to JIRA account IDs using this lookup table:

| Display Name | Account ID |
|-------------|------------|
| Jian An Lam | `712020:2c69d3c5-729e-44b2-9bf3-29e93382f899` |
| Muhammad Tayyab | `62e769b832850ea2a3237b7a` |
| Muhammad Ali | `557058:33bfe2fd-6b7f-4cc3-8abf-e20e8b109fd3` |
| Haseeb Ahmad | `712020:7e204e9c-8c07-4615-8930-142f6a198535` |

When the user mentions a team member by name (full name, first name, or partial match), resolve to the corresponding `accountId` above. If the name doesn't match anyone in the table, prompt the user to clarify.

---

## Inputs

### From the Input Envelope

- **From `goal`:**
  - The feature description, initiative, or requirements to decompose into tickets
  - May be a high-level description ("authentication overhaul") or a detailed breakdown

- **From `context`:**
  - Project background or domain context that informs ticket titles and descriptions
  - Conventions for ticket naming (if any)

- **From `constraints`:**
  - Maximum hierarchy depth (e.g., "epic and stories only, no subtasks")
  - Specific title or description formatting requirements

- **From `upstream`:**
  - Requirements documents, design specs, or prior conversation context

- **From `extra`:**
  - Reference to similar existing tickets for style guidance
  - Additional details about story or subtask breakdown

### From the File System

No file system inputs required — this skill operates entirely through MCP tools and user interaction.

### Missing Input Handling

- **Required inputs:** Feature description or requirements (at minimum a brief description of what to create). Cannot proceed without this.
- **Optional inputs:** Naming conventions, hierarchy depth constraints (default: full Epic → Stories → Subtasks)
- **Document assumptions in:** The preview table presented to the user for approval

---

## Outputs

### Output Type

In-Memory Data

### Primary Output

- **Description:** Created JIRA tickets with a complete hierarchy summary
- **Format:** Markdown tables (preview before creation, summary after creation)

### Downstream Usage

- `jira-board-manager` agent: Receives the creation results to present to the user
- User: Reviews preview table for approval, receives summary with ticket keys for reference

---

## Procedure

Claude should follow this procedure when using this skill.

### Phase 1: Requirement Analysis (1.1-1.3)

#### 1.1 Parse the user's requirements

Extract from the user's input:
- The overarching theme or initiative (this becomes the Epic)
- Functional groupings of work (these become Stories)
- Implementation steps or tasks within each grouping (these become Subtasks)

If the input is a high-level description, propose a logical decomposition. If the input is already structured, validate the hierarchy.

#### 1.2 Determine hierarchy depth

Check if constraints specify a maximum depth:
- **Full depth (default):** Epic → Stories → Subtasks
- **Shallow:** Epic → Stories only (no subtasks)
- **Single level:** Epic only

#### 1.3 Apply mandatory ticket rules

Every epic MUST include these mandatory stories (in addition to any project-specific stories):

| # | Mandatory Story Title | Purpose |
|---|----------------------|---------|
| 1 | 📃 \| Internal Working Doc | Internal documentation for the initiative |
| 2 | ♻️ \| Product Requirements Doc | Product requirements documentation |

If the initiative involves building an agent, also add an agent story and its mandatory subtasks:

**Agent Story:**
- Title format: `🤖 | {Agent Name} Agent` (replace `{Agent Name}` with the actual agent name)

**Mandatory Agent Subtasks** (always create all 6 under the agent story):

| # | Subtask Title |
|---|--------------|
| 1 | ⚙️ \| Initial Setup and Data Ingestion |
| 2 | ⚙️ \| Main Workflow Development |
| 3 | ⚙️ \| Tool Setup and Development |
| 4 | ⚙️ \| Prompt Generation and Refinement |
| 5 | ⚙️ \| Error Handling and Fallback Mechanisms |
| 6 | ⚙️ \| Internal Testing and Deployment |

**How to determine if an initiative involves an agent:** Look for keywords like "agent", "bot", "chatbot", "AI assistant", "automated workflow", or any description that implies building an autonomous AI system. If unclear, ask the user.

#### 1.4 Draft the ticket structure

For each ticket in the hierarchy (including mandatory stories and subtasks from step 1.3), draft:
- **Title:** Concise, action-oriented (e.g., "Implement user login API endpoint")
- **Description:** 1-3 sentences describing the scope and acceptance criteria. Derive from the provided doc or feature description. If there is not enough information to write a meaningful description, prompt the user to clarify before proceeding.
- **Original Estimate:** Time estimate in hours based on the complexity rules below
- **Assignee:** Team member to assign the ticket to. Resolve names to account IDs using the Team Member Directory.

#### 1.5 Estimate original time

For each ticket, determine the original estimate using this priority order:

**Priority 1 — Use the source document.** If the provided doc or description includes explicit time estimates, hours, or effort figures, use those as the source of truth.

**Priority 2 — Apply complexity guidance.** If no explicit estimates are provided, infer complexity from the available context and apply these tiers:

| Complexity | Guideline | Estimate |
|------------|-----------|----------|
| **Simple** | Straightforward, well-understood, minimal unknowns | ~17.5 hours |
| **Medium** | Moderate complexity, some unknowns, typical agent setup work | ~35 hours |
| **Difficult** | High complexity, significant unknowns, cross-cutting concerns | ~70 hours |

These are rough estimates — no need to be super accurate. Judge complexity based on scope, unknowns, and technical difficulty.

**Priority 3 — Prompt the user.** If there is not enough information in the doc or context to judge complexity, prompt the user for clarification before assigning an estimate.

**Time format normalization:** JIRA only accepts estimates in the format `{number}h` (e.g., `20h`, `35h`). The user or source document may provide estimates in various formats. Always normalize to JIRA format before passing to the API:

| User Input | Normalized |
|-----------|------------|
| `20hr`, `20hrs`, `20 hours` | `20h` |
| `2d`, `2 days` | `16h` (1 day = 8h) |
| `1w`, `1 week` | `40h` (1 week = 40h) |
| `3.5h`, `3.5 hours` | `3.5h` |
| `20` (bare number) | `20h` (assume hours) |

For **Epics:** Estimate is the sum of its child stories (do not set separately).
For **Stories:** Estimate based on the story's overall complexity.
For **Subtasks:** Estimate based on the individual task. Subtask estimates should sum to approximately the parent story's estimate.

**Output of Phase 1:** Complete draft hierarchy with titles, descriptions, and original estimates for all tickets.

### Phase 2: Preview and Approval (2.1-2.3)

#### 2.1 Generate preview table

Build a markdown table with the following columns:

| Level | Title | Description | Estimate | Assignee | Labels | Start Date | Due Date | Parent |
|-------|-------|-------------|----------|----------|--------|------------|----------|--------|
| Epic | {epic title} | {epic description} | {sum of stories} | {assignee} | {label} | {start} | {due} | — |
| Story | {story title} | {story description} | {estimate} | {assignee} | {label} | {start} | {due} | {epic title} |
| Subtask | {subtask title} | {subtask description} | {estimate} | {assignee} | {label} | {start} | {due} | {story title} |

Include ALL proposed tickets in the table. Labels default to `not-started` if not specified. Start date and due date are optional — omit if not provided by the user.

#### 2.2 Present for approval

Present the preview table to the user with a clear prompt:
- "Here is the proposed ticket structure. Please review and approve, or let me know what changes you'd like."

#### 2.3 Handle revision requests

If the user requests changes:
- Apply the requested modifications
- Regenerate the preview table
- Re-present for approval
- Repeat until the user explicitly approves

**Output of Phase 2:** User-approved ticket hierarchy.

### Phase 3: Hierarchical Creation (3.1-3.3)

#### 3.1 Create the Epic

Use `mcp__ms_jira_mcp__Create_Epic` with:
- `title`: The approved epic title
- `description`: The approved epic description
- `original_estimate`: The approved estimate (e.g., `"35h"`)
- `assignee_id`: The account ID resolved from the Team Member Directory
- `labels`: Label value (default: `"not-started"` if not specified)
- `start_date`: ISO date `YYYY-MM-DD` (optional — omit if not provided)
- `due_date`: ISO date `YYYY-MM-DD` (optional — omit if not provided)
- `status`: Leave empty `""` — JIRA assigns the default status (Backlog) on creation

Capture the returned `key` as `epic_key`. This key is required for all subsequent story creation.

#### 3.2 Create Stories

For each approved story, use `mcp__ms_jira_mcp__Create_Stories` with:
- `title`: The approved story title
- `description`: The approved story description
- `epic_key`: The `epic_key` captured in step 3.1
- `original_estimate`: The approved estimate (e.g., `"35h"`)
- `assignee_id`: The account ID resolved from the Team Member Directory
- `labels`: Label value (default: `"not-started"` if not specified)
- `start_date`: ISO date `YYYY-MM-DD` (optional — omit if not provided)
- `due_date`: ISO date `YYYY-MM-DD` (optional — omit if not provided)
- `status`: Leave empty `""` — JIRA assigns the default status (Backlog) on creation

Capture each returned `key` as `story_key`. Stories under the same epic can be created in parallel.

#### 3.3 Create Subtasks

For each approved subtask, use `mcp__ms_jira_mcp__Create_Subtasks` with:
- `title`: The approved subtask title
- `description`: The approved subtask description
- `story_key`: The `story_key` of its parent story from step 3.2
- `original_estimate`: The approved estimate (e.g., `"17.5h"`)
- `assignee_id`: The account ID resolved from the Team Member Directory
- `labels`: Label value (default: `"not-started"` if not specified)
- `start_date`: ISO date `YYYY-MM-DD` (optional — omit if not provided)
- `due_date`: ISO date `YYYY-MM-DD` (optional — omit if not provided)
- `status`: Leave empty `""` — JIRA assigns the default status (Backlog) on creation

Subtasks across different stories can be created in parallel. Subtasks under the same story can also be created in parallel.

**CRITICAL:** Never proceed to step 3.2 before 3.1 completes. Never proceed to step 3.3 before 3.2 completes for the relevant parent story.

**Output of Phase 3:** All tickets created with actual JIRA keys.

### Phase 4: Post-Creation Summary (4.1)

#### 4.1 Generate summary

Build a summary showing the complete hierarchy with actual ticket keys:

```
Epic: [EPIC_KEY] — {epic title}
├── Story: [STORY_KEY_1] — {story title}
│   ├── Subtask: [SUB_KEY_1] — {subtask title}
│   └── Subtask: [SUB_KEY_2] — {subtask title}
└── Story: [STORY_KEY_2] — {story title}
    └── Subtask: [SUB_KEY_3] — {subtask title}
```

Confirm all tickets were created successfully by verifying each API call returned a key.

**Output of Phase 4:** Complete hierarchy summary with ticket keys.

---

## Failure Modes and Corrections

1. **Skipping the preview table (Execution)**
   - Symptom: Jumping directly to JIRA API calls without presenting proposed tickets
   - Fix: Always generate and present the preview table in Phase 2. Never call creation APIs until user explicitly approves.

2. **Creating children before parents (Execution)**
   - Symptom: Calling `Create_Stories` before `Create_Epic` returns, or `Create_Subtasks` before parent story is created
   - Fix: Enforce strict sequential ordering across hierarchy levels. Only parallelize within the same level (e.g., multiple stories under one epic).

3. **Using guessed or hardcoded keys (Execution)**
   - Symptom: Using assumed keys like "PROJ-123" instead of the actual key returned by the API
   - Fix: Always capture the `key` from each API response and use it as the parent key for child tickets. Never hardcode or predict keys.

4. **Vague or generic ticket titles (Domain)**
   - Symptom: Titles like "Do the thing" or "Story 1" instead of specific, actionable titles
   - Fix: Every title should be concise and action-oriented. Use verb phrases: "Implement...", "Add...", "Configure...", "Set up...".

5. **Missing descriptions or estimates (Domain)**
   - Symptom: Creating tickets with empty descriptions or no original estimate
   - Fix: Every ticket must have a 1-3 sentence description and an original estimate. If context is insufficient, prompt the user to clarify before proceeding.

6. **Wildly inaccurate estimates (Domain)**
   - Symptom: All tickets estimated identically, or estimates that don't match the complexity tier (e.g., a simple config change at 70 hours)
   - Fix: Assess each ticket individually against the simple/medium/difficult tiers (~17.5h / ~35h / ~70h). Subtask estimates should sum to approximately the parent story's estimate.

7. **Missing mandatory stories or subtasks (Domain)**
   - Symptom: Epic created without "Internal Working Doc" or "Product Requirements Doc" stories, or agent story missing mandatory subtasks
   - Fix: Always include the 2 mandatory stories for every epic. If the initiative involves an agent, always include the agent story with all 6 mandatory subtasks. Check step 1.3 before drafting.

8. **Incomplete post-creation summary (Execution)**
   - Symptom: Not showing the full hierarchy with ticket keys after creation
   - Fix: Always generate the tree-style summary in Phase 4 with all ticket keys.

---

## Safety and Constraints

When using this skill:

- **Do NOT** create any tickets without first presenting a preview table and receiving user approval
- **Do NOT** create child tickets before their parent ticket exists and returns a key
- **Do NOT** guess, hardcode, or predict JIRA ticket keys
- **Do NOT** add fields beyond the supported set: title, description, original estimate, assignee, labels, start_date, due_date (priority, sprint, etc. are out of scope)
- **ALWAYS** follow strict creation order: Epic → Stories → Subtasks
- **ALWAYS** use the actual key returned from each API call as the parent key
- **ALWAYS** present a post-creation summary with the complete hierarchy and ticket keys
- **ALWAYS** include the 2 mandatory stories (Internal Working Doc, Product Requirements Doc) for every epic
- **ALWAYS** include the agent story with all 6 mandatory subtasks when the initiative involves an agent
- **ALWAYS** fill in description and original estimate for every ticket based on available context
- **ALWAYS** prompt the user to clarify when there is not enough information to write a meaningful description or judge complexity
- **PREFER** action-oriented ticket titles (verb phrases)
- **PREFER** parallel creation within the same hierarchy level where possible

This skill's purpose is to reliably create well-structured JIRA ticket hierarchies with full user visibility and control at every step.
