# JIRA Board Manager — Functional Guide

This document describes the **jira-board-manager** agent and the 5 skills it orchestrates. Together, they provide a complete JIRA board management system operated through natural language.

---

## Agent: jira-board-manager

**Role:** Project secretary — translates requirements into JIRA tickets and reports on board health.

**What it does:**
- Routes user requests to the correct skill based on intent
- Enforces strict Epic → Stories → Subtasks hierarchy for all ticket creation
- Always previews proposed changes before executing
- Uses structured reasoning (`<analysis>`, `<reasoning>`, `<decision>` tags) for all decisions

**What it does NOT do:**
- Prioritize or reorder tickets
- Delete tickets
- Transition JIRA workflow status (e.g., Backlog → In Progress)

### Routing Logic

| User Intent | Skill Used |
|-------------|------------|
| "Update me", "board status", "standup report" | `jira-board-query` |
| "Create tickets for...", "Set up an epic for..." | `jira-ticket-creation` |
| "Here's the PRD", "Create tickets from this doc" | `jira-ticket-intake` |
| "Update AT-403 label to...", "Reassign this ticket" | `jira-ticket-update` |
| "Notify them", "Nudge the team", "Tag assignees" | `jira-ticket-comment` |

---

## Skill 1: jira-board-query

**Trigger:** "update me", "board status", "standup report", "check the board"

**Purpose:** Scans all on-track epics and produces a standup-ready audit report with missing fields, label-status mismatches, overdue items, and action items grouped by assignee.

### What It Does (7 Phases)

1. **Get On-Track Epics** — Retrieves all epics labeled `on-track`
2. **Hierarchy Drill-Down** — Fetches stories for each epic, then subtasks for each on-track story. Skips `not-started` stories entirely (no subtask drill-down).
3. **Field Completeness Audit** — Checks every active ticket (non-`not-started`, non-`Completed`) for 4 required fields: Assignee, Original Estimate, Start Date, Due Date. Tickets with label `not-started` AND status `Backlog` are skipped entirely — no fields are checked.
4. **Label-Status Consistency** — Validates two rules across all tickets:
   - Label = `not-started` → status must be `Backlog`
   - Status = `Backlog` → label must be `not-started`
5. **Auto-Fix Mismatches** — If mismatches are found, presents them in a table and offers to fix. Fix rules: `Completed` → label `done`; `Backlog` with wrong label → `not-started`; `not-started` with wrong status → `on-track`. Requires user approval.
6. **Overdue Detection** — Flags active tickets with due dates in the past. Skips `not-started` and `Completed` tickets.
7. **Report Generation** — Produces two sections:
   - **Board Overview** with health score: epic/story/subtask counts, issue counts, and workload per team member (active tickets + action items per person)
   - **Action Items grouped by assignee**, ordered by severity: overdue → mismatches → missing fields. Includes an "Unassigned" group only for active tickets missing assignees.

### Output Format

```
## Board Update — {date}
Scanned {N} on-track epics | {M} stories | {P} subtasks

| Metric        | Count |
|---------------|-------|
| Missing fields | X     |
| Mismatches     | Y     |
| Overdue        | Z     |

### Workload
| Team Member | Active Tickets | Action Items |

### Action Items
**{Assignee Name}** ({N} items)
| # | Ticket | Title | Status | Label | Parent Epic | Issue |
```

### Key Rules
- Only scans on-track epics (not `not-started`, `on-hold`, or `done`)
- Never drills into subtasks of `not-started` stories
- Excludes `Completed` tickets from missing fields, overdue, and action items
- Skips all field checks for `not-started` + `Backlog` tickets (they are expected to be incomplete)
- Groups action items by assignee to feed directly into `jira-ticket-comment`

---

## Skill 2: jira-ticket-creation

**Trigger:** "Create tickets for...", "Set up a JIRA epic for...", "Break this into stories and subtasks"

**Purpose:** Decomposes feature descriptions into Epic → Stories → Subtasks hierarchies and creates them in strict order with user approval.

