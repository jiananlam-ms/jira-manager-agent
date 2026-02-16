---
name: jira-ticket-update
type: workflow
description: Updates existing JIRA tickets with new field values including title, description, estimate, assignee, labels, status, start date, and due date. Automatically cascades start dates upward through the hierarchy (subtask → story → epic) when the parent's date is empty. Use when modifying fields on existing tickets; when changing ticket labels or transitioning workflow status; or when bulk-updating multiple tickets.
---

# JIRA Ticket Update

This skill guides Claude in updating existing JIRA tickets with new field values.

It focuses on **modifying fields on existing tickets**, not on creating new tickets (that's the `jira-ticket-creation` skill) or querying board state (that's the `jira-board-query` skill).

---

## Purpose

Use this skill to:

- Update any combination of fields on existing tickets (title, description, estimate, assignee, labels, status, start_date, due_date)
- Change ticket labels to reflect progress status
- Transition workflow status (e.g., Backlog → Building → Completed)
- Bulk-update multiple tickets in a single operation
- Reassign tickets to different team members
- Cascade start dates upward through the hierarchy (subtask → story → epic)

This skill is intended to feed into:

- `jira-board-manager` agent as the skill for ticket modification operations

---

## Applicability

### When to use this skill

Trigger this skill when:

- User wants to change the title, description, estimate, assignee, label, status, start date, or due date on an existing ticket
- User wants to update progress labels (e.g., "mark AT-403 as on-track")
- User wants to transition workflow status (e.g., "move AT-403 to Building")
- User wants to reassign a ticket to a different team member
- User wants to bulk-update multiple tickets at once
- User updates a story or subtask with a start date (triggers automatic parent date cascade)

Common trigger phrases: "Update AT-403...", "Change the label on...", "Reassign this ticket to...", "Mark these as on-track...", "Update the estimate on...", "Move AT-403 to Building...", "Set status to Completed...", "Set start date on AT-403...".

### When not to use this skill

Avoid using this skill when:

- User wants to create new tickets (use `jira-ticket-creation`)
- User wants to query or audit the board (use `jira-board-query`)
- User wants to delete tickets (out of scope)

In those cases, use the appropriate skill or direct the user to JIRA.

---

## Dependencies

This skill relies on:

- `mcp__ms_jira_mcp__Update_Any_Issue_Type` — MCP tool for updating existing tickets (supports title, description, original_estimate, assignee_id, labels, status, start_date, and due_date)

**Important:** All 9 parameters (`issue_key`, `title`, `description`, `original_estimate`, `assignee_id`, `labels`, `status`, `start_date`, `due_date`) are **required** by the MCP tool schema. For fields you are NOT changing, pass an empty string `""`. Omitting any parameter will cause a schema validation error. Date fields expect `YYYY-MM-DD` format.

---

## Team Member Directory

When reassigning tickets, resolve display names to JIRA account IDs using this lookup table:

| Display Name | Account ID |
|-------------|------------|
| Jian An Lam | `712020:2c69d3c5-729e-44b2-9bf3-29e93382f899` |
| Muhammad Tayyab | `62e769b832850ea2a3237b7a` |
| Muhammad Ali | `557058:33bfe2fd-6b7f-4cc3-8abf-e20e8b109fd3` |
| Haseeb Ahmad | `712020:7e204e9c-8c07-4615-8930-142f6a198535` |

When the user mentions a team member by name (full name, first name, or partial match), resolve to the corresponding `accountId` above. If the name doesn't match anyone in the table, prompt the user to clarify.

---

## Allowed Labels

Tickets can only have labels from this set:

| Label | Meaning |
|-------|---------|
| `not-started` | Work has not begun |
| `on-track` | Work is in progress and on schedule |
| `on-hold` | Work is paused or blocked |
| `done` | Work is completed |

If the user provides a label not in this list, prompt them to choose from the allowed values. Labels are passed as an array (e.g., `["on-track"]`).

---

## Allowed Statuses

Tickets can only transition to statuses from this set:

| Status | Meaning |
|--------|---------|
| `Shaping` | Requirements being defined |
| `Building` | Active development |
| `Ready for Review` | Work complete, awaiting review |
| `Refining` | Iterating based on feedback |
| `Backlog` | Queued but not started |
| `Launched` | Deployed to production |
| `Completed` | Done and closed |

