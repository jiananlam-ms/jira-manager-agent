# Playwright MCP via CLI - Complete Guide for AI Agents

> **Purpose**: Comprehensive guide for AI agents to use Playwright MCP through mcp-cli for browser automation tasks.

## Table of Contents

1. [What is Playwright MCP?](#what-is-playwright-mcp)
2. [Why Use Playwright MCP via CLI?](#why-use-playwright-mcp-via-cli)
3. [Installation & Configuration](#installation--configuration)
4. [Transport Modes](#transport-modes)
5. [Available Tools](#available-tools)
6. [Usage Patterns](#usage-patterns)
7. [Common Workflows](#common-workflows)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## What is Playwright MCP?

**Playwright MCP** is a Model Context Protocol server that provides browser automation capabilities using [Playwright](https://playwright.dev/). Unlike traditional browser automation that relies on screenshots and vision models, Playwright MCP uses **accessibility tree snapshots** for deterministic, structured interactions.

**Key Features:**
- 🚀 **Fast & Lightweight** - Uses accessibility tree, not pixel-based input
- 🎯 **LLM-Friendly** - Operates on structured data, no vision models needed
- ✅ **Deterministic** - Avoids ambiguity common with screenshot-based approaches
- 🌐 **Full Browser Control** - Navigate, click, type, screenshot, evaluate JS, etc.

**GitHub Repository:** https://github.com/microsoft/playwright-mcp

---

## Why Use Playwright MCP via CLI?

### Context Window Efficiency

Loading Playwright MCP directly in VS Code/Copilot Chat:
- **22 tools** loaded into context window
- Consumes thousands of tokens upfront
- Always present even when not needed

Using via mcp-cli:
- Tools discovered on-demand via `mcp-cli playwright`
- Only load schemas when calling specific tools
- **90%+ reduction in context usage**

### Scriptability & Automation

```bash
# Chain browser operations with shell commands
mcp-cli playwright/browser_navigate '{"url": "https://example.com"}' && \
mcp-cli playwright/browser_snapshot '{}' | grep "specific-text"

# Use in CI/CD pipelines
mcp-cli playwright/browser_take_screenshot '{"filename": "homepage.png"}'
```

---

## Installation & Configuration

### Step 1: Install Playwright MCP

Playwright MCP is distributed as an npm package and can be run via `npx`:

```bash
# Verify it works
npx @playwright/mcp@latest --help
```

**No separate installation needed** - `npx` downloads it automatically.

### Step 2: Configure mcp-cli

Add to `~/.config/mcp/mcp_servers.json`:

#### Option A: Stdio Transport (Simple, Single-Action)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

**Characteristics:**
- ✅ Simple configuration
- ✅ Works for single browser actions
- ❌ Browser closes after each command
- ❌ No session persistence between commands

#### Option B: HTTP Transport (Persistent Sessions)

**1. Start Playwright MCP as standalone HTTP server:**

```bash
# Basic HTTP mode
npx @playwright/mcp@latest --port 8931 &

# With shared browser context (RECOMMENDED)
npx @playwright/mcp@latest --port 8931 --shared-browser-context &

# With headless mode
npx @playwright/mcp@latest --port 8931 --shared-browser-context --headless &
```

**2. Configure mcp-cli to use HTTP endpoint:**

```json
{
  "mcpServers": {
    "playwright": {
      "url": "http://localhost:8931/mcp"
    }
  }
}
```

**Characteristics:**
- ✅ Browser stays open between commands
- ✅ Session persistence (with `--shared-browser-context`)
- ✅ Enables multi-step workflows
- ⚠️ Requires standalone server process

---

## Transport Modes

### Stdio vs HTTP: When to Use Each

| Feature | Stdio Transport | HTTP Transport |
|---------|----------------|----------------|
| **Setup** | Simple (add to config) | Requires server process |
| **Browser Persistence** | ❌ Closes after each command | ✅ Stays open (with `--shared-browser-context`) |
| **Session State** | ❌ Lost between commands | ✅ Preserved between commands |
| **Use Case** | Single-action tasks | Multi-step workflows |
| **Example** | Take a screenshot | Navigate → Type → Click → Extract data |

### Shared Browser Context Flag

**Critical for multi-step workflows:**

```bash
npx @playwright/mcp@latest --port 8931 --shared-browser-context &
```

**What it does:**
- Shares the same browser context across all HTTP clients
- Preserves page state between mcp-cli commands
- Enables persistent sessions

**Without this flag:**
- Each mcp-cli command gets a fresh browser context
- Page state is lost between commands
- Element references become invalid

---

## Available Tools

Playwright MCP provides **22 tools** organized by category:

### Navigation
- `browser_navigate` - Go to a URL
- `browser_navigate_back` - Go back in history
- `browser_tabs` - Manage tabs (create, switch, close)

### Interaction
- `browser_click` - Click an element by reference
- `browser_type` - Type text into an element
- `browser_fill_form` - Fill multiple form fields at once
- `browser_press_key` - Press keyboard keys
- `browser_drag` - Drag and drop elements
- `browser_hover` - Hover over an element
- `browser_select_option` - Select dropdown options

### Inspection
- `browser_snapshot` - Get current page accessibility snapshot
- `browser_take_screenshot` - Capture screenshot
- `browser_console_messages` - Retrieve console logs
- `browser_network_requests` - Get network activity

### Advanced
- `browser_evaluate` - Execute JavaScript in page context
- `browser_run_code` - Run arbitrary Playwright code
- `browser_file_upload` - Upload files to file inputs
- `browser_handle_dialog` - Handle alerts/confirms/prompts
- `browser_wait_for` - Wait for conditions

### Management
- `browser_close` - Close the browser
- `browser_resize` - Change viewport size
- `browser_install` - Install browser binaries

---

## Usage Patterns

### Pattern 1: Discover → Inspect → Execute

**Always follow this workflow when using unfamiliar tools:**

```bash
# 1. Discover: What tools are available?
mcp-cli playwright

# 2. Inspect: What parameters does browser_navigate need?
mcp-cli playwright/browser_navigate

# 3. Execute: Call the tool
mcp-cli playwright/browser_navigate '{"url": "https://example.com"}'
```

### Pattern 2: Element References

Playwright MCP uses **accessibility tree references** (refs) to identify elements:

```bash
# 1. Navigate to a page
mcp-cli playwright/browser_navigate '{"url": "https://www.google.com"}'

# Output includes:
# - combobox "Search" [ref=e42]
# - button "Google Search" [ref=e65]

# 2. Use the ref to interact
mcp-cli playwright/browser_type '{"element": "combobox", "ref": "e42", "text": "hello world", "submit": true}'
```

**Important:** Refs are **session-specific** and **page-specific**. They become invalid when:
- Page navigates to a new URL
- Browser context resets
- Page reloads

**Solution:** Always capture a fresh snapshot after navigation:
```bash
mcp-cli playwright/browser_snapshot '{}'
```

### Pattern 3: Multi-Step Workflows (HTTP Mode Required)

**Setup:**
```bash
# Terminal 1: Start server
npx @playwright/mcp@latest --port 8931 --shared-browser-context &

# Terminal 2: Execute commands
```

**Workflow:**
```bash
# Step 1: Navigate
mcp-cli playwright/browser_navigate '{"url": "https://www.google.com"}'

# Step 2: Get current state
mcp-cli playwright/browser_snapshot '{}'
# Note the search box ref: e42

# Step 3: Search
mcp-cli playwright/browser_type '{"element": "combobox", "ref": "e42", "text": "MCP servers", "submit": true}'

# Step 4: Screenshot results
mcp-cli playwright/browser_take_screenshot '{"filename": "search-results.png"}'

# Step 5: Click first result
mcp-cli playwright/browser_click '{"element": "link", "ref": "e467"}'
```

---

## Common Workflows

### Workflow 1: Take Screenshot of a Website

**Stdio mode (simple):**
```bash
# Single command - browser opens, screenshots, closes
mcp-cli playwright/browser_navigate '{"url": "https://example.com"}' && \
sleep 2 && \
mcp-cli playwright/browser_take_screenshot '{"filename": "example.png"}'
```

**HTTP mode (better):**
```bash
# Start server once
npx @playwright/mcp@latest --port 8931 &

# Navigate
mcp-cli playwright/browser_navigate '{"url": "https://example.com"}'

# Wait for page to load, then screenshot
sleep 2
mcp-cli playwright/browser_take_screenshot '{"filename": "example.png", "fullPage": true}'

# Close browser
mcp-cli playwright/browser_close '{}'
```

### Workflow 2: Web Scraping

```bash
# 1. Navigate to page
mcp-cli playwright/browser_navigate '{"url": "https://news.ycombinator.com"}'

# 2. Get page snapshot
mcp-cli playwright/browser_snapshot '{}' > hn-snapshot.txt

# 3. Extract data with JavaScript
mcp-cli playwright/browser_evaluate - <<EOF
{
  "function": "() => Array.from(document.querySelectorAll('.titleline > a')).map(a => ({title: a.textContent, url: a.href}))"
}
EOF

# 4. Close browser
mcp-cli playwright/browser_close '{}'
```

### Workflow 3: Form Submission

```bash
# Start server with persistent context
npx @playwright/mcp@latest --port 8931 --shared-browser-context &

# 1. Navigate to login page
mcp-cli playwright/browser_navigate '{"url": "https://example.com/login"}'

# 2. Get form field refs
mcp-cli playwright/browser_snapshot '{}'
# Outputs:
# - textbox "Username" [ref=e10]
# - textbox "Password" [ref=e12]
# - button "Sign In" [ref=e15]

# 3. Fill form
mcp-cli playwright/browser_fill_form - <<EOF
{
  "fields": [
    {"element": "textbox", "ref": "e10", "text": "myusername"},
    {"element": "textbox", "ref": "e12", "text": "mypassword"}
  ]
}
EOF

# 4. Submit
mcp-cli playwright/browser_click '{"element": "button", "ref": "e15"}'

# 5. Verify success
mcp-cli playwright/browser_snapshot '{}'
```

### Workflow 4: Testing Website Responsiveness

```bash
# Start server
npx @playwright/mcp@latest --port 8931 &

# Mobile view
mcp-cli playwright/browser_resize '{"width": 375, "height": 667}'
mcp-cli playwright/browser_navigate '{"url": "https://example.com"}'
mcp-cli playwright/browser_take_screenshot '{"filename": "mobile.png"}'

# Tablet view
mcp-cli playwright/browser_resize '{"width": 768, "height": 1024}'
mcp-cli playwright/browser_navigate '{"url": "https://example.com"}'
mcp-cli playwright/browser_take_screenshot '{"filename": "tablet.png"}'

# Desktop view
mcp-cli playwright/browser_resize '{"width": 1920, "height": 1080}'
mcp-cli playwright/browser_navigate '{"url": "https://example.com"}'
mcp-cli playwright/browser_take_screenshot '{"filename": "desktop.png"}'
```

### Workflow 5: Automated Testing

```bash
#!/bin/bash
# test-search.sh

# Start server
npx @playwright/mcp@latest --port 8931 --shared-browser-context &
sleep 3

# Test search functionality
echo "Testing search..."

# Navigate
mcp-cli playwright/browser_navigate '{"url": "https://example.com/search"}'

# Get search box ref
SNAPSHOT=$(mcp-cli playwright/browser_snapshot '{}')
SEARCH_REF=$(echo "$SNAPSHOT" | grep -A1 'textbox "Search"' | grep -oP 'ref=\K\w+')

# Search
mcp-cli playwright/browser_type "{\"element\": \"textbox\", \"ref\": \"$SEARCH_REF\", \"text\": \"test query\", \"submit\": true}"

# Verify results
sleep 2
RESULTS=$(mcp-cli playwright/browser_snapshot '{}')

if echo "$RESULTS" | grep -q "test query"; then
  echo "✅ Search test passed"
else
  echo "❌ Search test failed"
  mcp-cli playwright/browser_take_screenshot '{"filename": "search-error.png"}'
fi

# Cleanup
mcp-cli playwright/browser_close '{}'
pkill -f "@playwright/mcp"
```

---

## Troubleshooting

### Issue 1: "Ref not found in the current page snapshot"

**Error:**
```
Error: Ref e42 not found in the current page snapshot. Try capturing new snapshot.
```

**Cause:** Element references become invalid when:
- Page navigates to a new URL
- Page reloads
- DOM changes dynamically

**Solution:** Always get a fresh snapshot after navigation:
```bash
# Navigate
mcp-cli playwright/browser_navigate '{"url": "https://example.com"}'

# Get CURRENT snapshot
mcp-cli playwright/browser_snapshot '{}'

# Use ref from the snapshot above
mcp-cli playwright/browser_click '{"element": "button", "ref": "e15"}'
```

### Issue 2: Browser Closes Between Commands

**Symptom:** Browser window flashes open and immediately closes.

**Cause:** Using stdio transport or HTTP mode without `--shared-browser-context`.

**Solution:** Use HTTP mode with shared context:
```bash
# Wrong - stdio transport
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}

# Right - HTTP with shared context
# 1. Start server
npx @playwright/mcp@latest --port 8931 --shared-browser-context &

# 2. Update config
{
  "mcpServers": {
    "playwright": {
      "url": "http://localhost:8931/mcp"
    }
  }
}
```

### Issue 3: Browser Already Running

**Error:**
```
Error: Port 8931 is already in use
```

**Cause:** Previous Playwright MCP server still running.

**Solution:**
```bash
# Kill existing server
pkill -f "@playwright/mcp"

# Wait and restart
sleep 2
npx @playwright/mcp@latest --port 8931 --shared-browser-context &
```

### Issue 4: Invalid JSON Arguments

**Error:**
```
Error [INVALID_JSON_ARGUMENTS]: Invalid JSON in tool arguments
```

**Cause:** Shell interpreting JSON incorrectly.

**Solution:** Use heredoc for complex JSON:
```bash
# Wrong - shell interprets quotes
mcp-cli playwright/browser_type {"element": "textbox", "text": "hello"}

# Right - single quotes
mcp-cli playwright/browser_type '{"element": "textbox", "ref": "e10", "text": "hello"}'

# Best - heredoc for complex JSON
mcp-cli playwright/browser_evaluate - <<EOF
{
  "function": "() => document.querySelector('button').click()"
}
EOF
```

### Issue 5: Headless vs Headed Mode

**When to use headless:**
- Running on servers without display (CI/CD)
- Background automation tasks
- Better performance

**When to use headed (default):**
- Debugging workflows
- Watching automation in real-time
- Interactive development

**Enable headless:**
```bash
npx @playwright/mcp@latest --port 8931 --shared-browser-context --headless &
```

### Issue 6: Browser Not Installing

**Error:**
```
Error: Chromium browser not found
```

**Solution:**
```bash
# Install browser binaries
mcp-cli playwright/browser_install '{}'

# Or use npx directly
npx playwright install chromium
```

---

## Best Practices

### 1. Always Use Shared Browser Context for Multi-Step Workflows

```bash
# DO: Use shared context
npx @playwright/mcp@latest --port 8931 --shared-browser-context &

# DON'T: Forget the flag
npx @playwright/mcp@latest --port 8931 &  # Won't preserve state
```

### 2. Capture Fresh Snapshots After Navigation

```bash
# DO: Get new snapshot
mcp-cli playwright/browser_navigate '{"url": "https://example.com"}'
mcp-cli playwright/browser_snapshot '{}'  # Fresh refs
mcp-cli playwright/browser_click '{"element": "button", "ref": "e15"}'

# DON'T: Reuse old refs
mcp-cli playwright/browser_navigate '{"url": "https://example.com"}'
mcp-cli playwright/browser_click '{"element": "button", "ref": "e42"}'  # May fail
```

### 3. Use Descriptive Element Selectors

```bash
# DO: Use semantic roles and names
mcp-cli playwright/browser_click '{"element": "button", "ref": "e15"}'
# Based on: button "Sign In" [ref=e15]

# DON'T: Rely on generic refs alone
mcp-cli playwright/browser_click '{"element": "generic", "ref": "e100"}'
```

### 4. Handle Errors Gracefully

```bash
#!/bin/bash
set -e  # Exit on error

# Wrap in error handling
if ! mcp-cli playwright/browser_navigate '{"url": "https://example.com"}'; then
  echo "Navigation failed"
  mcp-cli playwright/browser_take_screenshot '{"filename": "error.png"}'
  exit 1
fi
```

### 5. Clean Up Sessions

```bash
# Always close browser when done
mcp-cli playwright/browser_close '{}'

# Kill server when finished
pkill -f "@playwright/mcp"
```

### 6. Use Environment Variables for Configuration

```bash
# Set in .env or shell
export PLAYWRIGHT_PORT=8931
export PLAYWRIGHT_HEADLESS=true

# Start server with env vars
if [ "$PLAYWRIGHT_HEADLESS" = "true" ]; then
  npx @playwright/mcp@latest --port $PLAYWRIGHT_PORT --shared-browser-context --headless &
else
  npx @playwright/mcp@latest --port $PLAYWRIGHT_PORT --shared-browser-context &
fi
```

### 7. Add Waits for Dynamic Content

```bash
# Wait for specific text to appear
mcp-cli playwright/browser_wait_for '{"text": "Welcome"}'

# Wait with timeout
mcp-cli playwright/browser_wait_for '{"time": 2000}'

# Then interact
mcp-cli playwright/browser_snapshot '{}'
```

---

## Configuration Options Reference

### Server Flags

```bash
npx @playwright/mcp@latest [options]
```

**Common flags:**

| Flag | Description | Example |
|------|-------------|---------|
| `--port <port>` | HTTP server port | `--port 8931` |
| `--shared-browser-context` | Share context across clients | ✅ **Use for persistent sessions** |
| `--headless` | Run browser without UI | `--headless` |
| `--browser <browser>` | Browser to use | `--browser firefox` |
| `--device <device>` | Emulate device | `--device "iPhone 15"` |
| `--viewport-size <size>` | Set viewport | `--viewport-size 1920x1080` |
| `--user-data-dir <path>` | Persistent profile directory | `--user-data-dir ~/.playwright-profile` |
| `--save-trace` | Save Playwright trace | `--save-trace` |
| `--save-screenshot <size>` | Save session video | `--save-video 1920x1080` |
| `--timeout-action <ms>` | Action timeout | `--timeout-action 10000` |
| `--timeout-navigation <ms>` | Navigation timeout | `--timeout-navigation 60000` |

**Full options:**
```bash
npx @playwright/mcp@latest --help
```

---

## Quick Reference

### Essential Commands

```bash
# Start persistent server
npx @playwright/mcp@latest --port 8931 --shared-browser-context &

# List all tools
mcp-cli playwright

# Get tool schema
mcp-cli playwright/browser_navigate

# Navigate
mcp-cli playwright/browser_navigate '{"url": "https://example.com"}'

# Snapshot
mcp-cli playwright/browser_snapshot '{}'

# Click
mcp-cli playwright/browser_click '{"element": "button", "ref": "e15"}'

# Type
mcp-cli playwright/browser_type '{"element": "textbox", "ref": "e10", "text": "hello"}'

# Screenshot
mcp-cli playwright/browser_take_screenshot '{"filename": "page.png"}'

# Close
mcp-cli playwright/browser_close '{}'

# Kill server
pkill -f "@playwright/mcp"
```

---

## Examples Library

### Example 1: Google Search

```bash
# Start server
npx @playwright/mcp@latest --port 8931 --shared-browser-context &
sleep 3

# Navigate to Google
mcp-cli playwright/browser_navigate '{"url": "https://www.google.com"}'

# Get search box ref
SNAPSHOT=$(mcp-cli playwright/browser_snapshot '{}')
echo "$SNAPSHOT" | grep 'combobox "Search"'
# Output: - combobox "Search" [ref=e42]

# Search
mcp-cli playwright/browser_type '{"element": "combobox", "ref": "e42", "text": "Model Context Protocol", "submit": true}'

# Screenshot results
sleep 2
mcp-cli playwright/browser_take_screenshot '{"filename": "google-results.png"}'

# Cleanup
mcp-cli playwright/browser_close '{}'
pkill -f "@playwright/mcp"
```

### Example 2: Extract Links from Page

```bash
# Navigate
mcp-cli playwright/browser_navigate '{"url": "https://news.ycombinator.com"}'

# Extract all links with JavaScript
mcp-cli playwright/browser_evaluate - <<EOF
{
  "function": "() => { return Array.from(document.querySelectorAll('a.titleline')).map(a => ({ title: a.textContent.trim(), url: a.href })).slice(0, 10) }"
}
EOF
```

### Example 3: Monitor Page Changes

```bash
#!/bin/bash
# monitor.sh - Check if page content changed

URL="https://example.com"
CHECK_TEXT="Important Update"

while true; do
  SNAPSHOT=$(mcp-cli playwright/browser_navigate "{\"url\": \"$URL\"}" && mcp-cli playwright/browser_snapshot '{}')
  
  if echo "$SNAPSHOT" | grep -q "$CHECK_TEXT"; then
    echo "✅ Found: $CHECK_TEXT"
    mcp-cli playwright/browser_take_screenshot '{"filename": "found.png"}'
    break
  else
    echo "⏳ Not found yet, checking again in 60s..."
    sleep 60
  fi
done
```

---

## Key Takeaways for AI Agents

1. **Use HTTP mode with `--shared-browser-context` for multi-step workflows**
2. **Always capture fresh snapshots after navigation** to get valid refs
3. **Element refs are session-specific** - they become invalid after navigation
4. **Use heredocs for complex JSON** to avoid shell quoting issues
5. **The browser stays open between commands** in HTTP mode with shared context
6. **Stdio mode closes the browser** after each command - use for single actions only
7. **Follow Discover → Inspect → Execute** pattern when unsure about tools
8. **Clean up after yourself** - close browser and kill server when done

---

## Additional Resources

- **Playwright MCP GitHub**: https://github.com/microsoft/playwright-mcp
- **Playwright Documentation**: https://playwright.dev/
- **MCP Specification**: https://modelcontextprotocol.io/
- **mcp-cli Guide**: See MCP-CLI-GUIDE.md in this repository

---

**Document Version:** 1.0  
**Last Updated:** January 10, 2026  
**Author:** AI Agent Training Documentation
