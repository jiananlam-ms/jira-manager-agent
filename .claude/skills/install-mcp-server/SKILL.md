---
name: install-mcp-server
type: tool
description: Looks up an MCP server from the catalog, checks prerequisites, installs dependencies, merges config, and verifies connectivity. Use when a user wants to add an MCP server; when configuring a new MCP integration; or when an MCP server needs to be set up.
---

# Install MCP Server

This skill guides Claude in adding a new MCP server to the user's configuration by looking up catalog entries, resolving dependencies, merging config, and verifying connectivity.

It focuses on **installing and configuring a specific MCP server**, not on setting up mcp-cli itself (that's the `setup-mcp-cli` skill's job).

---

## Purpose

Use this skill to:

- Look up server details from the MCP server catalog pattern
- Check and resolve server-specific prerequisites (Docker, Node.js, etc.)
- Merge server configuration into `~/.config/mcp/mcp_servers.json`
- Handle conflicts when a server already exists in the config
- Verify server connectivity after configuration
- Accept custom server configs not listed in the catalog

This skill is intended to feed into:

- Any skill or workflow that depends on a specific MCP server being available
- `create-skill-spec` Phase 2.6 invokes this skill inline to install relevant servers during skill design

---

## Applicability

### When to use this skill

Trigger this skill when:

- User asks to add or install an MCP server (e.g., "Add context7", "Set up playwright")
- A skill requires an MCP server that is not yet configured
- User provides a custom MCP server config to register

Common trigger phrases: "Add context7 server", "Install playwright MCP", "Set up n8n MCP", "Configure MCP server".

### When not to use this skill

Avoid using this skill when:

- mcp-cli is not installed (direct the user to `setup-mcp-cli` first)
- User wants to remove or reconfigure an existing server (manual config edit)
- User wants to call MCP tools (this skill only configures servers, not uses them)

In those cases, use `setup-mcp-cli` for initial setup, or call `mcp-cli` commands directly for tool usage.

---

## Dependencies

This skill relies on:

- `patterns/mcp-patterns/mcp-server-catalog.md` — server entries with configs, prerequisites, and install steps
- `setup-mcp-cli` skill — mcp-cli must be installed (prerequisite; may be invoked inline by the same caller before this skill)
- `patterns/mcp-patterns/mcp-cli-guide.md` — general mcp-cli reference for commands and troubleshooting
- `patterns/mcp-patterns/context7-mcp-cli-guide.md` — context7 server setup and troubleshooting
- `patterns/mcp-patterns/figma-mcp-cli-guide.md` — figma server setup and troubleshooting
- `patterns/mcp-patterns/playwright-mcp-cli-guide.md` — playwright server setup and troubleshooting
- `patterns/mcp-patterns/n8n-mcp-cli-guide.md` — n8n server setup and troubleshooting
- Bash tool — for running prerequisite checks and install commands
- AskUserQuestion tool — for conflict resolution and server selection
- Read tool — for reading catalog and existing config
- Write tool — for writing updated config

---

## Inputs

### From the Input Envelope

- **From `goal`:** Server name to install, or custom config to add
- **From `context`:** Existing MCP setup, reason for adding the server

### From the File System

Use Read tool to load:

- `patterns/mcp-patterns/mcp-server-catalog.md` — server registry
- `~/.config/mcp/mcp_servers.json` — existing server config

### Missing Input Handling

- **Server name unknown:** Use AskUserQuestion to present available servers from catalog
- **Server not in catalog:** Ask user for custom config JSON (url for HTTP, or command+args for stdio)
- **Config file missing:** Direct user to `setup-mcp-cli` first

---

## Outputs

### Output Type

Configuration file update

### Primary Output

- Updated `~/.config/mcp/mcp_servers.json` with the new server entry
- Backup at `~/.config/mcp/mcp_servers.json.bak`

### Verification

- `mcp-cli <server>` returns a tool listing

### Downstream Usage

- MCP tool calls via `mcp-cli <server>/<tool>` become available
- Skills that depend on the server can now operate

---

## Procedure

Claude should follow this procedure when using this skill.

### Phase 1: Prerequisite Check (1.1-1.4)

#### 1.1 Verify mcp-cli is installed

Run via Bash:

```bash
mcp-cli --version 2>/dev/null
```

If mcp-cli is not found, inform the user: "mcp-cli is not installed. Run the `setup-mcp-cli` skill first." Stop here.

#### 1.2 Read the server catalog

Use Read tool to load `patterns/mcp-patterns/mcp-server-catalog.md`.

Parse the catalog to extract available server names and their details.

#### 1.3 Identify the requested server

Match the user's request against catalog entries:
- If exact match found → proceed with catalog entry
- If no match → proceed to step 1.4 for custom config

#### 1.4 Handle custom server (not in catalog)

If the server is not in the catalog, use AskUserQuestion:

```
question: "This server is not in the catalog. What type of transport does it use?"
header: "Transport"
options:
  - label: "HTTP"
    description: "Remote server accessed via URL (e.g., https://example.com/mcp)"
  - label: "Stdio"
    description: "Local process started via command (e.g., npx, docker, python)"
multiSelect: false
```

Then gather the required config fields:
- For HTTP: ask for URL (and optional headers)
- For Stdio: ask for command and args

**Output of Phase 1:** Server details (from catalog or custom) ready for installation.

