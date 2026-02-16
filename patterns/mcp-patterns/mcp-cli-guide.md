# MCP CLI Complete Guide

> **Purpose**: Comprehensive guide for setting up and using mcp-cli to interact with MCP (Model Context Protocol) servers via command line interface.

## Table of Contents

1. [What is mcp-cli?](#what-is-mcp-cli)
2. [Why Use mcp-cli?](#why-use-mcp-cli)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [AI Agent Integration](#ai-agent-integration)
7. [Troubleshooting](#troubleshooting)
8. [Complete Examples](#complete-examples)

---

## What is mcp-cli?

**mcp-cli** is a lightweight, Bun-based CLI tool that provides command-line access to MCP (Model Context Protocol) servers. It enables AI agents and developers to interact with MCP tools without loading full schemas into the AI's context window.

**Key Features:**
- 🪶 Lightweight - Minimal dependencies, fast startup
- 📦 Single Binary - Standalone executable
- 🔧 Shell-Friendly - JSON output for scripting
- 🤖 Agent-Optimized - Designed for AI coding agents
- 🔌 Universal - Supports both **stdio** (local) and **HTTP** (remote) MCP servers
- 💡 Actionable Errors - Structured error messages with recovery suggestions

**GitHub Repository:** https://github.com/philschmid/mcp-cli

---

## Why Use mcp-cli?

### Context Window Savings

Traditional MCP integration loads all tool schemas into the AI's context window:
- 32 NotebookLM tools
- 12 Expert Panel tools  
- 6 Internal tools
- **Total: 50 tools consuming thousands of tokens**

With mcp-cli:
- Tools are loaded **on-demand** only when needed
- AI discovers tools via `mcp-cli` command
- AI inspects schemas only when calling a tool
- **Result: 90%+ reduction in context usage**

### Scriptability

mcp-cli enables shell scripting and automation:
```bash
# Chain commands with jq and xargs
mcp-cli notebooklm-mcp/notebook_list '{"max_results": 5}' --json | jq -r '.content[0].text'

# Use in CI/CD pipelines
mcp-cli expert-panel/Product_Manager '{"query": "Review PRD", "session_id": "ci-123"}'
```

---

## Installation

### Step 1: Install mcp-cli

Run the installation script:

```bash
curl -fsSL https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh | bash
```

**What this does:**
- Downloads the latest mcp-cli binary (v0.1.3+)
- Installs to `~/.local/bin/mcp-cli`
- Makes it executable

**Verify installation:**
```bash
~/.local/bin/mcp-cli --version
```

### Step 2: Add to PATH

The binary is installed to `~/.local/bin/`, which may not be in your PATH by default.

**Temporary (current session only):**
```bash
export PATH="$HOME/.local/bin:$PATH"
```

**Permanent (recommended):**

For **zsh** (macOS default):
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

For **bash**:
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Verify PATH:**
```bash
which mcp-cli
# Should output: /Users/yourusername/.local/bin/mcp-cli

mcp-cli --version
# Should work without full path
```

---

## Configuration

### Configuration File Location

mcp-cli searches for configuration in this order:

1. `MCP_CONFIG_PATH` environment variable
2. `-c/--config` command line argument
3. `./mcp_servers.json` (current directory)
4. `~/.mcp_servers.json`
5. **`~/.config/mcp/mcp_servers.json`** ← **Recommended**

### Step 1: Create Config Directory

```bash
mkdir -p ~/.config/mcp
```

### Step 2: Create Configuration File

Create `~/.config/mcp/mcp_servers.json`:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "path/to/executable",
      "args": ["arg1", "arg2"]
    }
  }
}
```

### Configuration Format

The config file supports two transport types:

#### 1. Stdio Transport (Local Processes)

For locally-installed MCP servers that communicate via stdin/stdout:

```json
{
  "mcpServers": {
    "notebooklm-mcp": {
      "command": "/Users/username/path/to/.venv/bin/notebooklm-mcp",
      "args": []
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    }
  }
}
```

**Key Fields:**
- `command`: Full path to executable or command name
- `args`: Array of command-line arguments (can be empty)
- Optional: `env` for environment variables
- Optional: `cwd` for working directory

#### 2. HTTP Transport (Remote Servers)

For HTTP/SSE-based MCP servers:

```json
{
  "mcpServers": {
    "expert-panel": {
      "url": "https://workflows.moneysmart.co/mcp/b0618d08-70e5-4852-982f-790e8f8bd415"
    },
    "ms-internal-tools": {
      "url": "https://workflows.moneysmart.co/mcp/014ba630-8795-4910-a472-9f697eaf307c"
    }
  }
}
```

**Key Fields:**
- `url`: Full HTTP endpoint URL
- Optional: `headers` for authentication (e.g., `{"Authorization": "Bearer ${TOKEN}"}`)

#### 3. Complete Example (Mixed Transports)

```json
{
  "mcpServers": {
    "notebooklm-mcp": {
      "command": "/Users/muhammadalimanzoor/Desktop/Code/Throwaway/.venv/bin/notebooklm-mcp",
      "args": []
    },
    "expert-panel": {
      "url": "https://workflows.moneysmart.co/mcp/b0618d08-70e5-4852-982f-790e8f8bd415"
    },
    "ms-internal-tools": {
      "url": "https://workflows.moneysmart.co/mcp/014ba630-8795-4910-a472-9f697eaf307c"
    }
  }
}
```

### Finding Command Paths for Stdio MCPs

**For Python-based MCPs:**
```bash
# If installed in virtual environment
which notebooklm-mcp
# Output: /path/to/.venv/bin/notebooklm-mcp

# If installed globally
pip show notebooklm-mcp-server | grep Location
```

**For Node-based MCPs:**
```bash
which mcp-server-name
# or
npm list -g | grep mcp
```

### Environment Variable Substitution

Use `${VAR_NAME}` syntax for dynamic values:

```json
{
  "mcpServers": {
    "authenticated-server": {
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_TOKEN}"
      }
    }
  }
}
```

**Before running mcp-cli:**
```bash
export API_TOKEN="your-secret-token"
mcp-cli authenticated-server
```

---

## Usage

### Command Syntax

```bash
mcp-cli [options]                           # List all servers and tools
mcp-cli [options] grep <pattern>            # Search tools by glob pattern
mcp-cli [options] <server>                  # Show server tools and parameters
mcp-cli [options] <server>/<tool>           # Show tool JSON schema
mcp-cli [options] <server>/<tool> '<json>'  # Call tool with arguments
```

### Options

| Flag | Description |
|------|-------------|
| `-h, --help` | Show help message |
| `-v, --version` | Show version number |
| `-j, --json` | Output as JSON (for scripting) |
| `-r, --raw` | Output raw text content |
| `-d, --with-descriptions` | Include tool descriptions |
| `-c, --config <path>` | Path to config file |

### Core Commands

#### 1. List All Servers and Tools

```bash
mcp-cli
```

**Output:**
```
expert-panel
  • Product_Manager
  • Content_Creator
  • Twitter_Strategist
  • ...

