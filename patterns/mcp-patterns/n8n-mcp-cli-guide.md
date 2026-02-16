# n8n-MCP via CLI - Complete Guide for AI Agents

> **Purpose**: Comprehensive guide for AI agents to use n8n-MCP through mcp-cli for workflow automation, node discovery, and configuration validation.

## Table of Contents

1. [What is n8n-MCP?](#what-is-n8n-mcp)
2. [Why Use n8n-MCP via CLI?](#why-use-n8n-mcp-via-cli)
3. [Installation & Configuration](#installation--configuration)
4. [Available Tools](#available-tools)
5. [Usage Patterns](#usage-patterns)
6. [Common Workflows](#common-workflows)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)
9. [Examples Library](#examples-library)

---

## What is n8n-MCP?

**n8n-MCP** is a Model Context Protocol server that provides AI assistants with comprehensive access to **n8n's workflow automation platform**. It enables AI agents to discover, understand, and work with n8n's extensive node ecosystem without needing to parse massive documentation files.

**Key Features:**
- 📚 **1,084 n8n nodes** - 537 core nodes + 547 community nodes (301 verified)
- 🔧 **99% property coverage** - Detailed schemas for node configuration
- ⚡ **63.6% operations coverage** - Available actions documented
- 💡 **2,646 real-world examples** - Pre-extracted configurations from popular templates
- 🎯 **2,709 workflow templates** - Complete template library with metadata
- 🤖 **265 AI-capable nodes** - Detected tool variants with full documentation
- ✅ **Smart validation** - Multi-level configuration validation system
- 🚀 **Fast response** - Average query time ~12ms with optimized SQLite

**Official Repository:** https://github.com/czlonkowski/n8n-mcp

---

## Why Use n8n-MCP via CLI?

### Context Window Efficiency

Loading n8n-MCP directly in VS Code/Copilot Chat:
- **7 tools** + schemas + 1,084 node definitions loaded into context
- Consumes thousands of tokens upfront
- Always present even when not needed

Using via mcp-cli:
- Tools discovered on-demand via `mcp-cli n8n-mcp`
- Only load schemas when calling specific tools
- **95%+ reduction in context usage**

### Scriptability & Automation

```bash
# Search for nodes in scripts
NODES=$(mcp-cli n8n-mcp/search_nodes '{"query": "database", "limit": 10}')

# Get node configuration
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.postgres"}' | jq '.properties'

# Validate workflow before deployment
mcp-cli n8n-mcp/validate_workflow - <<EOF
{
  "workflow": {...}
}
EOF

# Build CI/CD pipelines
./validate-n8n-config.sh
```

---

## Installation & Configuration

### Prerequisites

- **Docker** installed and running on your system
- **mcp-cli** installed (see [MCP-CLI-GUIDE.md](MCP-CLI-GUIDE.md))
- Internet connection (for initial Docker image pull)

### Step 1: Pull Docker Image

```bash
# Pull the optimized n8n-mcp image (~280MB)
docker pull ghcr.io/czlonkowski/n8n-mcp:latest
```

**Image Benefits:**
- 🚀 **82% smaller** than typical n8n images
- 📦 **No n8n dependencies** - just runtime MCP server
- 💾 **Pre-built database** - all node info included
- ⚡ **Fast startup** - ready in seconds

### Step 2: Configure mcp-cli

Add to `~/.config/mcp/mcp_servers.json`:

#### Basic Configuration (Documentation Only)

```json
{
  "mcpServers": {
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
}
```

**Configuration Flags:**
- `-i` - Interactive mode (required for stdio MCP communication)
- `--rm` - Auto-remove container after execution
- `--init` - Proper signal handling for clean shutdown
- `MCP_MODE=stdio` - Use stdio transport for mcp-cli
- `LOG_LEVEL=error` - Minimize output noise
- `DISABLE_CONSOLE_OUTPUT=true` - Clean JSON-RPC output

#### Full Configuration (With n8n API Integration)

If you have an n8n instance, add API credentials:

```json
{
  "mcpServers": {
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
        "-e", "N8N_API_URL=https://your-n8n-instance.com",
        "-e", "N8N_API_KEY=your-api-key-here",
        "ghcr.io/czlonkowski/n8n-mcp:latest"
      ]
    }
  }
}
```

**With n8n API, you get 13 additional tools:**
- Workflow management (create, update, delete, list)
- Execution management (trigger, monitor, delete)
- Template deployment
- Version control
- Health checks

### Step 3: Verify Installation

```bash
# List available tools
mcp-cli n8n-mcp

# Test search functionality
mcp-cli n8n-mcp/search_nodes '{"query": "slack", "limit": 3}'

# Get node details
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.slack"}'
```

---

## Available Tools

n8n-MCP provides **7 core tools** (+ 13 optional tools with n8n API).

### Core Tools (Always Available)

#### 1. `tools_documentation`

**Purpose:** Get comprehensive documentation for any n8n-MCP tool.

**Parameters:**
```json
{
  "topic": "string (optional)",  // Specific tool name
  "depth": "string (optional)"   // "overview" | "full" (default: full)
}
```

**Use when:**
- Learning how to use a specific tool
- Understanding parameter requirements
- Getting usage examples

**Example:**
```bash
# Get overview of all tools
mcp-cli n8n-mcp/tools_documentation '{"depth": "overview"}'

# Get detailed docs for search_nodes
mcp-cli n8n-mcp/tools_documentation '{"topic": "search_nodes"}'
```

---

#### 2. `search_nodes`

**Purpose:** Full-text search across all 1,084 n8n nodes (core + community).

**Parameters:**
```json
{
  "query": "string (required)",           // Search keywords
  "limit": "number (optional, default: 10)",
  "mode": "string (optional)",            // "standard" | "detailed"
  "includeExamples": "boolean (optional)", // Include real-world configs
  "source": "string (optional)"           // "all" | "core" | "community" | "verified"
}
```

**Use when:**
- Finding nodes for a specific integration (e.g., "slack", "postgres")
- Discovering available triggers (e.g., "webhook trigger")
- Searching by functionality (e.g., "send email", "database query")

**Example:**
```bash
# Search for Slack nodes
mcp-cli n8n-mcp/search_nodes '{"query": "slack", "limit": 5}'

# Search with examples
mcp-cli n8n-mcp/search_nodes '{"query": "http request", "includeExamples": true}'

# Search community nodes only
mcp-cli n8n-mcp/search_nodes '{"query": "scraping", "source": "community"}'

# Search verified community nodes
mcp-cli n8n-mcp/search_nodes '{"query": "pdf", "source": "verified"}'
```

**Output:**
```json
{
  "query": "slack",
  "results": [
    {
      "nodeType": "nodes-base.slack",
      "workflowNodeType": "n8n-nodes-base.slack",
      "displayName": "Slack",
      "description": "Consume Slack API",
      "category": "output",
      "package": "n8n-nodes-base",
      "relevance": "high"
    }
  ],
  "totalCount": 3
}
```

---

#### 3. `get_node`

**Purpose:** Unified node information retrieval with multiple modes.

**Parameters:**
```json
{
  "nodeType": "string (required)",         // e.g., "n8n-nodes-base.slack"
  "detail": "string (optional)",           // "minimal" | "standard" | "full"
  "mode": "string (optional)",             // "info" | "docs" | "search_properties" | "versions"
  "includeExamples": "boolean (optional)", // Include template configs
  "propertyQuery": "string (optional)",    // For search_properties mode
  "fromVersion": "string (optional)",      // For version comparison
  "toVersion": "string (optional)"         // For version comparison
}
```

**Modes:**

1. **Info Mode (default):** Get node properties and configuration
   - `detail: "minimal"` - Basic metadata (~200 tokens)
   - `detail: "standard"` - Essential properties (default, ~800 tokens)
   - `detail: "full"` - Complete information (~3000-8000 tokens)

2. **Docs Mode:** Human-readable markdown documentation
   - `mode: "docs"` - Get formatted documentation

3. **Search Properties Mode:** Find specific properties
   - `mode: "search_properties"`
   - `propertyQuery: "authentication"` - Search query

4. **Versions Mode:** View version history
   - `mode: "versions"` - All versions with summary
   - `mode: "compare"` - Compare two versions
   - `mode: "breaking"` - Breaking changes only
   - `mode: "migrations"` - Migration guides

**Examples:**
```bash
# Get standard node info
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.slack"}'

# Get full details with examples
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.httpRequest", "detail": "full", "includeExamples": true}'

# Get human-readable docs
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.slack", "mode": "docs"}'

# Search for auth properties
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.httpRequest", "mode": "search_properties", "propertyQuery": "auth"}'

# View version history
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.slack", "mode": "versions"}'
```

---

#### 4. `validate_node`

**Purpose:** Validate node configurations before deployment.

**Parameters:**
```json
{
  "nodeType": "string (required)",    // Node type to validate
  "config": "object (required)",      // Node configuration object
  "mode": "string (optional)",        // "minimal" | "full" (default: minimal)
  "profile": "string (optional)"      // "minimal" | "runtime" | "ai-friendly" | "strict"
}
```

**Modes:**

1. **Minimal Mode (quick check):**
   - Validates required fields only
   - Fast (<100ms)
   - Use before building workflows

2. **Full Mode (comprehensive validation):**
   - All fields, dependencies, conditionals
   - Includes profile-specific checks
   - Use before deployment

**Profiles (Full Mode):**
- `minimal` - Required fields + basic types
- `runtime` - Production-ready validation (default)
- `ai-friendly` - Helps AI agents avoid common mistakes
- `strict` - All validation rules enforced

**Examples:**
```bash
# Quick validation
mcp-cli n8n-mcp/validate_node - <<EOF
{
  "nodeType": "n8n-nodes-base.slack",
  "config": {
    "resource": "message",
    "operation": "post"
  },
  "mode": "minimal"
}
EOF

# Full validation with runtime profile
mcp-cli n8n-mcp/validate_node - <<EOF
{
  "nodeType": "n8n-nodes-base.httpRequest",
  "config": {
    "method": "POST",
    "url": "https://api.example.com",
    "authentication": "none"
  },
  "mode": "full",
  "profile": "runtime"
}
EOF
```

**Output:**
```json
{
  "valid": false,
  "errors": [
    {
      "field": "channelId",
      "message": "Required when 'select' is 'channel'",
      "severity": "error"
    }
  ],
  "warnings": [
    {
      "field": "text",
      "message": "Consider using expressions for dynamic content",
      "severity": "warning"
    }
  ]
}
```

---

#### 5. `search_templates`

**Purpose:** Unified template search with multiple modes.

**Parameters:**
```json
{
  "searchMode": "string (optional)",      // "keyword" | "by_nodes" | "by_task" | "by_metadata"
  "query": "string (optional)",           // For keyword search
  "nodeTypes": "array (optional)",        // For by_nodes search
  "task": "string (optional)",            // For by_task search
  "category": "string (optional)",        // Filter by category
  "complexity": "string (optional)",      // "simple" | "intermediate" | "advanced"
  "requiredService": "string (optional)", // e.g., "slack", "openai"
  "targetAudience": "string (optional)",  // "marketers" | "developers" | "analysts"
  "limit": "number (optional, default: 10)",
  "offset": "number (optional, default: 0)"
}
```

**Search Modes:**

1. **Keyword Search (default):**
   - `searchMode: "keyword"`
   - `query: "slack notification"`

2. **By Nodes:**
   - `searchMode: "by_nodes"`
   - `nodeTypes: ["n8n-nodes-base.slack", "n8n-nodes-base.webhook"]`

3. **By Task (curated):**
   - `searchMode: "by_task"`
   - `task: "webhook_processing"` | `"slack_integration"` | `"email_automation"`

4. **By Metadata (smart filtering):**
   - `searchMode: "by_metadata"`
   - `complexity: "simple"`, `requiredService: "slack"`, etc.

**Examples:**
```bash
# Keyword search
mcp-cli n8n-mcp/search_templates '{"query": "slack notification"}'

# Find templates using specific nodes
mcp-cli n8n-mcp/search_templates '{"searchMode": "by_nodes", "nodeTypes": ["n8n-nodes-base.slack"]}'

# Curated task-based search
mcp-cli n8n-mcp/search_templates '{"searchMode": "by_task", "task": "webhook_processing"}'

# Smart filtering
mcp-cli n8n-mcp/search_templates - <<EOF
{
  "searchMode": "by_metadata",
  "complexity": "simple",
  "requiredService": "slack",
  "targetAudience": "marketers",
  "limit": 5
}
EOF
```

**Output:**
```json
{
  "templates": [
    {
      "id": 2414,
      "name": "Send Slack notification on form submission",
      "description": "Automatically notify team when form submitted",
      "nodes": ["webhook", "slack"],
      "complexity": "simple",
      "author": {"name": "David Ashby", "username": "cfomodz"},
      "url": "https://n8n.io/workflows/2414"
    }
  ],
  "totalCount": 1
}
```

---

#### 6. `get_template`

**Purpose:** Retrieve complete workflow JSON from template library.

**Parameters:**
```json
{
  "templateId": "number (required)",  // Template ID from search_templates
  "mode": "string (optional)"         // "nodes_only" | "structure" | "full" (default)
}
```

**Modes:**
- `nodes_only` - Just node configurations
- `structure` - Nodes + connections topology
- `full` - Complete workflow JSON (default)

**Examples:**
```bash
# Get full template
mcp-cli n8n-mcp/get_template '{"templateId": 2414}'

# Get just structure
mcp-cli n8n-mcp/get_template '{"templateId": 2414, "mode": "structure"}'
```

**Output:**
```json
{
  "workflow": {
    "nodes": [...],
    "connections": {...},
    "settings": {...}
  },
  "metadata": {
    "author": {"name": "David Ashby", "username": "cfomodz"},
    "url": "https://n8n.io/workflows/2414"
  }
}
```

---

#### 7. `validate_workflow`

**Purpose:** Comprehensive workflow validation including AI Agent checks.

**Parameters:**
```json
{
  "workflow": "object (required)",  // Complete workflow JSON
  "options": "object (optional)"    // Validation options
}
```

**Validates:**
- ✅ Node configurations
- ✅ Connection validity
- ✅ Expression syntax
- ✅ AI Agent workflows (LangChain nodes)
- ✅ Missing language models
- ✅ AI tool connections
- ✅ Streaming mode constraints

**Example:**
```bash
mcp-cli n8n-mcp/validate_workflow - <<EOF
{
  "workflow": {
    "nodes": [
      {
        "id": "webhook-1",
        "type": "n8n-nodes-base.webhook",
        "parameters": {...}
      },
      {
        "id": "slack-1",
        "type": "n8n-nodes-base.slack",
        "parameters": {...}
      }
    ],
    "connections": {
      "webhook-1": {
        "main": [[{"node": "slack-1", "type": "main", "index": 0}]]
      }
    }
  }
}
EOF
```

**Output:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    {
      "message": "Consider adding error handling to HTTP node",
      "severity": "warning"
    }
  ]
}
```

---

### n8n Management Tools (Requires API Configuration)

These 13 tools are only available when `N8N_API_URL` and `N8N_API_KEY` are configured:

**Workflow Management:**
- `n8n_create_workflow` - Create new workflows
- `n8n_get_workflow` - Retrieve workflows by ID
- `n8n_update_full_workflow` - Complete workflow replacement
- `n8n_update_partial_workflow` - Diff-based updates
- `n8n_delete_workflow` - Delete workflows
- `n8n_list_workflows` - List with filtering
- `n8n_validate_workflow` - Validate by ID
- `n8n_autofix_workflow` - Auto-fix common errors
- `n8n_workflow_versions` - Version control
- `n8n_deploy_template` - Deploy from n8n.io

**Execution Management:**
- `n8n_test_workflow` - Trigger execution
- `n8n_executions` - Manage executions

**System:**
- `n8n_health_check` - Check API connectivity

---

## Usage Patterns

### Pattern 1: Discover → Get Details → Validate

**Always follow this workflow when working with n8n nodes:**

```bash
# Step 1: Discover available nodes
mcp-cli n8n-mcp/search_nodes '{"query": "database", "limit": 5}'

# Step 2: Get detailed node information
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.postgres", "detail": "standard"}'

# Step 3: Validate configuration
mcp-cli n8n-mcp/validate_node - <<EOF
{
  "nodeType": "n8n-nodes-base.postgres",
  "config": {
    "operation": "executeQuery",
    "query": "SELECT * FROM users"
  }
}
EOF
```

### Pattern 2: Template-First Approach

**Check templates before building from scratch:**

```bash
# Step 1: Search templates
mcp-cli n8n-mcp/search_templates '{"searchMode": "by_task", "task": "webhook_processing"}'

# Step 2: Get template details
mcp-cli n8n-mcp/get_template '{"templateId": 2414, "mode": "full"}'

# Step 3: Validate before use
mcp-cli n8n-mcp/validate_workflow - <<EOF
{
  "workflow": {...}
}
EOF
```

### Pattern 3: Property Discovery

**Find specific properties in nodes:**

```bash
# Search for authentication-related properties
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.httpRequest", "mode": "search_properties", "propertyQuery": "authentication"}'

# Search for credential properties
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.slack", "mode": "search_properties", "propertyQuery": "credential"}'
```

### Pattern 4: Version Comparison

**Check breaking changes between versions:**

```bash
# View all versions
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.httpRequest", "mode": "versions"}'

# Compare versions
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.httpRequest", "mode": "compare", "fromVersion": "1.0", "toVersion": "2.0"}'

# Get breaking changes only
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.httpRequest", "mode": "breaking"}'
```

---

## Common Workflows

### Workflow 1: Build Slack Notification Workflow

**Scenario:** Create a workflow that sends Slack notifications on webhook trigger.

```bash
#!/bin/bash
# build-slack-workflow.sh

echo "=== Step 1: Search for templates ==="
TEMPLATES=$(mcp-cli n8n-mcp/search_templates - <<EOF
{
  "searchMode": "by_metadata",
  "requiredService": "slack",
  "complexity": "simple"
}
EOF
)

TEMPLATE_ID=$(echo "$TEMPLATES" | jq -r '.templates[0].id')

echo "Found template: $TEMPLATE_ID"

echo -e "\n=== Step 2: Get template workflow ==="
WORKFLOW=$(mcp-cli n8n-mcp/get_template "{\"templateId\": $TEMPLATE_ID}")

echo -e "\n=== Step 3: Validate workflow ==="
VALIDATION=$(mcp-cli n8n-mcp/validate_workflow - <<EOF
{
  "workflow": $(echo "$WORKFLOW" | jq '.workflow')
}
EOF
)

if [ "$(echo "$VALIDATION" | jq -r '.valid')" = "true" ]; then
  echo "✅ Workflow is valid!"
  echo "$WORKFLOW" | jq '.workflow' > slack-workflow.json
  echo "Saved to: slack-workflow.json"
else
  echo "❌ Validation failed:"
  echo "$VALIDATION" | jq '.errors'
fi
```

---

### Workflow 2: Discover and Configure Database Node

**Scenario:** Find and configure a PostgreSQL node.

```bash
#!/bin/bash
# setup-postgres.sh

echo "=== Step 1: Search for database nodes ==="
mcp-cli n8n-mcp/search_nodes '{"query": "postgres", "limit": 3}'

echo -e "\n=== Step 2: Get node details with examples ==="
NODE_INFO=$(mcp-cli n8n-mcp/get_node - <<EOF
{
  "nodeType": "n8n-nodes-base.postgres",
  "detail": "standard",
  "includeExamples": true
}
EOF
)

echo "$NODE_INFO" | jq '.properties' > postgres-properties.json

echo -e "\n=== Step 3: Validate sample configuration ==="
mcp-cli n8n-mcp/validate_node - <<EOF
{
  "nodeType": "n8n-nodes-base.postgres",
  "config": {
    "operation": "executeQuery",
    "query": "SELECT * FROM users WHERE active = true"
  },
  "mode": "full",
  "profile": "runtime"
}
EOF
```

---

### Workflow 3: Find Community Nodes

**Scenario:** Discover verified community nodes for a specific use case.

```bash
#!/bin/bash
# find-community-nodes.sh

SEARCH_TERM="$1"

echo "Searching for community nodes: $SEARCH_TERM"

# Search verified community nodes
VERIFIED=$(mcp-cli n8n-mcp/search_nodes - <<EOF
{
  "query": "$SEARCH_TERM",
  "source": "verified",
  "limit": 10
}
EOF
)

# Search all community nodes
ALL_COMMUNITY=$(mcp-cli n8n-mcp/search_nodes - <<EOF
{
  "query": "$SEARCH_TERM",
  "source": "community",
  "limit": 10
}
EOF
)

echo -e "\n=== Verified Community Nodes ==="
echo "$VERIFIED" | jq -r '.results[] | "- \(.displayName) by \(.authorName) (\(.npmDownloads) downloads)"'

echo -e "\n=== All Community Nodes ==="
echo "$ALL_COMMUNITY" | jq -r '.results[] | "- \(.displayName)"'
```

---

### Workflow 4: Compare Node Versions

**Scenario:** Check what changed between node versions.

```bash
#!/bin/bash
# compare-versions.sh

NODE_TYPE="$1"
FROM_VERSION="$2"
TO_VERSION="$3"

echo "Comparing $NODE_TYPE: v$FROM_VERSION → v$TO_VERSION"

# Get breaking changes
echo -e "\n=== Breaking Changes ==="
mcp-cli n8n-mcp/get_node - <<EOF
{
  "nodeType": "$NODE_TYPE",
  "mode": "breaking",
  "fromVersion": "$FROM_VERSION",
  "toVersion": "$TO_VERSION"
}
EOF

# Get full comparison
echo -e "\n=== Full Comparison ==="
mcp-cli n8n-mcp/get_node - <<EOF
{
  "nodeType": "$NODE_TYPE",
  "mode": "compare",
  "fromVersion": "$FROM_VERSION",
  "toVersion": "$TO_VERSION"
}
EOF
```

---

### Workflow 5: Validate AI Agent Workflow

**Scenario:** Validate a LangChain AI Agent workflow.

```bash
#!/bin/bash
# validate-ai-workflow.sh

echo "=== Validating AI Agent Workflow ==="

mcp-cli n8n-mcp/validate_workflow - <<EOF
{
  "workflow": {
    "nodes": [
      {
        "id": "agent-1",
        "type": "@n8n/n8n-nodes-langchain.agent",
        "parameters": {
          "promptType": "define",
          "text": "You are a helpful assistant"
        }
      },
      {
        "id": "openai-1",
        "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
        "parameters": {
          "model": "gpt-4"
        }
      },
      {
        "id": "tool-1",
        "type": "@n8n/n8n-nodes-langchain.toolCode",
        "parameters": {
          "name": "calculator",
          "description": "Performs calculations"
        }
      }
    ],
    "connections": {
      "openai-1": {
        "ai_languageModel": [[{"node": "agent-1", "type": "ai_languageModel", "index": 0}]]
      },
      "tool-1": {
        "ai_tool": [[{"node": "agent-1", "type": "ai_tool", "index": 0}]]
      }
    }
  }
}
EOF
```

---

## Troubleshooting

### Issue 1: Docker Image Pull Failed

**Error:**
```
Error response from daemon: Get "https://ghcr.io/v2/": context deadline exceeded
```

**Cause:** Network timeout or Docker Hub rate limiting.

**Solutions:**

1. **Retry with longer timeout:**
```bash
DOCKER_CLIENT_TIMEOUT=300 docker pull ghcr.io/czlonkowski/n8n-mcp:latest
```

2. **Check Docker daemon:**
```bash
docker info
```

3. **Authenticate with GitHub Container Registry (if private):**
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

---

### Issue 2: Container Exits Immediately

**Error:**
```
Error: Container exited with code 1
```

**Cause:** Missing `-i` flag or incorrect environment variables.

**Solution:** Ensure configuration has `-i` flag:
```json
{
  "command": "docker",
  "args": [
    "run",
    "-i",        // ← REQUIRED for stdio
    "--rm",
    "--init",
    "-e", "MCP_MODE=stdio",
    "ghcr.io/czlonkowski/n8n-mcp:latest"
  ]
}
```

---

### Issue 3: Node Not Found

**Error:**
```json
{
  "error": "Node type 'slack' not found"
}
```

**Cause:** Incorrect node type format.

**Solution:** Use full node type name:
```bash
# Wrong
mcp-cli n8n-mcp/get_node '{"nodeType": "slack"}'

# Right
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.slack"}'

# Or search first to find exact name
mcp-cli n8n-mcp/search_nodes '{"query": "slack"}' | jq -r '.results[0].workflowNodeType'
```

---

### Issue 4: Validation Errors

**Symptom:** Node configuration fails validation but looks correct.

**Cause:** Missing required fields based on other field values (conditional requirements).

**Solution:** Use `mode: "full"` with `profile: "runtime"`:
```bash
# Minimal mode misses conditionals
mcp-cli n8n-mcp/validate_node - <<EOF
{
  "nodeType": "n8n-nodes-base.slack",
  "config": {
    "resource": "message",
    "operation": "post",
    "select": "channel"
  },
  "mode": "minimal"
}
EOF
# Returns: valid (WRONG - missing channelId)

# Full mode catches it
mcp-cli n8n-mcp/validate_node - <<EOF
{
  "nodeType": "n8n-nodes-base.slack",
  "config": {
    "resource": "message",
    "operation": "post",
    "select": "channel"
  },
  "mode": "full",
  "profile": "runtime"
}
EOF
# Returns: invalid - missing channelId (CORRECT)
```

---

### Issue 5: Template Search Returns Empty

**Symptom:** `search_templates` returns no results.

**Cause:** Too specific filters or incorrect searchMode.

**Solutions:**

1. **Broaden search:**
```bash
# Too specific
mcp-cli n8n-mcp/search_templates - <<EOF
{
  "searchMode": "by_metadata",
  "complexity": "simple",
  "requiredService": "stripe",
  "targetAudience": "developers",
  "maxSetupMinutes": 10
}
EOF

# Better - fewer filters
mcp-cli n8n-mcp/search_templates - <<EOF
{
  "searchMode": "by_metadata",
  "requiredService": "stripe"
}
EOF
```

2. **Try keyword search:**
```bash
mcp-cli n8n-mcp/search_templates '{"query": "stripe"}'
```

3. **Search by nodes:**
```bash
mcp-cli n8n-mcp/search_templates '{"searchMode": "by_nodes", "nodeTypes": ["n8n-nodes-base.stripe"]}'
```

---

### Issue 6: Memory Issues with Docker

**Symptom:** Docker container killed due to memory constraints.

**Cause:** Limited Docker memory allocation.

**Solution:** Increase Docker memory:
```bash
# Check current limits
docker stats

# Increase Docker Desktop memory in Settings → Resources
# Or run with memory limit
docker run -i --rm --init --memory=512m \
  -e MCP_MODE=stdio \
  ghcr.io/czlonkowski/n8n-mcp:latest
```

---

## Best Practices

### 1. Always Search Before Building

```bash
# DO: Check templates first
mcp-cli n8n-mcp/search_templates '{"searchMode": "by_task", "task": "webhook_processing"}'

# DON'T: Build from scratch without checking
# (You might reinvent existing templates)
```

### 2. Use Appropriate Detail Levels

```bash
# DO: Start with standard, escalate if needed
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.slack", "detail": "standard"}'

# If more details needed:
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.slack", "detail": "full"}'

# DON'T: Always use full (wastes tokens)
```

### 3. Validate at Multiple Levels

```bash
# DO: Multi-level validation
# Level 1: Quick check
mcp-cli n8n-mcp/validate_node '{"nodeType": "...", "config": {...}, "mode": "minimal"}'

# Level 2: Full validation
mcp-cli n8n-mcp/validate_node '{"nodeType": "...", "config": {...}, "mode": "full", "profile": "runtime"}'

# Level 3: Workflow validation
mcp-cli n8n-mcp/validate_workflow '{"workflow": {...}}'

# DON'T: Skip validation
```

### 4. Include Examples When Learning

```bash
# DO: Get examples when discovering nodes
mcp-cli n8n-mcp/search_nodes '{"query": "http", "includeExamples": true}'
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.httpRequest", "includeExamples": true}'

# DON'T: Skip examples (you'll miss real-world configs)
```

### 5. Use Proper Node Type Format

```bash
# DO: Use full node type
"n8n-nodes-base.slack"          # Core node
"@n8n/n8n-nodes-langchain.agent" # LangChain node
"@mbakgun/n8n-nodes-slack-socket-mode.SlackSocketMode" # Community node

# DON'T: Use partial names
"slack"      # Wrong
"nodes.slack" # Wrong
```

### 6. Leverage Search Filters

```bash
# DO: Use source filters effectively
mcp-cli n8n-mcp/search_nodes '{"query": "pdf", "source": "verified"}'  # Verified only
mcp-cli n8n-mcp/search_nodes '{"query": "scraping", "source": "community"}' # All community

# DON'T: Search all when you need specific
mcp-cli n8n-mcp/search_nodes '{"query": "pdf", "source": "all"}'  # Too broad
```

### 7. Cache Frequently Used Node Info

```bash
# DO: Cache node schemas for repeated use
mkdir -p ~/.n8n-mcp-cache
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.slack"}' > ~/.n8n-mcp-cache/slack.json

# Reuse cache
cat ~/.n8n-mcp-cache/slack.json

# DON'T: Fetch same node info repeatedly
```

---

## Examples Library

### Example 1: Find and Configure HTTP Request Node

```bash
#!/bin/bash
# setup-http-node.sh

echo "=== Step 1: Search for HTTP nodes ==="
mcp-cli n8n-mcp/search_nodes '{"query": "http request", "limit": 3}'

echo -e "\n=== Step 2: Get node schema ==="
mcp-cli n8n-mcp/get_node - <<EOF
{
  "nodeType": "n8n-nodes-base.httpRequest",
  "detail": "standard",
  "includeExamples": true
}
EOF

echo -e "\n=== Step 3: Validate POST request config ==="
mcp-cli n8n-mcp/validate_node - <<EOF
{
  "nodeType": "n8n-nodes-base.httpRequest",
  "config": {
    "method": "POST",
    "url": "https://api.example.com/data",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {"name": "key", "value": "value"}
      ]
    }
  },
  "mode": "full",
  "profile": "runtime"
}
EOF
```

---

### Example 2: Build Complete Workflow from Template

```bash
#!/bin/bash
# deploy-template.sh

TASK="$1"

echo "=== Searching for $TASK templates ==="
TEMPLATES=$(mcp-cli n8n-mcp/search_templates - <<EOF
{
  "searchMode": "by_task",
  "task": "$TASK",
  "limit": 5
}
EOF
)

# Show available templates
echo "$TEMPLATES" | jq -r '.templates[] | "[\(.id)] \(.name) by \(.author.name)"'

# Select first template
TEMPLATE_ID=$(echo "$TEMPLATES" | jq -r '.templates[0].id')

echo -e "\n=== Retrieving template $TEMPLATE_ID ==="
WORKFLOW=$(mcp-cli n8n-mcp/get_template "{\"templateId\": $TEMPLATE_ID, \"mode\": \"full\"}")

echo -e "\n=== Validating workflow ==="
VALIDATION=$(mcp-cli n8n-mcp/validate_workflow - <<EOF
{
  "workflow": $(echo "$WORKFLOW" | jq '.workflow')
}
EOF
)

if [ "$(echo "$VALIDATION" | jq -r '.valid')" = "true" ]; then
  echo "✅ Template is valid and ready to deploy"
  echo "$WORKFLOW" | jq '.workflow' > "workflow-${TEMPLATE_ID}.json"
  
  # Show attribution
  AUTHOR=$(echo "$WORKFLOW" | jq -r '.metadata.author.name')
  USERNAME=$(echo "$WORKFLOW" | jq -r '.metadata.author.username')
  URL=$(echo "$WORKFLOW" | jq -r '.metadata.url')
  
  echo -e "\n📝 Based on template by $AUTHOR (@$USERNAME)"
  echo "   View original: $URL"
else
  echo "❌ Validation failed:"
  echo "$VALIDATION" | jq '.errors'
fi
```

---

### Example 3: Search Community Integrations

```bash
#!/bin/bash
# find-integration.sh

SERVICE="$1"

echo "Finding integrations for: $SERVICE"

echo -e "\n=== Core Nodes ==="
CORE=$(mcp-cli n8n-mcp/search_nodes - <<EOF
{
  "query": "$SERVICE",
  "source": "core",
  "limit": 5
}
EOF
)
echo "$CORE" | jq -r '.results[] | "✓ \(.displayName) - \(.description)"'

echo -e "\n=== Verified Community Nodes ==="
VERIFIED=$(mcp-cli n8n-mcp/search_nodes - <<EOF
{
  "query": "$SERVICE",
  "source": "verified",
  "limit": 5
}
EOF
)
echo "$VERIFIED" | jq -r '.results[] | "✓ \(.displayName) by \(.authorName) (\(.npmDownloads) downloads)"'

echo -e "\n=== All Community Nodes ==="
COMMUNITY=$(mcp-cli n8n-mcp/search_nodes - <<EOF
{
  "query": "$SERVICE",
  "source": "community",
  "limit": 10
}
EOF
)
echo "$COMMUNITY" | jq -r '.results[] | "• \(.displayName)"'
```

---

### Example 4: Node Property Explorer

```bash
#!/bin/bash
# explore-properties.sh

NODE_TYPE="$1"
PROPERTY_QUERY="$2"

echo "Exploring properties of: $NODE_TYPE"

if [ -z "$PROPERTY_QUERY" ]; then
  # Get all properties
  echo -e "\n=== All Properties ==="
  mcp-cli n8n-mcp/get_node - <<EOF
{
  "nodeType": "$NODE_TYPE",
  "detail": "standard"
}
EOF | jq '.properties'
else
  # Search specific properties
  echo -e "\n=== Properties matching '$PROPERTY_QUERY' ==="
  mcp-cli n8n-mcp/get_node - <<EOF
{
  "nodeType": "$NODE_TYPE",
  "mode": "search_properties",
  "propertyQuery": "$PROPERTY_QUERY"
}
EOF
fi
```

**Usage:**
```bash
# View all properties
./explore-properties.sh "n8n-nodes-base.slack"

# Search for authentication properties
./explore-properties.sh "n8n-nodes-base.httpRequest" "auth"

# Search for credential properties
./explore-properties.sh "n8n-nodes-base.postgres" "credential"
```

---

### Example 5: Batch Node Validation

```bash
#!/bin/bash
# validate-nodes.sh

# Array of node configs to validate
declare -A NODES=(
  ["slack"]='{"nodeType":"n8n-nodes-base.slack","config":{"resource":"message","operation":"post","select":"channel","channelId":"C123","text":"Hello"}}'
  ["http"]='{"nodeType":"n8n-nodes-base.httpRequest","config":{"method":"GET","url":"https://api.example.com"}}'
  ["postgres"]='{"nodeType":"n8n-nodes-base.postgres","config":{"operation":"executeQuery","query":"SELECT * FROM users"}}'
)

echo "=== Validating ${#NODES[@]} node configurations ==="

for NODE_NAME in "${!NODES[@]}"; do
  echo -e "\n--- Validating $NODE_NAME ---"
  
  RESULT=$(mcp-cli n8n-mcp/validate_node - <<EOF
${NODES[$NODE_NAME]}
EOF
)
  
  if [ "$(echo "$RESULT" | jq -r '.valid')" = "true" ]; then
    echo "✅ $NODE_NAME: Valid"
  else
    echo "❌ $NODE_NAME: Invalid"
    echo "$RESULT" | jq '.errors'
  fi
done
```

---

### Example 6: AI Agent Workflow Builder

```bash
#!/bin/bash
# build-ai-agent.sh

echo "=== Building AI Agent Workflow ==="

# Step 1: Search for AI nodes
echo -e "\n--- Step 1: Finding AI nodes ---"
mcp-cli n8n-mcp/search_nodes '{"query": "langchain agent", "limit": 3}'

# Step 2: Get agent node details
echo -e "\n--- Step 2: Getting agent configuration ---"
AGENT_CONFIG=$(mcp-cli n8n-mcp/get_node - <<EOF
{
  "nodeType": "@n8n/n8n-nodes-langchain.agent",
  "detail": "standard",
  "includeExamples": true
}
EOF
)

# Step 3: Search for language models
echo -e "\n--- Step 3: Finding language models ---"
mcp-cli n8n-mcp/search_nodes '{"query": "openai chat", "limit": 3}'

# Step 4: Build workflow
echo -e "\n--- Step 4: Building workflow ---"
WORKFLOW=$(cat <<EOF
{
  "workflow": {
    "nodes": [
      {
        "id": "agent-1",
        "type": "@n8n/n8n-nodes-langchain.agent",
        "parameters": {
          "promptType": "define",
          "text": "You are a helpful assistant"
        }
      },
      {
        "id": "openai-1",
        "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
        "parameters": {
          "model": "gpt-4"
        }
      }
    ],
    "connections": {
      "openai-1": {
        "ai_languageModel": [[{"node": "agent-1", "type": "ai_languageModel", "index": 0}]]
      }
    }
  }
}
EOF
)

# Step 5: Validate AI workflow
echo -e "\n--- Step 5: Validating AI workflow ---"
mcp-cli n8n-mcp/validate_workflow - <<EOF
$WORKFLOW
EOF
```

---

## Quick Reference

### Essential Commands

```bash
# List all tools
mcp-cli n8n-mcp

# Get tool documentation
mcp-cli n8n-mcp/tools_documentation '{"topic": "search_nodes"}'

# Search nodes
mcp-cli n8n-mcp/search_nodes '{"query": "slack", "limit": 5}'

# Get node details
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.slack"}'

# Get with examples
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.httpRequest", "includeExamples": true}'

# Search properties
mcp-cli n8n-mcp/get_node '{"nodeType": "n8n-nodes-base.httpRequest", "mode": "search_properties", "propertyQuery": "auth"}'

# Validate node (quick)
mcp-cli n8n-mcp/validate_node '{"nodeType": "...", "config": {...}, "mode": "minimal"}'

# Validate node (full)
mcp-cli n8n-mcp/validate_node '{"nodeType": "...", "config": {...}, "mode": "full", "profile": "runtime"}'

# Search templates
mcp-cli n8n-mcp/search_templates '{"searchMode": "by_task", "task": "webhook_processing"}'

# Get template
mcp-cli n8n-mcp/get_template '{"templateId": 2414}'

# Validate workflow
mcp-cli n8n-mcp/validate_workflow '{"workflow": {...}}'
```

---

## Key Takeaways for AI Agents

1. **Template-first approach** - Always check 2,709 templates before building from scratch
2. **Use full node type names** - `n8n-nodes-base.slack`, not just `slack`
3. **Multi-level validation** - minimal → full → workflow
4. **Include examples when learning** - `includeExamples: true` gives real configs
5. **Search by source** - `source: "verified"` for quality community nodes
6. **Use appropriate detail levels** - standard for most cases, full only when needed
7. **Docker stdio transport** - Each command runs fresh container (no persistence)
8. **Property search** - `mode: "search_properties"` to find specific settings
9. **Version awareness** - Check breaking changes with `mode: "breaking"`
10. **AI Agent validation** - Special checks for LangChain workflows

---

## Additional Resources

- **n8n-MCP GitHub**: https://github.com/czlonkowski/n8n-mcp
- **n8n Documentation**: https://docs.n8n.io/
- **n8n Template Gallery**: https://n8n.io/workflows/
- **MCP Specification**: https://modelcontextprotocol.io/
- **mcp-cli Guide**: See [MCP-CLI-GUIDE.md](MCP-CLI-GUIDE.md) in this repository

---

**Document Version:** 1.0  
**Last Updated:** January 10, 2026  
**Author:** AI Agent Training Documentation