### Phase 2: Dependency Resolution (2.1-2.4)

#### 2.1 Run prerequisite checks

For catalog servers, run the prerequisite check commands from the catalog entry via Bash.

For custom servers, skip to Phase 3 (no known prerequisites).

#### 2.2 Report missing prerequisites

If any prerequisite check fails, report to the user what is missing and what action is needed. For example:
- "Docker is not running. Please start Docker Desktop and try again."
- "Node.js is not installed. Install Node.js v18+ from https://nodejs.org/"

If prerequisites cannot be resolved, stop here.

#### 2.3 Install server-specific dependencies

Run install steps from the catalog entry:

- **Docker-based servers:** `docker pull <image>`
- **Node-based servers:** Verify `npx` can access the package
- **App-based servers:** Verify the application is running

#### 2.4 Re-verify prerequisites

Re-run the prerequisite check commands to confirm all dependencies are satisfied.

**Output of Phase 2:** All prerequisites met, dependencies installed.

### Phase 3: Config Merge (3.1-3.6)

#### 3.1 Read existing config

Use Read tool to load `~/.config/mcp/mcp_servers.json`.

Parse the JSON to access the `mcpServers` object.

#### 3.2 Check for conflicts

Check if the server key already exists in `mcpServers`.

#### 3.3 Resolve conflicts

If the server key exists, use AskUserQuestion:

```
question: "The server '{server-name}' already exists in your config. What should I do?"
header: "Conflict"
options:
  - label: "Overwrite"
    description: "Replace the existing config with the new one"
  - label: "Skip"
    description: "Keep the existing config, do not change anything"
  - label: "Rename"
    description: "Add the new config with a different key name"
multiSelect: false
```

If user selects Skip, stop here (server already configured). If Rename, ask for the new key name.

#### 3.4 Backup existing config

Run via Bash:

```bash
cp ~/.config/mcp/mcp_servers.json ~/.config/mcp/mcp_servers.json.bak
```

#### 3.5 Merge server entry

Add the new server entry to the `mcpServers` object. The config snippet comes from:
- Catalog entry `Config snippet` section, OR
- Custom config gathered in Phase 1.4

Use Write tool to save the updated `~/.config/mcp/mcp_servers.json`.

Ensure valid JSON formatting with proper indentation.

#### 3.6 Verify config is valid JSON

Run via Bash:

```bash
python3 -m json.tool ~/.config/mcp/mcp_servers.json >/dev/null 2>&1 && echo "VALID_JSON" || echo "INVALID_JSON"
```

If INVALID_JSON, restore from backup and report the error.

**Output of Phase 3:** Updated config file with new server entry.

### Phase 4: Verification (4.1-4.3)

#### 4.1 Test server connectivity

Run via Bash:

```bash
mcp-cli <server-name>
```

This should list the server's available tools.

#### 4.2 Report success

Present a summary to the user:

```
MCP Server Installed: {server-name}
Transport: {stdio/HTTP}
Tools available: {tool count}
Config: ~/.config/mcp/mcp_servers.json

Available tools:
- {tool1}
- {tool2}
- ...
```

#### 4.3 Handle verification failure

If `mcp-cli <server>` fails:

1. Check if the server process/endpoint is reachable
2. For HTTP servers: verify URL is correct and service is running
3. For stdio servers: verify command exists and is executable
4. Read the server's specific guide from `patterns/mcp-patterns/` (e.g., `patterns/mcp-patterns/context7-mcp-cli-guide.md`) for troubleshooting
5. Report the error with suggested fixes

**Output of Phase 4:** Verified working MCP server.

---

## Failure Modes and Corrections

1. **mcp-cli not installed (Execution)**
   - Symptom: `mcp-cli --version` fails
   - Fix: Direct user to run `setup-mcp-cli` skill first

2. **Prerequisite not met (Execution)**
   - Symptom: Docker not running, Node.js not installed, etc.
   - Fix: Report specific missing prerequisite and installation instructions

3. **Config merge produces invalid JSON (Execution)**
   - Symptom: JSON validation fails after merge
   - Fix: Restore from `.bak` backup, re-attempt with corrected JSON

4. **Server connectivity fails after config (Domain)**
   - Symptom: `mcp-cli <server>` returns error
   - Fix: Check transport-specific issues (URL for HTTP, command path for stdio). Read the server's specific guide from `patterns/mcp-patterns/` (e.g., `patterns/mcp-patterns/playwright-mcp-cli-guide.md`).

5. **Silent overwrite of existing server (Domain)**
   - Symptom: User's existing server config replaced without consent
   - Fix: Always check for conflicts and use AskUserQuestion before overwriting

---

## Safety and Constraints

When using this skill:

- **Do NOT** proceed if mcp-cli is not installed — direct to `setup-mcp-cli`
- **Do NOT** overwrite existing server config without user confirmation via AskUserQuestion
- **Do NOT** skip prerequisite checks — always verify before config merge
- **Do NOT** write config without backing up the existing file first
- **ALWAYS** backup existing config before writing changes
- **ALWAYS** verify server connectivity after config merge
- **ALWAYS** read the catalog pattern for server details rather than hardcoding values
- **ALWAYS** validate JSON after writing config
- **PREFER** catalog entries over custom config when the server is in the catalog
- **PREFER** AskUserQuestion for conflict resolution rather than silent overwrite