notebooklm-mcp
  • notebook_list
  • notebook_create
  • notebook_query
  • ...
```

**With descriptions:**
```bash
mcp-cli -d
```

#### 2. Search Tools by Pattern

```bash
# Find all tools with "notebook" in name
mcp-cli grep "*notebook*"

# Find all tools starting with "search"
mcp-cli grep "search*"

# Find file-related tools across all servers
mcp-cli grep "*file*"
```

**Output:**
```
notebooklm-mcp/notebook_list
notebooklm-mcp/notebook_create
notebooklm-mcp/notebook_query
```

#### 3. View Server Details

```bash
mcp-cli expert-panel
```

**Output:**
```
Server: expert-panel
Transport: HTTP
URL: https://workflows.moneysmart.co/mcp/...

Tools (12):
  Product_Manager
    Parameters:
      • query (string, required)
      • session_id (string, required)
  ...
```

#### 4. View Tool Schema

```bash
mcp-cli notebooklm-mcp/notebook_list
```

**Output:**
```
Tool: notebook_list
Server: notebooklm-mcp

Description:
  Lists all notebooks

Input Schema:
  {
    "type": "object",
    "properties": {
      "max_results": { "type": "number" }
    }
  }
```

#### 5. Call a Tool

**Inline JSON:**
```bash
mcp-cli notebooklm-mcp/notebook_list '{"max_results": 5}'
```

**From stdin (recommended for complex JSON):**
```bash
# Using heredoc
mcp-cli notebooklm-mcp/notebook_query - <<EOF
{
  "notebook_id": "abc123",
  "query": "What are the key findings about first-fold optimization?",
  "session_id": "test-001"
}
EOF

