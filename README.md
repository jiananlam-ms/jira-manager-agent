# JIRA Board Manager Agent

A Claude Code agent that manages the full JIRA board lifecycle — creating ticket hierarchies, querying board health, updating tickets, and notifying assignees.

Built with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and connected to JIRA via MCP tools powered by [n8n](https://n8n.io/) workflows.

## How It Works

```
User (Claude Code CLI)
  → Agent (jira-board-manager)
    → Skills (ticket-creation, board-query, ticket-update, ...)
      → MCP Tools (Create_Epic, Get_Stories, Update_Any_Issue_Type, ...)
        → n8n Workflows
          → JIRA REST API
```

The agent orchestrates skills based on user intent. Each skill is a structured procedure that calls JIRA MCP tools. The MCP tools are backed by n8n workflows that handle the JIRA API calls.

## Capabilities

| Capability | Skill | Description |
|-----------|-------|-------------|
| **Create tickets** | `jira-ticket-creation` | Decompose requirements into Epic → Stories → Subtasks hierarchies |
| **Parse documents** | `jira-ticket-intake` | Extract ticket structure from PRDs, briefs, or requirements docs |
| **Board health check** | `jira-board-query` | Scan for missing fields, label-status mismatches, date inheritance gaps, and overdue items |
| **Update tickets** | `jira-ticket-update` | Modify fields (title, description, estimate, assignee, labels, status, dates) with auto-sync and date cascade |
| **Notify assignees** | `jira-ticket-comment` | Add @mention comments to nudge team members about action items |

## Quick Start

### Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installed
- JIRA MCP server configured (see [MCP Setup](#mcp-setup) below)
- n8n instance with the JIRA sub-workflows deployed

### Commands

| Command | What it does |
|---------|-------------|
| `/board-update` | Run a daily board health check — scans all epics, stories, and subtasks for missing fields, label-status mismatches, and overdue items |

### Example Usage

```
# Daily standup check
> /board-update

# Create tickets from a description
> Create an epic for the Q2 authentication overhaul with stories and subtasks

# Update a ticket
> Update AT-403 label to on-track and set start date to 2026-02-16

# Parse a PRD into tickets
> Here's the PRD for the new campaign tool, create tickets from it
```

## Project Structure

```
├── .claude/commands/
│   └── board-update.md          # /board-update slash command
├── agents/
│   └── jira-board-manager.md    # Agent definition (orchestrates skills)
├── skills/
│   ├── jira-board-query/        # Board health scanning & reporting
│   ├── jira-ticket-creation/    # Ticket hierarchy creation
│   ├── jira-ticket-update/      # Field updates, date cascade, status sync
│   ├── jira-ticket-comment/     # @mention comments & notifications
│   └── jira-ticket-intake/      # PRD/document → ticket parsing
├── design-artifacts/            # Skill specs and role designs
├── docs/                        # User-facing guide
└── n8n-snippets/                # JS transforms for n8n workflow nodes
```

## MCP Setup

This agent requires an MCP server (`ms_jira_mcp`) with the following tools:

| MCP Tool | Purpose |
|----------|---------|
| `Create_Epic` | Create epics (8 params: title, description, original_estimate, assignee_id, labels, status, start_date, due_date) |
| `Create_Stories` | Create stories under an epic (9 params: + epic_key) |
| `Create_Subtasks` | Create subtasks under a story (9 params: + story_key) |
| `Get_Epic` | Retrieve epics by status label (on-track, not-started, done) |
| `Get_Stories` | Retrieve stories under an epic |
| `Get_Subtasks` | Retrieve subtasks under a story |
| `Update_Any_Issue_Type` | Update any ticket's fields (9 params: issue_key, title, description, original_estimate, assignee_id, labels, status, start_date, due_date) |
| `Add_Comment_to_Issue` | Add a comment with @mention to a ticket |

All parameters are **required** for create and update tools — pass empty string `""` for fields not being set.

### JIRA Field Mapping (n8n)

| Agent Field | JIRA REST API Field |
|-------------|-------------------|
| `start_date` | `customfield_10015` |
| `due_date` | `duedate` |
| `original_estimate` | `timetracking.originalEstimate` |
| `labels` | `labels` (array) |
| `assignee_id` | `assignee.accountId` |

## Key Design Decisions

- **Labels and statuses are auto-synced** — changing one automatically updates the other (e.g., status → `Completed` auto-sets label → `done`)
- **Start dates cascade upward** — updating a subtask's start date propagates to the parent story (and then to the epic) if the parent's date is empty
- **Due dates default to end of quarter** when not specified during cascade
- **Board-wide mismatch detection** — the board query scans ALL epics (on-track, not-started, done), not just active ones, to catch label-status inconsistencies everywhere
- **Preview before create** — all ticket creation shows a preview table and requires user approval before making any API calls
