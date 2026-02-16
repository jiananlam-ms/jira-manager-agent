# MCP Server Catalog

> **Type:** Pattern (reference registry)
> **Purpose:** Registry of known MCP servers with transport types, config snippets, capabilities, prerequisites, and install steps.

---

## How to Use This Catalog

This catalog is a **lookup reference** for skills that install or configure MCP servers. Each entry provides everything needed to add a server to `~/.config/mcp/mcp_servers.json`.

**Consumed by:**
- `install-mcp-server` skill — reads entries to install and configure servers
- `create-skill-spec` skill (Phase 2.6) — reads capability summaries to suggest MCP dependencies

---

## Server Entries

### context7

| Field | Value |
|-------|-------|
| **Name** | `context7` |
| **Transport** | HTTP |
| **Capabilities** | Library documentation search and retrieval, semantic doc queries, library discovery |
| **Prerequisites** | Internet connection |
| **Reference doc** | `patterns/mcp-patterns/context7-mcp-cli-guide.md` |

**Config snippet:**
```json
{
  "context7": {
    "url": "https://mcp.context7.com/mcp"
  }
}
```

**Prerequisite check commands:**
```bash
# No local prerequisites — cloud-based HTTP service
curl -s -o /dev/null -w "%{http_code}" https://mcp.context7.com/mcp
```

**Install steps:**
1. No server-side installation required (cloud service)
2. Add config snippet to `~/.config/mcp/mcp_servers.json`
3. Verify: `mcp-cli context7`

---

### figma-desktop

| Field | Value |
|-------|-------|
| **Name** | `figma-desktop` |
| **Transport** | HTTP (localhost) |
| **Capabilities** | Design-to-code generation, screenshot extraction, design token retrieval, FigJam content extraction |
| **Prerequisites** | Figma Desktop app installed and running |
| **Reference doc** | `patterns/mcp-patterns/figma-mcp-cli-guide.md` |

**Config snippet:**
```json
{
  "figma-desktop": {
    "url": "http://127.0.0.1:3845/mcp"
  }
}
```

**Prerequisite check commands:**
```bash
# Check if Figma Desktop is running
pgrep -x "Figma" >/dev/null 2>&1 && echo "Figma running" || echo "Figma not running"
# Check if MCP endpoint is reachable
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3845/mcp
```

**Install steps:**
1. Ensure Figma Desktop app is installed (https://www.figma.com/downloads/)
2. Open Figma Desktop and sign in
3. Add config snippet to `~/.config/mcp/mcp_servers.json`
4. Verify: `mcp-cli figma-desktop`

---

### playwright

| Field | Value |
|-------|-------|
| **Name** | `playwright` |
| **Transport** | stdio |
| **Capabilities** | Browser automation via accessibility tree, navigation, clicking, typing, screenshots, JavaScript evaluation |
| **Prerequisites** | Node.js (v18+), npm/npx |
| **Reference doc** | `patterns/mcp-patterns/playwright-mcp-cli-guide.md` |

**Config snippet (stdio):**
```json
{
  "playwright": {
    "command": "npx",
    "args": ["@playwright/mcp@latest"]
  }
}
```

**Prerequisite check commands:**
```bash
# Check Node.js version
node --version
# Check npx availability
npx --version
# Verify Playwright MCP package is accessible
npx @playwright/mcp@latest --help
```

**Install steps:**
1. Ensure Node.js v18+ is installed (`node --version`)
2. No separate install needed — `npx` downloads on first run
3. Add config snippet to `~/.config/mcp/mcp_servers.json`
4. Verify: `mcp-cli playwright`

---

### n8n-mcp

| Field | Value |
|-------|-------|
| **Name** | `n8n-mcp` |
| **Transport** | stdio (via Docker) |
| **Capabilities** | n8n node discovery, workflow template search, node configuration schemas, workflow validation |
| **Prerequisites** | Docker installed and running |
| **Reference doc** | `patterns/mcp-patterns/n8n-mcp-cli-guide.md` |

**Config snippet:**
```json
{
  "n8n-mcp": {
    "command": "docker",
    "args": [
      "run",
      "-i",
      "--rm",
      "--init",
      "-e", "MCP_MODE=stdio",
      "-e", "LOG_LEVEL=error",
      "-e", "DISABLE_CONSOLE_OUTPUT=true",
      "ghcr.io/czlonkowski/n8n-mcp:latest"
    ]
  }
}
```

**Prerequisite check commands:**
```bash
# Check Docker is installed and running
docker --version
docker info >/dev/null 2>&1 && echo "Docker running" || echo "Docker not running"
# Check if image is already pulled
docker images ghcr.io/czlonkowski/n8n-mcp:latest --format "{{.Repository}}"
```

**Install steps:**
1. Ensure Docker is installed and running (`docker info`)
2. Pull the Docker image: `docker pull ghcr.io/czlonkowski/n8n-mcp:latest`
3. Add config snippet to `~/.config/mcp/mcp_servers.json`
4. Verify: `mcp-cli n8n-mcp`

---

## Adding New Servers

To add a server to this catalog, create an entry with these fields:

| Field | Required | Description |
|-------|----------|-------------|
| Name | Yes | Server name as used in `mcp_servers.json` key |
| Transport | Yes | `stdio` or `HTTP` |
| Capabilities | Yes | What the server provides (1-2 sentence summary) |
| Prerequisites | Yes | What must be installed/running before configuration |
| Reference doc | No | Path to detailed guide in `patterns/mcp-patterns/` |
| Config snippet | Yes | JSON fragment to merge into `mcp_servers.json` |
| Prerequisite check commands | Yes | Bash commands to verify prerequisites are met |
| Install steps | Yes | Numbered steps from zero to working |

**Naming convention:** Use kebab-case for the server name key.

---

## Application Notes

This pattern is referenced by:
- `install-mcp-server` skill — uses entries to install and configure servers
- `setup-mcp-cli` skill — references config directory conventions
- `create-skill-spec` skill (Phase 2.6) — reads capability summaries to suggest MCP integrations
- `patterns/mcp-patterns/mcp-integration-guide.md` — references capability-to-server mapping