If the user provides a status not in this list, prompt them to choose from the allowed values. Status is passed as a string (e.g., `"Building"`).

---

## Status-Label Pairing (Auto-Sync)

Status and label must always be consistent. **When either is changed, automatically set the other to match.**

### Pairing Rules

| Status | Label |
|--------|-------|
| `Backlog` | `not-started` |
| `Shaping` | `on-track` |
| `Building` | `on-track` |
| `Refining` | `on-track` |
| `Ready for Review` | `on-track` |
| `Launched` | `done` |
| `Completed` | `done` |

### When Status Changes → Auto-Set Label

If the user changes **status**, always include the matching **label** in the same update call:
- Status → `Backlog` → also set label to `not-started`
- Status → `Shaping` / `Building` / `Refining` / `Ready for Review` → also set label to `on-track`
- Status → `Completed` / `Launched` → also set label to `done`

### When Label Changes → Auto-Set Status

If the user changes **label**, also set the matching **status** where the mapping is unambiguous:
- Label → `not-started` → also set status to `Backlog`
- Label → `on-track` → do NOT auto-set status (multiple statuses possible — ask the user which one)
- Label → `on-hold` → do NOT auto-set status (no direct status mapping)
- Label → `done` → also set status to `Completed`

---

## Date Cascade (Auto-Propagation to Parent)

When a ticket's start date is updated, **automatically cascade the start date upward** to the parent ticket if the parent's start date is currently empty. This prevents the common mistake of updating child dates while the parent remains undated.

### Cascade Rules

| Ticket Updated | Parent Type | Start Date Behavior | Due Date Behavior |
|---------------|-------------|--------------------|--------------------|
| **Subtask** with start_date | Parent **Story** | If the story's start_date is empty → set it to the same start_date | If the story's due_date is empty → set it to end of current quarter |
| **Story** with start_date | Parent **Epic** | If the epic's start_date is empty → set it to the same start_date | If the epic's due_date is empty → set it to end of current quarter |

### End-of-Quarter Reference

| Quarter | Due Date Default |
|---------|-----------------|
| Q1 (Jan–Mar) | `YYYY-03-31` |
| Q2 (Apr–Jun) | `YYYY-06-30` |
| Q3 (Jul–Sep) | `YYYY-09-30` |
| Q4 (Oct–Dec) | `YYYY-12-31` |

Use the current date to determine which quarter applies.

### Cascade Procedure

1. After successfully updating a ticket's start_date, identify the **parent ticket** (story's parent epic, or subtask's parent story)
2. Query the parent ticket to check its current start_date and due_date
3. If the parent's start_date is **empty** → update the parent with the same start_date
4. If the parent's due_date is **empty** → update the parent with end of current quarter as the due_date
5. If the parent's start_date is **already set** → do NOT overwrite it (the existing date takes precedence)
6. Report the cascade action in the post-update summary so the user knows the parent was also updated

### Cascade Preview

When a start_date update will trigger a cascade, include the cascade in the preview:
```
Updating AT-411 (Story):
  - Start Date: → 2025-04-01

  ↳ Auto-cascade to parent AT-400 (Epic):
    - Start Date: (empty) → 2025-04-01
    - Due Date: (empty) → 2025-06-30
```

Wait for user confirmation before executing both updates.

---

## Inputs

### From the Input Envelope

- **From `goal`:**
  - Which ticket(s) to update and what fields to change
  - Example: "Update AT-403 label to on-track" or "Reassign AT-411 to Ali"

- **From `context`:**
  - Background on why the update is needed
  - Current ticket state if relevant

- **From `constraints`:**
  - Specific fields to update or leave unchanged

- **From `upstream`:**
  - Previous query results that inform which tickets need updating

- **From `extra`:**
  - Bulk update lists or spreadsheet data

### From the File System

No file system inputs required — this skill operates entirely through MCP tools and user interaction.

### Missing Input Handling

- **Required inputs:** At least one `issue_key` and at least one field to update. Cannot proceed without both.
- **Optional inputs:** Any field not being updated is simply omitted from the API call.
- **Document assumptions in:** The update preview presented to the user.

---

## Outputs

### Output Type

In-Memory Data

### Primary Output

- **Description:** Confirmation of updated tickets with the fields that were changed
- **Format:** Markdown table showing ticket key, updated fields, and new values

### Downstream Usage

- `jira-board-manager` agent: Receives the update results to present to the user
- User: Reviews confirmation of changes

