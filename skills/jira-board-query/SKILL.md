---
name: jira-board-query
type: workflow
description: Scans the entire JIRA board for label-status consistency, audits on-track ticket completeness, and detects missing parent dates that can inherit from children. Trigger with "update me" to get a standup-ready report of missing fields, label-status mismatches, date inheritance opportunities, and overdue items.
---

# JIRA Board Query

This skill guides Claude in scanning the JIRA board and producing a standup-ready audit report.

It focuses on **board-wide label-status consistency** and **field completeness auditing for on-track tickets**, not on creating tickets (that's `jira-ticket-creation`) or updating tickets (that's `jira-ticket-update`).

---

## Purpose

Use this skill to:

- Scan the **entire board** (all epics across all statuses) for label-status mismatches
- Audit on-track tickets for required fields (assignee, original estimate, start date, due date)
- Detect label-status mismatches (e.g., label = `not-started` but status != `Backlog`) across ALL tickets board-wide
- Detect epics/stories with missing start dates and offer to inherit from the earliest child's start date
- Identify overdue tickets
- Generate a standup-ready report with actionable items

This skill is intended to feed into:

- `jira-board-manager` agent as the skill for board health checks and standup preparation

---

## Applicability

### When to use this skill

Trigger this skill when:

- User says "update me" or asks for a board status update
- User wants to check board health or audit ticket completeness
- User wants a standup-ready report of gaps and issues

Common trigger phrases: "update me", "board status", "standup report", "check the board".

### When not to use this skill

Avoid using this skill when:

- User wants to create new tickets (use `jira-ticket-creation`)
- User wants to update existing tickets (use `jira-ticket-update`)
- User wants to query a specific ticket by key (just use the MCP tools directly)

---

## Dependencies

This skill relies on:

- `mcp__ms_jira_mcp__Get_Epic` — retrieves epics filtered by label
- `mcp__ms_jira_mcp__Get_Stories` — retrieves stories under an epic
- `mcp__ms_jira_mcp__Get_Subtasks` — retrieves subtasks under a story
- `mcp__ms_jira_mcp__Update_Any_Issue_Type` — used by Phase 5 (auto-fix label mismatches) to correct labels

---

## Inputs

### From the User

The only trigger needed is "update me" or similar. No parameters required — the skill always scans the entire board (all epic statuses).

### Missing Input Handling

- No inputs are required from the user — the skill runs with fixed defaults.
- If the API returns no on-track epics, report that the board is clear.

---

## Outputs

### Output Type

In-Memory Data

### Primary Output

- **Description:** Standup-ready audit report with hierarchy overview, missing fields, label-status mismatches, and overdue items
- **Format:** Markdown report with tables

### Downstream Usage

- `jira-board-manager` agent: Receives the report to present to the user
- `jira-ticket-comment` skill: Consumes the assignee-grouped action items (Phase 8.2) to post @mention comments on each ticket
- User: Reviews during standup to identify action items and optionally triggers notifications

---

## Procedure

Claude should follow this procedure when using this skill.

### Phase 1: Get All Epics (1.1)

#### 1.1 Retrieve all epics across all statuses

Fetch epics from **all three status categories** in parallel:

- `mcp__ms_jira_mcp__Get_Epic` with `initiative_status: "on-track"`
- `mcp__ms_jira_mcp__Get_Epic` with `initiative_status: "not-started"`
- `mcp__ms_jira_mcp__Get_Epic` with `initiative_status: "done"`

Extract each epic's `key`, `title`, `label`, and `status`. Tag each epic with its source category.

**Why all three:** Label-status mismatches can exist anywhere on the board — not just under on-track epics. A story under a done epic might have label `on-track` + status `Completed` (mismatch). A story under a not-started epic might have label `not-started` + status `Building` (mismatch). Fetching only on-track epics creates blind spots.

**Output of Phase 1:** Complete list of all epics across all statuses.

### Phase 2: Hierarchy Drill-Down (2.1-2.2)

