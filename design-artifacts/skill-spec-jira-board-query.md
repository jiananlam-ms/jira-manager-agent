# Skill Spec: jira-board-query

## Identity

| Field | Value |
|-------|-------|
| **Name** | `jira-board-query` |
| **Type** | Workflow |
| **Description** | Queries JIRA board state and audits ticket completeness across epic hierarchies. Use when checking board health; when auditing tickets for missing fields (estimate, assignee, dates); when identifying overdue items; or when generating standup-ready reports of gaps and blockers. |

## Purpose

This skill queries the JIRA board to retrieve epics, stories, and subtasks, then audits each ticket for completeness (original estimate, assignee, start date, due date) and flags overdue items. It produces a standup-ready report highlighting gaps and past-due tickets.

### Capabilities
- Query initiatives/epics by status filter (to-do, in-progress, done)
- Drill into full hierarchy: epic → stories → subtasks
- Audit ticket fields for completeness (original estimate, assignee, start date, due date)
- Identify overdue tickets (past due date)
- Generate structured reports highlighting gaps and overdue items for standup discussions

### Downstream Usage
- Used by `jira-board-manager` agent for board health checks and standup preparation

## Applicability

### When to use
- User wants to check board health or audit ticket completeness
- User wants a standup-ready report of gaps and overdue items
- User wants to see which tickets are missing estimates, assignees, or dates
- User wants to drill into an initiative's hierarchy to see stories and subtasks

### When NOT to use
- User wants to create new tickets (use `jira-ticket-creation`)
- User wants to modify or delete existing tickets (out of scope)
- User wants to assign or prioritize tickets (out of scope)

## Inputs

### From the Input Envelope
- **goal:** What to query or audit (e.g., "check all in-progress epics for completeness", "standup report")
- **context:** Specific filters — status (to-do, in-progress, done), labels (e.g., on-track), initiative keys
- **constraints:** Which fields to audit, date thresholds for overdue detection

### From MCP Tools
- `mcp__ms_jira_mcp__Get_A_Single_Issue` — Retrieves initiatives by status
- `mcp__ms_jira_mcp__Get_Stories` — Retrieves stories for an initiative
- `mcp__ms_jira_mcp__Get_Subtasks` — Retrieves subtasks for a story

## Outputs

### Primary Output
- **Type:** Structured audit report
- **Format:** Markdown report with sections for gaps and overdue items

### Report Sections
1. **Board Overview** — Summary of queried epics with status
2. **Completeness Audit** — Per-ticket breakdown of missing fields:
   - Original estimate: present/missing
   - Assignee: present/missing
   - Start date: present/missing
   - Due date: present/missing
3. **Overdue Items** — Tickets past their due date with days overdue
4. **Standup Action Items** — Consolidated list of issues to discuss

## Procedure Outline

### Phase 1: Query Board State
- Query initiatives using `Get_A_Single_Issue` with the appropriate status filter
- Parse returned initiatives to identify relevant epics
- If label/status filtering beyond API capability is needed, filter results client-side

### Phase 2: Hierarchy Drill-Down
- For each relevant epic, call `Get_Stories` to retrieve stories
- For each story, call `Get_Subtasks` to retrieve subtasks
- Build complete hierarchy tree in memory

### Phase 3: Field Completeness Audit
- For each ticket (epic, story, subtask), check:
  - Original estimate: is it set?
  - Assignee: is it set?
  - Start date: is it set?
  - Due date: is it set?
- Record all gaps with ticket key and missing field name

### Phase 4: Overdue Detection
- For each ticket with a due date, compare against current date
- Flag tickets where due date is in the past
- Calculate days overdue

### Phase 5: Report Generation
- Generate Board Overview section
- Generate Completeness Audit table with gap indicators
- Generate Overdue Items list with days overdue
- Generate Standup Action Items summary
- Present the full report to the user
- Prompt user to discuss or take action on flagged items

## Pattern References
- None required (self-contained workflow)

## Constraints
- ALWAYS drill into the full hierarchy (epic → stories → subtasks) before reporting
- ALWAYS check all four audit fields: original estimate, assignee, start date, due date
- ALWAYS flag overdue items separately from missing-field items
- DO NOT modify any tickets — this is a read-only audit skill
- DO NOT make assumptions about field values — report only what the API returns
- PREFER structured tables over prose for audit results (easier to scan during standup)

## MCP Dependencies
- **Server:** `ms_jira_mcp`
- **Tools used:** `Get_A_Single_Issue`, `Get_Stories`, `Get_Subtasks`
- **Fallback:** If MCP tools are unavailable, inform the user and suggest checking JIRA directly