# From file
cat query.json | mcp-cli expert-panel/Product_Manager -

# Using echo
echo '{"query": "Review this PRD", "session_id": "x"}' | mcp-cli expert-panel/Product_Manager -
```

**JSON output for scripting:**
```bash
mcp-cli notebooklm-mcp/notebook_list '{"max_results": 5}' --json | jq '.content[0].text'
```

### Workflow: Discover → Inspect → Execute

**Always follow this pattern when using unfamiliar tools:**

```bash
# 1. Discover: What servers and tools are available?
mcp-cli

# 2. Inspect: What parameters does this tool need?
mcp-cli expert-panel/Product_Manager

# 3. Execute: Call the tool with correct JSON
mcp-cli expert-panel/Product_Manager '{"query": "Help me write a PRD", "session_id": "test-123"}'
```

---

## AI Agent Integration

### Why AI Agents Should Use mcp-cli

1. **Context Window Efficiency**: Don't load 50+ tool schemas upfront
2. **Discovery Pattern**: AI can explore available tools dynamically
3. **Shell Integration**: Works with existing terminal tools
4. **Scriptable**: AI can write shell scripts combining multiple tools

### Option 1: System Prompt Integration

Add this to your AI agent's system prompt (Claude Code, VS Code Copilot Chat, etc.):

````markdown
## MCP Servers

You have access to MCP (Model Context Protocol) servers via the `mcp-cli` CLI tool.
MCP provides tools for interacting with external systems like NotebookLM, databases, and APIs.

### Available Commands

```bash
mcp-cli                              # List all servers and tool names
mcp-cli <server>                     # Show server tools and parameters
mcp-cli <server>/<tool>              # Get tool JSON schema and descriptions
mcp-cli <server>/<tool> '<json>'     # Call tool with JSON arguments
mcp-cli grep "<pattern>"             # Search tools by name (glob pattern)
```

**Add `-d` to include tool descriptions** (e.g., `mcp-cli <server> -d`)

### Workflow

1. **Discover**: Run `mcp-cli` to see available servers and tools, or `mcp-cli grep "<pattern>"` to search for tools by name (glob pattern)
2. **Inspect**: Run `mcp-cli <server> -d` or `mcp-cli <server>/<tool>` to get the full JSON input schema if required context is missing. If there are more than 5 MCP servers defined, don't use `-d` as it will print all tool descriptions and might exceed the context window.
3. **Execute**: Run `mcp-cli <server>/<tool> '<json>'` with correct arguments

### Rules

1. **Always check schema first**: Run `mcp-cli <server> -d` or `mcp-cli <server>/<tool>` before calling any tool
2. **Quote JSON arguments**: Wrap JSON in single quotes to prevent shell interpretation
3. **Use stdin for complex JSON**: For JSON with quotes or special characters, use stdin with `-`:
   ```bash
   mcp-cli server/tool - <<EOF
   {"content": "Text with 'quotes'"}
   EOF
   ```

### Examples

```bash
# List all available MCP servers and tools
mcp-cli

# View NotebookLM server tools
mcp-cli notebooklm-mcp

# Get tool schema
mcp-cli notebooklm-mcp/notebook_list

# Call a tool
mcp-cli notebooklm-mcp/notebook_list '{"max_results": 5}'