---

## Procedure

Claude should follow this procedure when using this skill.

### Phase 1: Parse Update Request (1.1-1.4)

#### 1.1 Identify tickets and fields

Extract from the user's request:
- **Which tickets:** One or more issue keys (e.g., AT-403, AT-411)
- **Which fields to change:** Any combination of title, description, original_estimate, assignee, labels, status

If the user references tickets by name rather than key, ask for the issue key or use `jira-board-query` to look it up.

#### 1.2 Validate field values

For each field being updated:

| Field | Validation |
|-------|-----------|
| **title** | Non-empty string |
| **description** | Non-empty string |
| **original_estimate** | Normalize to JIRA format (e.g., `20h`) using the time normalization rules |
| **assignee_id** | Resolve name to account ID from Team Member Directory |
| **labels** | Must be from allowed set: `not-started`, `on-track`, `on-hold`, `done` |
| **status** | Must be from allowed set: `Shaping`, `Building`, `Ready for Review`, `Refining`, `Backlog`, `Launched`, `Completed` |
| **start_date** | ISO date format `YYYY-MM-DD` |
| **due_date** | ISO date format `YYYY-MM-DD`. If not specified, defaults to end of current quarter |

**Time format normalization:** Same rules as `jira-ticket-creation`:

| User Input | Normalized |
|-----------|------------|
| `20hr`, `20hrs`, `20 hours` | `20h` |
| `2d`, `2 days` | `16h` (1 day = 8h) |
| `1w`, `1 week` | `40h` (1 week = 40h) |
| `3.5h`, `3.5 hours` | `3.5h` |
| `20` (bare number) | `20h` (assume hours) |

#### 1.3 Apply status-label auto-sync

After validation, apply the **Status-Label Pairing** rules:

- If the user is changing **status** but not **label** → add the paired label to the update automatically
- If the user is changing **label** but not **status** → add the paired status if the mapping is unambiguous (`not-started` → `Backlog`, `done` → `Completed`). For `on-track`, ask the user which status. For `on-hold`, do not auto-set status.
- If the user is changing **both** → validate they are consistent per the pairing table. If not, warn the user before proceeding.

Include the auto-synced field in the preview so the user sees what will actually be sent.

#### 1.4 Preview changes

For single ticket updates, present a concise summary:
```
Updating AT-403:
  - Labels: not-started → on-track
  - Assignee: Jian An Lam → Muhammad Ali
```

For bulk updates, present a preview table:

| Ticket Key | Field | Old Value | New Value |
|------------|-------|-----------|-----------|
| AT-403 | Labels | not-started | on-track |
| AT-411 | Assignee | Tayyab | Ali |

Wait for user confirmation before proceeding. For single-field, single-ticket updates (e.g., "mark AT-403 as on-track"), proceed directly without a preview table — just confirm after.

**Output of Phase 1:** Validated update request ready for execution.

### Phase 2: Execute Updates (2.1-2.2)

#### 2.1 Call Update_Any_Issue_Type for each ticket

For each ticket, use `mcp__ms_jira_mcp__Update_Any_Issue_Type` with **all required parameters**:
- `issue_key`: The ticket key (e.g., `AT-403`)
- `title`: New title, or `""` if not changing
- `description`: New description, or `""` if not changing
- `original_estimate`: Normalized estimate, or `""` if not changing
- `assignee_id`: Account ID, or `""` if not changing
- `labels`: Label value as string, or `""` if not changing
- `status`: Target status name as string, or `""` if not changing
- `start_date`: ISO date `YYYY-MM-DD`, or `""` if not changing
- `due_date`: ISO date `YYYY-MM-DD`, or `""` if not changing

**All 9 parameters are required.** Pass empty string `""` for any field not being updated. Omitting a parameter causes a schema validation error.

Updates to different tickets can be made in parallel.

#### 2.2 Execute date cascade (if applicable)

If start_date was updated on a story or subtask, apply the **Date Cascade** rules:

1. Identify the parent ticket (use `jira-board-query` or the known hierarchy)
2. Check the parent's current start_date and due_date
3. If parent's start_date is empty → call `Update_Any_Issue_Type` on the parent with the same start_date
4. If parent's due_date is empty → also set the parent's due_date to end of current quarter
5. Log the cascade action for the post-update summary

