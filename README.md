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
├── n8n-workflows/               # n8n workflow JSON exports (import to set up MCP server)
├── design-artifacts/            # Skill specs and role designs
├── docs/                        # User-facing guide
└── n8n-snippets/                # JS transforms for n8n workflow nodes
```

## MCP Setup

This agent connects to JIRA through an MCP server built with [n8n](https://n8n.io/) workflows. The `n8n-workflows/` folder contains all the workflow JSON files you need.

### Step 1: Import workflows into n8n

Import these files into your n8n instance (in order):

| # | File | What it does |
|---|------|-------------|
| — | `JIRA MCP Server.json` | **Main workflow** — the MCP server entry point that routes requests to sub-workflows |
| 1 | `1. Get Jira Epic.json` | Query epics by status label (on-track, not-started, done) |
| 2 | `2. Get Jira Stories.json` | Query stories under an epic |
| 3 | `3. Get Jira Subtasks.json` | Query subtasks under a story |
| 4 | `4. Create Jira Epic.json` | Create an epic with all fields |
| 5 | `5. Create Jira Stories.json` | Create a story under an epic |
| 6 | `6. Create Jira Subtasks.json` | Create a subtask under a story |
| 7 | `7. Update Any Issue Type.json` | Update any ticket's fields (including status transitions) |
| 8 | `8. Add Comment to Issue.json` | Add a comment with @mention to a ticket |

### Step 2: Configure JIRA credentials

In n8n, set up a **JIRA Cloud** credential with:
- Your JIRA instance URL (e.g., `https://yourteam.atlassian.net`)
- An API token ([generate one here](https://id.atlassian.com/manage-profile/security/api-tokens))
- Your JIRA email address

Then connect the credential to all JIRA nodes in the imported workflows.

### Step 3: Update project key

The workflows default to project key `AT`. If your JIRA project uses a different key, update it in the Create Epic/Stories/Subtasks workflows.

### Step 4: Activate the MCP server workflow

Activate `JIRA MCP Server.json` in n8n. This exposes a webhook URL that Claude Code connects to.

### Step 5: Configure Claude Code

Add the MCP server to your Claude Code settings (`.claude/settings.json` or project settings):

```json
{
  "mcpServers": {
    "ms_jira_mcp": {
      "type": "url",
      "url": "https://your-n8n-instance.com/webhook/jira-mcp"
    }
  }
}
```

Replace the URL with your actual n8n webhook URL from the activated MCP server workflow.

### MCP Tools Reference

| MCP Tool | Purpose | Parameters |
|----------|---------|------------|
| `Create_Epic` | Create epics | title, description, original_estimate, assignee_id, labels, status, start_date, due_date |
| `Create_Stories` | Create stories under an epic | + epic_key |
| `Create_Subtasks` | Create subtasks under a story | + story_key |
| `Get_Epic` | Query epics | initiative_status (on-track, not-started, done) |
| `Get_Stories` | Query stories | initiative_key |
| `Get_Subtasks` | Query subtasks | story_key |
| `Update_Any_Issue_Type` | Update any ticket | issue_key, title, description, original_estimate, assignee_id, labels, status, start_date, due_date |
| `Add_Comment_to_Issue` | Comment on a ticket | issue_key, comment, mention_id |

All parameters are **required** for create and update tools — pass empty string `""` for fields not being set.

### JIRA Field Mapping

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