### What It Does (4 Phases)

1. **Requirement Analysis** — Parses user input into epic/story/subtask breakdown. Applies mandatory ticket rules:
   - Every epic gets 2 mandatory stories: `📃 | Internal Working Doc` and `♻️ | Product Requirements Doc`
   - If the initiative involves an agent, adds an agent story (`🤖 | {Agent Name}`) with 6 mandatory subtasks (Initial Setup, Main Workflow, Tool Setup, Prompt Generation, Error Handling, Testing & Deployment)
   - Estimates time using 3 tiers: Simple (~17.5h), Medium (~35h), Difficult (~70h) — or uses explicit estimates from source docs
2. **Preview and Approval** — Generates a full preview table (Level, Title, Description, Estimate, Assignee, Parent). Waits for explicit approval. Handles revision cycles.
3. **Hierarchical Creation** — Creates tickets in strict order:
   - Epic first → capture `epic_key`
   - Stories next (parallel OK) → capture each `story_key`
   - Subtasks last (parallel OK) → uses parent `story_key`
   - Never creates children before parents. Uses only API-returned keys.
4. **Post-Creation Summary** — Shows the full hierarchy tree with all actual JIRA keys.

### Key Rules
- Always previews before creating — no tickets without user approval
- Strict parent-before-child creation order
- Never guesses or hardcodes ticket keys
- All estimates normalized to JIRA format (e.g., `20h`, `16h` for 2 days, `40h` for 1 week)

### Team Member Directory

| Display Name | Account ID |
|-------------|------------|
| Jian An Lam | `712020:2c69d3c5-729e-44b2-9bf3-29e93382f899` |
| Muhammad Tayyab | `62e769b832850ea2a3237b7a` |
| Muhammad Ali | `557058:33bfe2fd-6b7f-4cc3-8abf-e20e8b109fd3` |
| Haseeb Ahmad | `712020:7e204e9c-8c07-4615-8930-142f6a198535` |

---

## Skill 3: jira-ticket-intake

**Trigger:** "Here's the PRD", "Create tickets from this doc", "Parse this brief into JIRA tickets"

**Purpose:** Parses PRDs, briefs, or requirements documents into structured JIRA ticket hierarchies. Bridges unstructured documents and the `jira-ticket-creation` skill.

### What It Does (5 Phases)

1. **Document Ingestion** — Reads the input (pasted text, file path, or URL). Classifies the document type: Structured PRD, Brief, Meeting Notes, or Feature List.
2. **Requirement Extraction** — Extracts epic theme, story groupings (from sections/headings/functional areas), and subtask breakdowns. Applies the same mandatory ticket rules as `jira-ticket-creation`. When adding to an existing epic, checks for duplicate stories.
3. **Assignee Resolution** — Assigns team members based on: explicit doc mentions → user hints → domain matching → ask user. Resolves all names to account IDs.
4. **Preview and Handoff** — Presents the full proposed hierarchy in a preview table. If adding to an existing epic, marks existing stories vs new. Handles revision cycles.
5. **Create Tickets** — Delegates to `jira-ticket-creation` procedure (Phase 3) for the actual creation in strict hierarchy order.

### Key Rules
- Respects the document's own structure (sections → stories, sub-points → subtasks)
- Checks for existing stories to avoid duplicates when adding to an existing epic
- Matches decomposition depth to document complexity (short brief → fewer stories; detailed PRD → more)
- Always previews before creating

---

## Skill 4: jira-ticket-update

**Trigger:** "Update AT-403...", "Change the label on...", "Reassign this ticket to...", "Mark these as on-track"

**Purpose:** Updates existing JIRA tickets — title, description, estimate, assignee, or labels.

### What It Does (3 Phases)

1. **Parse Update Request** — Identifies which tickets and which fields to change. Validates all values:
   - Labels must be from: `not-started`, `on-track`, `on-hold`, `done`
   - Estimates normalized to `{number}h` format
   - Assignee names resolved to account IDs
   - For single-field single-ticket updates, proceeds directly. For bulk updates (2+ tickets), shows a preview table.
