---
name: jira-ticket-comment
type: workflow
description: Adds comments to JIRA tickets with @mentions to notify assignees. Use when nudging team members about missing fields, posting status updates, or tagging someone on a ticket. Typically used after jira-board-query to notify assignees about action items.
---

# JIRA Ticket Comment

This skill guides Claude in adding comments to existing JIRA tickets with optional @mentions.

It focuses on **commenting and notifying**, not on creating tickets (that's `jira-ticket-creation`), updating fields (that's `jira-ticket-update`), or auditing the board (that's `jira-board-query`).

---

## Purpose

Use this skill to:

- Add comments to JIRA tickets with @mentions that trigger notifications
- Nudge assignees about missing fields after a board query audit
- Post status updates or notes on tickets
- Bulk-comment on multiple tickets grouped by assignee

This skill is intended to feed into:

- `jira-board-manager` agent as the skill for ticket commenting and assignee notifications

---

## Applicability

### When to use this skill

Trigger this skill when:

- User wants to notify assignees about missing fields (typically after `jira-board-query`)
- User wants to add a comment to one or more tickets
- User wants to tag/mention someone on a ticket
- User says "notify them", "nudge them", "comment on the tickets", "tag the assignees"

Common trigger phrases: "notify them", "nudge the team", "comment on the tickets", "tag them", "let them know".

### When not to use this skill

Avoid using this skill when:

- User wants to create new tickets (use `jira-ticket-creation`)
- User wants to update ticket fields like labels, estimates, assignee (use `jira-ticket-update`)
- User wants to audit the board (use `jira-board-query`)

---

## Dependencies

This skill relies on:

- `mcp__ms_jira_mcp__Add_Comment_to_Issue` — adds a comment to a ticket with optional @mention

---

## Team Member Directory

When tagging assignees in comments, resolve display names to JIRA account IDs:

| Display Name | Account ID |
|-------------|------------|
| Jian An Lam | `712020:2c69d3c5-729e-44b2-9bf3-29e93382f899` |
| Muhammad Tayyab | `62e769b832850ea2a3237b7a` |
| Muhammad Ali | `557058:33bfe2fd-6b7f-4cc3-8abf-e20e8b109fd3` |
| Haseeb Ahmad | `712020:7e204e9c-8c07-4615-8930-142f6a198535` |

When the user mentions a team member by name (full name, first name, or partial match), resolve to the corresponding `accountId` above. If the name doesn't match anyone in the table, prompt the user to clarify.

---

## Inputs

### From the User or Upstream Skill

- **Tickets to comment on:** One or more issue keys with the comment text
- **Upstream data:** Typically the action items output from `jira-board-query` (Phase 7.2), which provides ticket keys, assignees, and missing fields

### Missing Input Handling

- **Required inputs:** At least one `issue_key` and a `comment` text. Cannot proceed without both.
- **Optional inputs:** `mention_id` — if not provided, the comment is posted without an @mention.
- If invoked after `jira-board-query`, the action items list provides all needed data automatically.

---

## Outputs

### Output Type

In-Memory Data

### Primary Output

- **Description:** Confirmation of comments posted with ticket keys and mention status
- **Format:** Markdown table showing ticket key, assignee mentioned, and status

### Downstream Usage

- `jira-board-manager` agent: Receives confirmation to present to the user
- User: Knows which assignees were notified

---

## Procedure

Claude should follow this procedure when using this skill.

### Phase 1: Parse Comment Request (1.1-1.2)

#### 1.1 Identify tickets and compose comments

Extract from the input (user request or upstream `jira-board-query` output):
- **Which tickets:** One or more issue keys
- **What to say:** The comment text per ticket
- **Who to tag:** The assignee to @mention (if applicable)

When used after `jira-board-query`, automatically build the comment list from the action items:
- For each ticket with missing fields, compose: `Please update this ticket — missing: {comma-separated list of missing fields}.` Use "time estimate" (not "estimate") when referring to the Original Estimate field.

#### 1.2 Resolve mention IDs

For each assignee to be mentioned:
- Look up the display name in the **Team Member Directory**
- Resolve to the `account_id` for the `mention_id` parameter

**Skip tickets where the assignee is missing** — there's no one to notify.

**Skip epics** — only comment on stories and subtasks where a specific person is assigned.

#### 1.3 Duplicate comment guard

Before posting, check each ticket's `last_comment_1` field (available from the upstream `jira-board-query` data).

**Skip a ticket if:**
- The `last_comment_1` contains a nudge comment (starts with "Please update this ticket") AND
- The comment was posted **today** (same date as the current run)

This prevents spamming assignees when running the skill multiple times in one day.

If a ticket is skipped, note it in the summary as "Skipped — already nudged today".

**Output of Phase 1:** List of comments to post with resolved mention IDs (excluding duplicates).

### Phase 2: Post Comments (2.1)

#### 2.1 Add comments to tickets

For each ticket, use `mcp__ms_jira_mcp__Add_Comment_to_Issue` with:
- `issue_key`: The ticket key
- `comment`: The message text (without the @mention — that's handled by `mention_id`)
- `mention_id`: The assignee's account ID from the Team Member Directory

Comments to different tickets can be posted in parallel.

If a ticket's assignee is not in the Team Member Directory, post the comment without `mention_id` and note it in the summary.

#### 2.2 Handle errors

If a comment fails:
- Report which ticket failed and the error message
- Continue with remaining comments (don't stop on first error)
- Summarize all failures at the end

**Output of Phase 2:** Comments posted on all target tickets.

### Phase 3: Post-Comment Summary (3.1)

#### 3.1 Generate summary

Present a confirmation grouped by assignee:

```
### Comments Posted

**Muhammad Tayyab** (3 tickets)
| Ticket | Title | Comment | Status |
|--------|-------|---------|--------|
| AT-290 | Centralized Asset Repository | Missing: Estimate, Start Date | ✓ Notified |
| AT-309 | Asset Repository Backend | Missing: Estimate, Start Date | ✓ Notified |
| AT-308 | Asset Repository UI | Missing: Estimate, Start Date | ✓ Notified |

**Haseeb Ahmad** (2 tickets)
| Ticket | Title | Comment | Status |
|--------|-------|---------|--------|
| AT-337 | Create Meta tagging | Missing: Estimate, Start Date, Due Date | ✓ Notified |
| AT-317 | Collect Shopify Products Images | Missing: Start Date, Due Date | ✓ Notified |
```

**Output of Phase 3:** Complete notification summary.

---

## Failure Modes and Corrections

1. **Commenting without @mention (Execution)**
   - Symptom: Comment posted as plain text without tagging the assignee, so no notification triggered
   - Fix: Always resolve the assignee's display name to an account ID using the Team Member Directory. Pass it as `mention_id` to trigger the ADF mention node.

2. **Unresolved assignee name (Domain)**
   - Symptom: Assignee name doesn't match any entry in the Team Member Directory
   - Fix: Post the comment without a mention and flag it in the summary. Prompt the user to update the directory if needed.

3. **Duplicate comments on same ticket (Execution)**
   - Symptom: Running the skill multiple times posts duplicate nudge comments
   - Fix: Before posting, check the ticket's recent comments (from the `last_comment_1` field in query data). If a similar nudge was posted recently (same day), skip that ticket.

4. **Commenting on completed tickets (Domain)**
   - Symptom: Nudging assignees on tickets that are already completed
   - Fix: Only comment on tickets that are not in `Completed` status. Completed tickets don't need field updates.

---

## Safety and Constraints

When using this skill:

- **Do NOT** modify, update, or delete any tickets — this skill only adds comments
- **Do NOT** comment on tickets in `Completed` status — they don't need field updates
- **Do NOT** comment on tickets without an assignee — there's no one to notify
- **Do NOT** post duplicate nudge comments if a similar one was posted the same day
- **ALWAYS** resolve assignee names to account IDs before commenting
- **ALWAYS** use `mention_id` parameter to @mention assignees (not wiki markup)
- **ALWAYS** present a post-comment summary showing what was posted and to whom
- **PREFER** parallel comment posting for efficiency
- **PREFER** grouping the summary by assignee for readability

This skill's purpose is to close the feedback loop — after `jira-board-query` identifies gaps, this skill notifies the right people directly in JIRA so they can take action.
