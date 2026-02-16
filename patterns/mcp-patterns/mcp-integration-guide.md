# MCP Integration Guide

> **Type:** Pattern (decision framework)
> **Purpose:** Framework for deciding whether and how to integrate MCP tools into a skill being designed.

---

## Decision Framework

When designing a skill that may benefit from MCP tools, follow this sequence:

### Step 1: Capability Match

Does the skill need any of these capabilities?

| Need | Candidate MCP Server | Capability |
|------|----------------------|------------|
| Library/API documentation lookup | `context7` | Semantic search across 500+ library docs |
| Design assets or tokens | `figma-desktop` | Design-to-code, screenshots, variables |
| Browser automation or testing | `playwright` | Navigate, click, type, screenshot via accessibility tree |
| Workflow automation or n8n nodes | `n8n-mcp` | Node discovery, template search, config validation |

If no match, skip MCP integration. If a match exists, proceed to Step 2.

### Step 2: Integration Type

Determine how MCP fits into the skill:

| Integration Type | When to Use | Example |
|------------------|-------------|---------|
| **Tool Skill wrapping MCP** | The skill's primary purpose is to operate an MCP server | `install-mcp-server` calls `mcp-cli` to configure servers |
| **Supplementary MCP call** | The skill has its own procedure but calls MCP at a specific step | A research skill calls `context7` to fetch docs mid-procedure |
| **Optional MCP with fallback** | The skill can work without MCP but is enhanced by it | A code-gen skill uses `figma-desktop` if available, otherwise uses user-provided specs |

### Step 3: Dependency Declaration

Record the MCP dependency in the skill-spec artifact:

- **Server name** from `patterns/mcp-patterns/mcp-server-catalog.md`
- **Integration type** from Step 2
- **Which procedure phase** uses the MCP call
- **Fallback behavior** if MCP server is unavailable

### Step 4: Procedure Integration

When writing the skill's procedure, MCP calls follow the pattern:

1. **Check availability:** `mcp-cli <server> 2>/dev/null` — if unavailable, follow fallback
2. **Discover tools:** `mcp-cli <server>` — list available tools
3. **Inspect schema:** `mcp-cli <server>/<tool>` — get expected input format
4. **Execute:** `mcp-cli <server>/<tool> '<json>'` — call the tool

---

## MCP Discovery Procedure for create-skill-spec (Phase 2.6)

When `create-skill-spec` reaches Phase 2.6, follow this procedure:

### 2.6.1 Check mcp-cli availability

```bash
mcp-cli --version 2>/dev/null
```

**If mcp-cli is NOT installed**, use AskUserQuestion to offer setup:

- **"Yes, install now"** — invoke the `setup-mcp-cli` skill inline (follow its full procedure), then offer to install relevant servers via the `install-mcp-server` skill. After setup, continue to 2.6.2.
- **"Skip for this skill"** — record "MCP integration declined" in the skill-spec. Exit Phase 2.6.
- **"Never ask again"** — skip Phase 2.6 for the remainder of this session. Exit Phase 2.6.

Never skip silently. Always inform the user that MCP capabilities exist and let them decide.

### 2.6.2 Read available servers

If mcp-cli is available (or was just installed above), run:

```bash
mcp-cli
```

This lists all configured servers and their tools.

### 2.6.3 Match capabilities to skill purpose

Read `patterns/mcp-patterns/mcp-server-catalog.md` and compare each server's capabilities against the skill being designed.

### 2.6.4 Ask the user

If one or more servers match the skill's purpose, use AskUserQuestion:

```
question: "These MCP servers could enhance this skill. Should any be included as dependencies?"
header: "MCP Tools"
options:
  - label: "{server-name}"
    description: "{capability summary from catalog}"
  - label: "No MCP integration"
    description: "This skill does not need MCP tools"
multiSelect: true
```

Present only servers whose capabilities match. Do not present all servers.

### 2.6.5 Record results

For each selected server, record in the skill-spec:
- Server name
- Integration type (from Step 2 above)
- Which procedure phase will use it
- Fallback behavior if server is unavailable

---

## Application Notes

This pattern is referenced by:
- `create-skill-spec` skill (Phase 2.6) — follows the MCP discovery procedure above
- `setup-mcp-cli` skill — invoked inline by Phase 2.6 when mcp-cli is not installed
- `install-mcp-server` skill — invoked inline by Phase 2.6 to add servers after mcp-cli setup
- `patterns/mcp-patterns/mcp-server-catalog.md` — provides the capability-to-server mapping used in Step 1