#### 2.1 Retrieve stories for all epics

For **every epic** (not just on-track), use `mcp__ms_jira_mcp__Get_Stories` with the `initiative_key`.

Calls for different epics can be made in parallel.

**Why all epics:** Stories under done or not-started epics can have label-status mismatches that would otherwise go undetected. The field completeness audit (Phase 3) will still only check active tickets, but the consistency check (Phase 4) needs visibility into the full board.

#### 2.2 Retrieve subtasks for active stories

For each story where label and status are NOT both correctly paired as (`not-started` + `Backlog`), use `mcp__ms_jira_mcp__Get_Subtasks` with the `story_key`.

**Skip stories ONLY when both conditions are true:** label = `not-started` AND status = `Backlog`. These are correctly paired inactive stories — their subtasks don't need checking.

**Do NOT skip stories that have a mismatch** — even if labeled `not-started`, if the status is NOT `Backlog`, drill into subtasks because the story itself is mismatched and its children may be too.

Calls for different stories can be made in parallel.

**Output of Phase 2:** Complete hierarchy: all epics → all stories → subtasks (excluding only correctly-paired not-started stories).

### Phase 3: Field Completeness Audit (3.1)

#### 3.1 Check required fields on on-track tickets

For every ticket with label **other than `not-started`**, check these four fields:

| Field | Check | Source Field |
|-------|-------|-------------|
| **Assignee** | Is it non-null? | `assignee` |
| **Original Estimate** | Is it non-null? | `original_estimate` |
| **Start Date** | Is it non-null? | `start_date` |
| **Due Date** | Is it non-null? | `end_date` |

**Exception:** If a ticket has label = `not-started` AND status = `Backlog`, skip all field checks entirely. These tickets are not yet active — do not flag them for Assignee, Original Estimate, Start Date, or Due Date.

Record each gap with the ticket's **key**, **title**, **level** (Epic/Story/Subtask), and which fields are missing.

**Output of Phase 3:** List of tickets with missing fields.

### Phase 4: Label-Status Consistency Check (4.1)

#### 4.1 Validate label-status pairs (BOARD-WIDE)

**This check runs against the ENTIRE board** — all epics, stories, and subtasks fetched in Phases 1-2, regardless of which epic category they came from (on-track, not-started, or done).

For every ticket at every level, check the full pairing rules:

| Label | Expected Status(es) | Rule |
|-------|---------------------|------|
| `not-started` | `Backlog` | If label = `not-started`, status MUST be `Backlog` |
| `on-track` | `Shaping`, `Building`, `Refining`, `Ready for Review` | If label = `on-track`, status MUST be one of these |
| `done` | `Completed`, `Launched` | If label = `done`, status MUST be one of these |
| `on-hold` | Any | No strict pairing — but status should NOT be `Backlog` or `Completed` |

Also check the reverse direction:

| Status | Expected Label | Rule |
|--------|---------------|------|
| `Backlog` | `not-started` | If status = `Backlog`, label MUST be `not-started` |
| `Shaping`, `Building`, `Refining`, `Ready for Review` | `on-track` | If status is active, label MUST be `on-track` |
| `Completed`, `Launched` | `done` | If status is terminal, label MUST be `done` |

Flag any ticket where label and status do not match per these rules.

Record each mismatch with the ticket's **key**, **title**, **level** (Epic/Story/Subtask), current **label**, current **status**, and **parent epic key**.

**Output of Phase 4:** List of label-status mismatches across the entire board.

### Phase 5: Auto-Fix Label Mismatches (5.1)

#### 5.1 Offer to fix mismatches

If Phase 4 found any label-status mismatches, **immediately offer to fix them** before generating the report.

Present the mismatches in a table and ask: "Found {N} label-status mismatches. Fix all?"

```
Found **{N} label-status mismatches**:

| Ticket | Title | Current Label | Status | Fix |
|--------|-------|---------------|--------|-----|
| AT-351 | Ideogram Prompt Generator | on-track | Completed | → `done` |
| AT-310 | API Integration | not-started | In Progress | → `on-track` |

Fix all?
```