**Note:** Cascade only propagates one level up per update. If a subtask update cascades to its story, AND that story's start_date was empty (meaning it was just set), then also check the story's parent epic and cascade again if the epic's start_date is empty.

#### 2.3 Handle errors

If an update fails:
- Report which ticket and field failed
- Report the error message
- Continue with remaining updates (don't stop on first error)
- Summarize all failures at the end

**Output of Phase 2:** Update results for all tickets.

### Phase 3: Post-Update Summary (3.1)

#### 3.1 Generate summary

Present a confirmation of all changes made:

| Ticket Key | Field | New Value | Status |
|------------|-------|-----------|--------|
| AT-403 | Labels | on-track | ✓ Updated |
| AT-411 | Assignee | Muhammad Ali | ✓ Updated |
| AT-415 | Estimate | 20h | ✗ Failed — {error} |

If date cascade was triggered, include a separate section:
```
Date Cascade:
  ↳ AT-400 (Epic) — Start Date set to 2025-04-01, Due Date set to 2025-06-30 (auto-cascaded from AT-411)
```

**Output of Phase 3:** Complete update summary including any cascaded parent updates.

---

## Failure Modes and Corrections

1. **Invalid label value (Domain)**
   - Symptom: User provides a label not in the allowed set (e.g., "in-progress", "blocked")
   - Fix: Validate against the allowed labels list. Prompt the user to choose from: `not-started`, `on-track`, `on-hold`, `done`.

2. **Invalid issue key (Execution)**
   - Symptom: API returns error because the issue key doesn't exist
   - Fix: Report the invalid key to the user. Suggest using `jira-board-query` to find the correct key.

3. **Overwriting unintended fields (Execution)**
   - Symptom: Fields the user didn't ask to change get overwritten with empty or default values
   - Fix: Only include fields that the user explicitly asked to change in the API call. Never send empty or null values for fields not being updated.

4. **Unresolved team member name (Domain)**
   - Symptom: User provides a name that doesn't match the Team Member Directory
   - Fix: Prompt the user to clarify. Show the available team members from the directory.

5. **Bulk update without confirmation (Execution)**
   - Symptom: Updating multiple tickets without showing a preview first
   - Fix: Always show a preview table for bulk updates (2+ tickets). Wait for user approval before executing.

6. **Wrong time format (Domain)**
   - Symptom: Passing `20hr` or `20 hours` to the API instead of `20h`
   - Fix: Always normalize time estimates to `{number}h` format before passing to the API.

7. **Missing required parameters (Execution)**
   - Symptom: MCP tool returns `"Received tool input did not match expected schema"` with `"Required → at status"` (or another field)
   - Fix: All 9 parameters (`issue_key`, `title`, `description`, `original_estimate`, `assignee_id`, `labels`, `status`, `start_date`, `due_date`) are required by the MCP tool schema. Always pass every parameter — use empty string `""` for fields not being changed.

---

## Safety and Constraints

When using this skill:

- **Do NOT** update fields the user didn't explicitly ask to change
- **Do NOT** omit any parameter from the MCP tool call — all 9 are required; use `""` for unchanged fields
- **Do NOT** accept labels outside the allowed set (`not-started`, `on-track`, `on-hold`, `done`)
- **Do NOT** accept statuses outside the allowed set (`Shaping`, `Building`, `Ready for Review`, `Refining`, `Backlog`, `Launched`, `Completed`)
- **Do NOT** execute bulk updates without showing a preview table first
- **ALWAYS** validate label values against the allowed set before updating
- **ALWAYS** validate status values against the allowed set before updating (status names are case-sensitive)
- **ALWAYS** apply status-label auto-sync — when one changes, the other must match per the pairing table
- **ALWAYS** resolve team member names to account IDs before updating assignee
- **ALWAYS** normalize time estimates to JIRA format (`{number}h`) before updating
- **ALWAYS** present a post-update summary confirming what was changed
- **ALWAYS** cascade start_date to the parent ticket when updating a story or subtask's start_date (if parent's start_date is empty)
- **ALWAYS** set the parent's due_date to end of current quarter when cascading start_date (if parent's due_date is empty)
- **NEVER** overwrite a parent's existing start_date or due_date during cascade — only fill empty fields
- **PREFER** parallel execution when updating multiple tickets
- **PREFER** concise confirmations for single-field updates, preview tables for bulk updates

This skill's purpose is to reliably update existing JIRA tickets while ensuring only intended fields are modified and all values are valid.
