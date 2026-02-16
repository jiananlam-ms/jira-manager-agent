# Skill Spec: jira-ticket-creation

## Identity

| Field | Value |
|-------|-------|
| **Name** | `jira-ticket-creation` |
| **Type** | Workflow |
| **Description** | Creates JIRA ticket hierarchies (Epic → Stories → Subtasks) from feature descriptions. Use when a user provides a feature or initiative description and needs tickets created; when decomposing requirements into structured ticket hierarchies; or when creating epics with associated stories and subtasks. |

## Purpose

This skill analyzes feature descriptions or requirements, proposes a structured ticket hierarchy (Epic → Stories → Subtasks), presents a preview table for user approval, then creates all tickets in strict parent-before-child order using JIRA MCP tools.

### Capabilities
- Decompose feature descriptions into Epic → Stories → Subtasks hierarchies
- Generate preview tables showing proposed ticket structure with titles and descriptions
- Create tickets in strict hierarchical order using API-returned keys
- Produce post-creation summaries with full hierarchy and ticket keys

### Downstream Usage
- Used by `jira-board-manager` agent as its primary skill for ticket creation requests

## Applicability

### When to use
- User provides a feature description and wants JIRA tickets created
- User has a list of work items that need to be structured as an epic with stories
- User wants to create a ticket hierarchy from scratch

### When NOT to use
- User wants to query or audit existing board state (use `jira-board-query`)
- User wants to modify or delete existing tickets (out of scope)
- User wants to assign or prioritize tickets (out of scope)

## Inputs

### From the Input Envelope
- **goal:** Feature description, initiative requirements, or list of work items to create as tickets
- **context:** Project background, related existing tickets, team conventions for ticket naming
- **constraints:** Maximum hierarchy depth, specific naming patterns for titles

### From MCP Tools
- `mcp__ms_jira_mcp__Create_Epic` — Creates epics, returns epic key
- `mcp__ms_jira_mcp__Create_Stories` — Creates stories under an epic, returns story key
- `mcp__ms_jira_mcp__Create_Subtasks` — Creates subtasks under a story, returns subtask key

## Outputs

### Primary Output
- **Type:** Created JIRA tickets + summary report
- **Format:** Markdown table showing full hierarchy with ticket keys

### Output Stages
1. **Preview table** — Proposed ticket structure for user approval (before creation)
2. **Created tickets** — Actual JIRA tickets created via MCP tools
3. **Summary report** — Full hierarchy with ticket keys after creation

## Procedure Outline

### Phase 1: Requirement Analysis
- Parse the user's feature description or requirements
- Identify the top-level epic theme
- Decompose into logical stories (functional groupings)
- Further break stories into subtasks (implementation steps)

### Phase 2: Preview and Approval
- Generate a markdown table showing the proposed hierarchy:
  - Level (Epic/Story/Subtask), Title, Description, Parent
- Present the table to the user
- Wait for explicit approval before proceeding
- If user requests changes, revise and re-present

### Phase 3: Hierarchical Creation
- **Step 1:** Create the Epic using `Create_Epic` — capture `epic_key`
- **Step 2:** Create all Stories using `Create_Stories` with `epic_key` — capture each `story_key`
- **Step 3:** Create all Subtasks using `Create_Subtasks` with appropriate `story_key`
- Stories under the same epic can be created in parallel
- Subtasks across different stories can be created in parallel
- NEVER create children before parents exist

### Phase 4: Post-Creation Summary
- Present full hierarchy with actual ticket keys
- Show: Epic key → Story keys → Subtask keys
- Confirm all tickets were created successfully

## Pattern References
- None required (self-contained workflow)

## Constraints
- ALWAYS show preview table and get user approval before creating any tickets
- ALWAYS create in strict order: Epic → Stories → Subtasks
- ALWAYS use actual API-returned keys, never guess or hardcode
- DO NOT create tickets without user approval
- DO NOT create child tickets before parent tickets exist
- DO NOT add priority, assignment, or estimation fields (out of scope)

## MCP Dependencies
- **Server:** `ms_jira_mcp`
- **Tools used:** `Create_Epic`, `Create_Stories`, `Create_Subtasks`
- **Fallback:** If MCP tools are unavailable, inform the user and suggest manual creation