**Fix rules (per status-label pairing):**
- Status = `Backlog` → label must be `not-started`
- Status = `Shaping` / `Building` / `Refining` / `Ready for Review` → label must be `on-track`
- Status = `Completed` / `Launched` → label must be `done`

If the user approves, use `mcp__ms_jira_mcp__Update_Any_Issue_Type` to update all mismatched tickets in parallel. Pass empty strings for fields that should not change (title, description, original_estimate, assignee_id).

After fixing, update the mismatch count to 0 in the report.

If the user declines, include the mismatches as action items in the report.

**Output of Phase 5:** Mismatches fixed (or deferred to action items).

### Phase 6: Date Inheritance Auto-Fix (6.1)

#### 6.1 Detect missing parent dates and offer to inherit from children

After label mismatches are resolved, check for **epics and stories with missing start dates** that have children with start dates already set. This catches the common mistake of updating child dates while the parent remains undated.

**For each active epic (label != `not-started`, status != `Completed`):**

1. Check if the epic's `start_date` is null
2. If null, look at all stories under the epic that have a non-null `start_date`
3. Find the **earliest** story `start_date` — this becomes the candidate inheritance value
4. Also check if the epic's `end_date` (due date) is null — if so, default to **end of current quarter**

**For each active story (label != `not-started`, status != `Completed`):**

1. Check if the story's `start_date` is null
2. If null, look at all subtasks under the story that have a non-null `start_date`
3. Find the **earliest** subtask `start_date` — this becomes the candidate inheritance value
4. Also check if the story's `end_date` (due date) is null — if so, default to **end of current quarter**

**End-of-quarter reference:**

| Quarter | Due Date Default |
|---------|-----------------|
| Q1 (Jan–Mar) | `YYYY-03-31` |
| Q2 (Apr–Jun) | `YYYY-06-30` |
| Q3 (Jul–Sep) | `YYYY-09-30` |
| Q4 (Oct–Dec) | `YYYY-12-31` |

**Present candidates in a table and offer to fix:**

```
Found **{N} parent tickets** with missing dates that can inherit from children:

| Parent Ticket | Title | Level | Inherit Start Date From | Proposed Start | Proposed Due |
|---------------|-------|-------|------------------------|----------------|--------------|
| AT-258 | Marketing Briefs | Epic | AT-367 (earliest story) | 2026-02-09 | 2026-03-31 |
| AT-370 | Brief Validation Agent | Story | AT-381 (earliest subtask) | 2026-02-10 | 2026-03-31 |

Apply date inheritance?
```

If the user approves, use `mcp__ms_jira_mcp__Update_Any_Issue_Type` to update each parent ticket. Pass empty strings for fields that should not change.

**Only inherit into empty fields** — never overwrite an existing start_date or due_date.

If no candidates are found, skip silently — do not mention it in the report.

**Output of Phase 6:** Parent dates inherited (or deferred).

### Phase 7: Overdue Detection (7.1)

#### 7.1 Check for overdue tickets

For each ticket that has a due date (`end_date`) set:
- Compare against today's date
- If due date is in the past, calculate days overdue

**Only check active tickets** — skip tickets with label `not-started` AND skip tickets with status `Completed`. Completed tickets that are past due are not actionable.

**Output of Phase 7:** List of active overdue tickets with days overdue.

### Phase 8: Report Generation (8.1-8.2)

**Scope rule:** Only report on **active** tickets — exclude any ticket with status `Completed` from the missing fields, overdue, and action items sections. Completed tickets are done and not actionable.

The report has two sections only — a summary table and action items grouped by assignee. No separate tables for missing fields, mismatches, or overdue — those details are consolidated into the action items.

#### 8.1 Board Overview with Health Score

Present a summary header with at-a-glance issue counts and workload per person:

```
## Board Update — {today's date}

Scanned **{N} epics** ({A} on-track, {B} not-started, {C} done) | {M} stories | {P} subtasks

| Metric | Count |
|--------|-------|
| Missing fields | {X} tickets |
| Label-status mismatches | {Y} tickets (auto-fixed / deferred) |
| Date inheritance | {D} parents updated (or deferred) |
| Overdue | {Z} tickets |
| **Total action items** | **{X+Y+Z}** |

### Workload

| Team Member | Active Tickets | Action Items |
|-------------|---------------|--------------|
| Muhammad Tayyab | 12 | 10 |
| Haseeb Ahmad | 8 | 7 |
| Jian An Lam | 6 | 6 |
```

**Active Tickets** = total non-Completed, non-not-started tickets assigned to this person across all on-track epics.
**Action Items** = tickets assigned to this person that have issues (missing fields, overdue, or mismatches).

This gives the reader an instant sense of board health and team workload before diving into details.

#### 8.2 Action Items (Grouped by Assignee)

This is the most important section — it turns the audit into a handoff-ready list for the `jira-ticket-comment` skill.

**Group action items by assignee**, sorted by number of items descending. Within each assignee group, order by severity: overdue first, then mismatches, then missing fields.

```
### Action Items

**Jian An Lam** (4 items)
| # | Ticket | Title | Status | Label | Parent Epic | Issue |
|---|--------|-------|--------|-------|-------------|-------|
| 1 | AT-66 | Campaign Launch Automation | Building | on-track | AT-64 | 4 days overdue |
| 2 | AT-355 | Create Campaign Ops Slack Channel | Shaping | on-track | AT-64 | Missing: time estimate, start, due |
| 3 | AT-356 | Define Slack Channel Structure | Shaping | on-track | AT-64 | Missing: start, due |
| 4 | AT-357 | Set Up Notifications | Building | on-track | AT-66 | Missing: time estimate |

**Muhammad Tayyab** (3 items)
| # | Ticket | Title | Status | Label | Parent Epic | Issue |
|---|--------|-------|--------|-------|-------------|-------|
| 1 | AT-290 | Centralized Asset Repository | Building | on-track | AT-64 | Missing: time estimate, start |
| 2 | AT-309 | Asset Repository Backend | Building | on-track | AT-64 | Missing: time estimate, start |
| 3 | AT-308 | Asset Repository UI | Building | on-track | AT-64 | Missing: time estimate, start |

**Unassigned** (1 item)
| # | Ticket | Title | Status | Label | Parent Epic | Issue |
|---|--------|-------|--------|-------|-------------|-------|
| 1 | AT-203 | Error Handling and fallback mechanisms | Building | on-track | AT-64 | Missing: assignee, start, due |
```

**Priority order within each group:**
1. Overdue items (most urgent)
2. Label-status mismatches (data integrity)
3. Missing fields (completeness)

**Why group by assignee:** This format directly maps to the `jira-ticket-comment` skill — each assignee group becomes one notification batch. It also makes standup easier: "Jian An, you have 4 items to update."

**Unassigned group:** Tickets missing an assignee go into an "Unassigned" group at the bottom — these need the user to assign someone first.

If there are no action items: "Board is clean — no action items."

**Output of Phase 8:** Complete standup-ready report with workload summary and assignee-grouped action items.

---

## Failure Modes and Corrections

1. **Auditing not-started tickets (Domain)**
   - Symptom: Flagging missing fields on tickets that are labeled `not-started` and in `Backlog`
   - Fix: For tickets with label `not-started` AND status `Backlog`, skip all field checks entirely — including Assignee. These tickets are not yet active and are expected to be incomplete.

2. **Skipping hierarchy drill-down (Execution)**
   - Symptom: Only reporting on epics without checking stories and subtasks
   - Fix: Always drill into stories (Phase 2.1) and subtasks for on-track stories (Phase 2.2).

3. **Missing ticket titles in report (Execution)**
   - Symptom: Report only shows issue keys like AT-355 without the title
   - Fix: Always include both the issue key AND title for every ticket in the report.