# Search for research-related tools
mcp-cli grep "*research*"
```
````

**Where to add:**
- **Claude Code**: `.claude/instructions.md` or project-specific instructions
- **VS Code Copilot Chat**: `chat.instructions.md` in workspace root
- **GitHub Copilot CLI**: System prompt configuration

### Option 2: Skill File (Claude Code, OpenCode, Gemini CLI)

Create `.claude/skills/mcp-cli/SKILL.md` (or equivalent) with the same content as Option 1.

### Integration Example

**User request:**
```
"Can you research first-fold optimization and create a notebook about it?"
```

**AI agent workflow:**
```bash
# 1. Discover available tools
mcp-cli grep "*notebook*"

# 2. Inspect notebook creation tool
mcp-cli notebooklm-mcp/notebook_create

# 3. Create notebook
mcp-cli notebooklm-mcp/notebook_create '{"title": "First-Fold Optimization Research"}'

# 4. Start research
mcp-cli notebooklm-mcp/research_start '{"notebook_id": "abc123", "query": "first-fold optimization in modern web development"}'
```

---

## Troubleshooting

### Common Issues

#### 1. Command Not Found

**Error:**
```bash
mcp-cli: command not found
```

**Solutions:**
```bash
# Check if installed
ls -la ~/.local/bin/mcp-cli

# Add to PATH temporarily
export PATH="$HOME/.local/bin:$PATH"

# Add to PATH permanently
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Or use full path
~/.local/bin/mcp-cli
```

#### 2. Config File Not Found

**Error:**
```
Error [CONFIG_NOT_FOUND]: Config file not found
```

**Solutions:**
```bash
# Create config directory
mkdir -p ~/.config/mcp

# Create config file
cat > ~/.config/mcp/mcp_servers.json <<EOF
{
  "mcpServers": {}
}
EOF

# Or specify config path
mcp-cli -c /path/to/config.json
```

#### 3. Server Connection Failed (HTTP)

**Error:**
```
Error [SERVER_CONNECTION_FAILED]: Failed to connect to server "expert-panel"
Details: 404 - webhook not registered
```

**Solutions:**
1. **Verify URL is correct**: Check VS Code MCP config or n8n workflow URL
2. **Ensure workflow is active**: In n8n, toggle workflow to active state
3. **Test URL directly**: `curl -X POST <url>` to verify endpoint responds

**Example fix:**
```json
// Wrong (includes /webhook/ path)
"url": "https://workflows.moneysmart.co/mcp/webhook/abc-123"

// Correct (production URL)
"url": "https://workflows.moneysmart.co/mcp/abc-123"
```

#### 4. Invalid JSON Arguments

**Error:**
```
Error [INVALID_JSON_ARGUMENTS]: Invalid JSON in tool arguments
```

**Solutions:**
```bash
# ❌ Wrong: unquoted JSON
mcp-cli server/tool {"key": "value"}

# ✅ Correct: single quotes around JSON
mcp-cli server/tool '{"key": "value"}'

# ✅ Best: Use stdin for complex JSON
mcp-cli server/tool - <<EOF
{"key": "value with 'quotes'"}
EOF
```

#### 5. Tool Not Found

**Error:**
```
Error [TOOL_NOT_FOUND]: Tool "search" not found in server "filesystem"
```

**Solutions:**
```bash
# List available tools
mcp-cli filesystem

# Search for similar tools
mcp-cli grep "*search*"

# Check spelling and server name
mcp-cli <correct-server>/<correct-tool>
```

### Debugging

**Enable debug mode:**
```bash
MCP_DEBUG=true mcp-cli expert-panel
```

**Check config syntax:**
```bash
cat ~/.config/mcp/mcp_servers.json | python3 -m json.tool
```

**Test server manually:**
```bash
# For stdio servers
/path/to/mcp-server

# For HTTP servers
curl -X POST https://your-mcp-url
```

---

## Complete Examples

### Example 1: NotebookLM Research Workflow

```bash
# 1. List all notebooks
mcp-cli notebooklm-mcp/notebook_list '{"max_results": 10}'

# 2. Create new notebook
mcp-cli notebooklm-mcp/notebook_create '{"title": "AI Agent Research"}'
# Returns: {"notebook_id": "abc123"}

# 3. Add content sources
mcp-cli notebooklm-mcp/notebook_add_url - <<EOF
{
  "notebook_id": "abc123",
  "url": "https://example.com/article",
  "title": "AI Agent Best Practices"
}
EOF

