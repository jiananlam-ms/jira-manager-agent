# Skill Spec: jira-ticket-update

## Identity

| Field | Value |
|-------|-------|
| **Name** | `jira-ticket-update` |
| **Type** | Workflow |
| **Description** | Updates existing JIRA tickets (epics, stories, subtasks) with new field values. Use when modifying title, description, estimate, assignee, or labels on existing tickets; when changing ticket labels to reflect progress status; or when bulk-updating multiple tickets. |

## Purpose

This skill updates existing JIRA tickets with new field values using the Update_Issue MCP tool.

### Capabilities
- Update any combination of fields on an existing ticket (title, description, estimate, assignee, labels)
- Resolve team member names to account IDs for assignee changes
- Normalize time estimate formats to JIRA-accepted format
- Validate label values against the allowed set
- Support bulk updates across multiple tickets

### Downstream Usage
- Used by `jira-board-manager` agent for ticket modification operations

## Applicability

### When to use
- User wants to change the title, description, estimate, assignee, or label on an existing ticket
- User wants to update ticket status labels (e.g., mark as on-track, on-hold, done)
- User wants to bulk-update multiple tickets at once

### When NOT to use
- User wants to create new tickets (use `jira-ticket-creation`)
- User wants to query or audit the board (use `jira-board-query`)
- User wants to delete tickets (out of scope)
- User wants to change JIRA workflow status (e.g., Backlog → In Progress) — this requires a separate transitions tool

## Inputs
- **issue_key:** The ticket key to update (e.g., AT-403) — required
- **title, description, original_estimate, assignee_id, labels:** Fields to update — at least one required

## Outputs
- Confirmation of updated tickets with changed fields

## Constraints
- Labels must be one of: `not-started`, `on-track`, `on-hold`, `done`
- Only update fields explicitly requested — do not overwrite other fields
- Always confirm updates with the user before executing bulk changes

## MCP Dependencies
- **Server:** `ms_jira_mcp`
- **Tool:** `Update_Issue`