4. **Not checking label-status consistency (Execution)**
   - Symptom: Tickets with mismatched labels and statuses go unreported
   - Fix: Always run Phase 4. Check every ticket, including `not-started` ones.

5. **Report too verbose for standup (Domain)**
   - Symptom: Report is too long to scan quickly
   - Fix: Only show tickets with issues in the detailed sections. Group action items by assignee in tables for quick scanning.

6. **Including completed tickets in action items (Domain)**
   - Symptom: Completed tickets appear in missing fields or overdue sections, cluttering the report with non-actionable items
   - Fix: Exclude tickets with status `Completed` from missing fields (Phase 3), overdue detection (Phase 7), and action items (Phase 8.2). Only include completed tickets in label-status mismatches (Phase 4) since those need label cleanup.

7. **Flat action items list (Domain)**
   - Symptom: Action items are a flat numbered list without assignee context, making it hard to delegate or feed into `jira-ticket-comment`
   - Fix: Always group action items by assignee (Phase 8.2). This enables direct handoff to the `jira-ticket-comment` skill and makes standup delegation natural.

8. **Drilling into correctly-paired not-started stories (Execution)**
   - Symptom: Fetching subtasks for stories that are correctly labeled `not-started` with status `Backlog`, wasting API calls
   - Fix: Skip subtask drill-down ONLY when BOTH label = `not-started` AND status = `Backlog`. If a story has label `not-started` but status is NOT `Backlog` (a mismatch), still drill into its subtasks.

9. **Missing mismatches outside on-track epics (Execution)**
   - Symptom: Label-status mismatches under done or not-started epics go undetected because only on-track epics were fetched
   - Fix: Phase 1 MUST fetch ALL epics (on-track, not-started, done). Phase 2 MUST drill into stories for ALL epics. The label-status consistency check (Phase 4) needs full board visibility. Only the field completeness audit (Phase 3) is scoped to on-track tickets — the consistency check is board-wide.

---

## Safety and Constraints

When using this skill:

- **Do NOT** modify tickets without user approval — Phase 5 (auto-fix label mismatches) and Phase 6 (date inheritance) both require explicit user confirmation before updating
- **Do NOT** audit any fields (including Assignee) on `not-started` + `Backlog` tickets — they are not yet active and are expected to be incomplete
- **Do NOT** include `Completed` tickets in missing fields, overdue, or action items — they are not actionable
- **Do NOT** skip the hierarchy drill-down — always check stories and subtasks, not just epics
- **Do NOT** report raw API data without analysis — always audit and format
- **Do NOT** drill into subtasks for correctly-paired `not-started` + `Backlog` stories — skip them only when both label AND status match
- **ALWAYS** include both ticket key AND title in every report entry
- **ALWAYS** check label-status consistency for ALL tickets (including `not-started` and `Completed`)
- **ALWAYS** check field completeness for active (non-`not-started`, non-`Completed`) tickets only
- **ALWAYS** group action items by assignee (Phase 8.2) — this feeds directly into `jira-ticket-comment`
- **ALWAYS** check for date inheritance opportunities (Phase 6) — epics/stories with missing start dates that have children with dates set
- **ALWAYS** include the health score summary (Phase 8.1) for at-a-glance board status
- **NEVER** overwrite existing parent start_date or due_date during date inheritance — only fill empty fields
- **ALWAYS** fetch ALL epic categories (on-track, not-started, done) in Phase 1 — never limit to on-track only, as mismatches can exist anywhere on the board
- **ALWAYS** drill into stories for ALL epics, not just on-track — the label-status consistency check is board-wide
- **PREFER** tables over prose for audit data (easier to scan during standup)
- **PREFER** grouping by epic hierarchy for the missing fields report
- **PREFER** severity ordering within assignee groups: overdue → mismatches → missing fields

This skill's purpose is to give the user a clear, actionable standup report — highlighting what needs attention so they can take action quickly. To notify assignees, use the `jira-ticket-comment` skill after this report is generated.