2. **Execute Updates** — Calls the update API for each ticket. Parallel execution for multiple tickets. Continues on error (doesn't stop at first failure).
3. **Post-Update Summary** — Confirmation table showing ticket key, field changed, new value, and success/failure status.

### Key Rules
- Only updates fields the user explicitly asked to change — never sends empty values for untouched fields
- Validates labels against the allowed set before updating
- Preview table required for bulk updates
- Errors are reported per-ticket without stopping the batch

### Allowed Labels

| Label | Meaning |
|-------|---------|
| `not-started` | Work has not begun |
| `on-track` | Work is in progress and on schedule |
| `on-hold` | Work is paused or blocked |
| `done` | Work is completed |

---

## Skill 5: jira-ticket-comment

**Trigger:** "Notify them", "Nudge the team", "Comment on the tickets", "Tag the assignees"

**Purpose:** Adds comments to JIRA tickets with @mentions to notify assignees. Typically used after `jira-board-query` to close the feedback loop.

### What It Does (3 Phases)

1. **Parse Comment Request** — Builds comment list from user input or upstream `jira-board-query` action items. For missing-field nudges, composes: `"Please update this ticket — missing: {fields}."` Resolves assignee names to account IDs for @mentions. **Duplicate guard:** skips tickets that already received a nudge comment today (checks `last_comment_1`). Skips tickets with no assignee and skips epics.
2. **Post Comments** — Calls the comment API for each ticket with `mention_id` to trigger notifications. Parallel execution. Continues on error.
3. **Post-Comment Summary** — Confirmation grouped by assignee showing ticket, comment, and notification status.

### Key Rules
- Always uses `mention_id` for @mentions (not wiki markup) to trigger real JIRA notifications
- Never comments on `Completed` tickets
- Never comments on tickets without an assignee
- Duplicate guard prevents spamming: if the same nudge was posted today, skips the ticket
- Only adds comments — never modifies ticket fields

---

## Skill Interaction Flow

```
                         ┌──────────────────┐
                         │  jira-board-query │  "update me"
                         └────────┬─────────┘
                                  │ Action items
                                  ▼
                         ┌──────────────────┐
                         │jira-ticket-comment│  "notify them"
                         └──────────────────┘

  ┌──────────────────┐         ┌──────────────────┐
  │jira-ticket-intake│────────▶│jira-ticket-create │  "create tickets"
  └──────────────────┘ parsed  └──────────────────┘
    "here's the PRD"   hierarchy

                         ┌──────────────────┐
                         │jira-ticket-update │  "update AT-403"
                         └──────────────────┘
```

**Typical standup workflow:**
1. User says **"update me"** → `jira-board-query` scans the board and produces an audit report
2. User reviews action items and says **"notify them"** → `jira-ticket-comment` posts @mention comments on tickets with missing fields
3. Team members update their tickets in JIRA

**Typical ticket creation workflow:**
1. User shares a PRD → `jira-ticket-intake` parses it into a ticket hierarchy
2. User approves the preview → `jira-ticket-creation` creates tickets in strict order
3. User says **"mark AT-403 as on-track"** → `jira-ticket-update` updates the label

---

## MCP Tools Used

All skills interact with JIRA through these MCP server tools:

| MCP Tool | Used By | Purpose |
|----------|---------|---------|
| `Get_Epic` | board-query, intake | Retrieve epics by label status |
| `Get_Stories` | board-query, intake | Retrieve stories under an epic |
| `Get_Subtasks` | board-query | Retrieve subtasks under a story |
| `Create_Epic` | creation | Create a new epic |
| `Create_Stories` | creation | Create stories under an epic |
| `Create_Subtasks` | creation | Create subtasks under a story |
| `Update_Any_Issue_Type` | update, board-query (auto-fix) | Update fields on existing tickets |
| `Add_Comment_to_Issue` | comment | Post a comment with @mention |