# 4. Start deep research
mcp-cli notebooklm-mcp/research_start - <<EOF
{
  "notebook_id": "abc123",
  "query": "How do AI agents optimize context window usage?",
  "depth": "deep"
}
EOF

# 5. Query the notebook
mcp-cli notebooklm-mcp/notebook_query - <<EOF
{
  "notebook_id": "abc123",
  "query": "Summarize the key findings about context optimization",
  "session_id": "research-001"
}
EOF
```

### Example 2: Expert Panel Consultation

```bash
# 1. Discover available experts
mcp-cli expert-panel

# 2. Get product management advice
mcp-cli expert-panel/Product_Manager - <<EOF
{
  "query": "Help me write a PRD for an AI-powered coding assistant",
  "session_id": "prd-001"
}
EOF

# 3. Get UX feedback
mcp-cli expert-panel/UX_Architect - <<EOF
{
  "query": "Review the user flow for the coding assistant interface",
  "session_id": "ux-001"
}
EOF

# 4. Get technical architecture review
mcp-cli expert-panel/Backend_Architect - <<EOF
{
  "query": "Design the API architecture for real-time code completion",
  "session_id": "arch-001"
}
EOF
```

### Example 3: Scripting and Automation

```bash
#!/bin/bash
# research_pipeline.sh - Automated research workflow

TOPIC="$1"
SESSION_ID="$(date +%s)"

echo "Starting research on: $topic"

# Create notebook
NOTEBOOK_ID=$(mcp-cli notebooklm-mcp/notebook_create "{\"title\": \"$TOPIC Research\"}" --json | jq -r '.notebook_id')

echo "Created notebook: $NOTEBOOK_ID"

# Start research
mcp-cli notebooklm-mcp/research_start - <<EOF
{
  "notebook_id": "$NOTEBOOK_ID",
  "query": "$TOPIC",
  "depth": "deep"
}
EOF

# Poll research status
while true; do
  STATUS=$(mcp-cli notebooklm-mcp/research_status "{\"notebook_id\": \"$NOTEBOOK_ID\"}" --json | jq -r '.status')
  
  if [ "$STATUS" = "completed" ]; then
    echo "Research complete!"
    break
  fi
  
  echo "Research in progress... ($STATUS)"
  sleep 10
done

# Get summary
mcp-cli notebooklm-mcp/notebook_query - <<EOF
{
  "notebook_id": "$NOTEBOOK_ID",
  "query": "Provide a comprehensive summary of all research findings",
  "session_id": "$SESSION_ID"
}
EOF
```

---

## Configuration File Locations Summary

| System | Config File Path |
|--------|-----------------|
| **mcp-cli** | `~/.config/mcp/mcp_servers.json` |
| **VS Code MCPs** | `~/Library/Application Support/Code/User/mcp.json` |
| **GitHub Copilot CLI** | `~/.copilot/mcp-config.json` |

**Note:** These are **separate** configurations. Changes to one do not affect the others.

---

## Key Takeaways

1. **Install mcp-cli**: `curl -fsSL https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh | bash`
2. **Add to PATH**: `export PATH="$HOME/.local/bin:$PATH"` (add to `~/.zshrc` permanently)
3. **Configure MCPs**: Create `~/.config/mcp/mcp_servers.json`
4. **Supports both transports**: stdio (local) and HTTP (remote) MCP servers
5. **Workflow**: Discover → Inspect → Execute
6. **Always quote JSON**: Use single quotes: `'{"key": "value"}'`
7. **Use stdin for complex JSON**: `mcp-cli server/tool - <<EOF`
8. **For AI agents**: Add system prompt integration to enable automatic usage

---

## References

- **mcp-cli GitHub**: https://github.com/philschmid/mcp-cli
- **MCP Specification**: https://modelcontextprotocol.io/
- **Installation Script**: https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh
- **Skill Template**: https://github.com/philschmid/mcp-cli/blob/main/SKILL.md

---

**Document Version:** 1.0  
**Last Updated:** January 10, 2026  
**Author:** AI Agent Training Documentation
