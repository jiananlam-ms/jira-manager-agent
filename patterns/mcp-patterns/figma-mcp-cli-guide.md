# Figma MCP via CLI - Complete Guide for AI Agents

> **Purpose**: Comprehensive guide for AI agents to use Figma MCP through mcp-cli for design-to-code workflows, screenshot extraction, and design system integration.

## Table of Contents

1. [What is Figma MCP?](#what-is-figma-mcp)
2. [Why Use Figma MCP via CLI?](#why-use-figma-mcp-via-cli)
3. [Installation & Configuration](#installation--configuration)
4. [How Figma Desktop MCP Works](#how-figma-desktop-mcp-works)
5. [Available Tools](#available-tools)
6. [Usage Patterns](#usage-patterns)
7. [Common Workflows](#common-workflows)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)
10. [Examples Library](#examples-library)

---

## What is Figma MCP?

**Figma MCP** is a Model Context Protocol server that provides programmatic access to Figma designs through the Figma Desktop application, enabling design-to-code workflows, screenshot extraction, design token retrieval, and FigJam content extraction.

**Key Features:**
- 🎨 **Design-to-Code** - Generate React + Tailwind CSS from Figma designs
- 📸 **Screenshot Extraction** - Capture PNG screenshots of any Figma node
- 🎯 **Design Tokens** - Extract variables, colors, typography, spacing
- 📋 **Metadata Access** - Get design structure, node hierarchy, properties
- 🎭 **FigJam Support** - Extract whiteboard content as structured XML

**Official Website:** https://www.figma.com  
**MCP Documentation:** https://www.figma.com/developers/mcp

---

## Why Use Figma MCP via CLI?

### Context Window Efficiency

Using via mcp-cli:
- Tools discovered on-demand via `mcp-cli figma-desktop`
- Only load schemas when calling specific tools
- **60%+ reduction in context usage** vs loading all tools upfront
- Clean, minimal context footprint

### Scriptability & Integration

```bash
# Extract design code in build pipelines
mcp-cli figma-desktop/get_design_context '{"nodeId": "123:456"}' > component.tsx

# Get design tokens for CSS variables generation
mcp-cli figma-desktop/get_variable_defs '{"nodeId": "123:456"}' | \
  jq -r 'to_entries[] | "--\(.key): \(.value);"'

# Automated screenshot generation
mcp-cli figma-desktop/get_screenshot '{"nodeId": "123:456"}' | \
  jq -r '.content[0].data' | base64 -d > screenshot.png
```

---

## Installation & Configuration

### Prerequisites

- [Figma Desktop App](https://www.figma.com/downloads/) installed and running
- Design files open in Figma Desktop (not browser)
- mcp-cli installed (see [MCP-CLI-GUIDE.md](MCP-CLI-GUIDE.md))

### Configuration

Add to `~/.config/mcp/mcp_servers.json`:

```json
{
  "mcpServers": {
    "figma-desktop": {
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

**Key Points:**
- ✅ No authentication required (uses Figma Desktop session)
- ✅ Assets served from localhost (fast, never expire)
- ✅ Works offline for opened files
- ✅ No rate limits

**Requirements:**
- Figma Desktop app must be running
- Design file must be open in active tab

**Verify Configuration:**
```bash
mcp-cli figma-desktop
```

---

## How Figma Desktop MCP Works

Figma Desktop MCP is a **local HTTP server** that runs inside the Figma Desktop application:

- **Server URL:** `http://127.0.0.1:3845/mcp`
- **Authentication:** Uses your active Figma Desktop session
- **Asset URLs:** Served from localhost (e.g., `http://localhost:3845/assets/abc123.png`)
- **File Access:** Only works with files open in the active Figma Desktop tab

**Workflow:**
1. Open design file in Figma Desktop app
2. Ensure file is in the active tab
3. Run mcp-cli commands to access design data
4. Assets are served from localhost while Figma Desktop is running

---

## Available Tools

Figma Desktop MCP provides **6 tools** accessible via mcp-cli:

### 1. `get_design_context`

**Purpose:** Generate React + TypeScript + Tailwind CSS code from Figma designs.

**Parameters:**
- `nodeId` (string, required) - Figma node ID (format: `"123:456"`)
- `clientLanguages` (string, optional) - Programming languages used (e.g., `"typescript,html,css"`)
- `clientFrameworks` (string, optional) - Frameworks used (e.g., `"react"`)
- `disableCodeConnect` (boolean, optional) - Disable Code Connect integration
- `forceCode` (boolean, optional) - Force code generation for large designs

**Example:**
```bash
mcp-cli figma-desktop/get_design_context '{
  "nodeId": "180:22660",
  "clientLanguages": "typescript,html,css",
  "clientFrameworks": "react"
}'
```

**Output Format:**
```typescript
const imgBannerImage = "http://localhost:3845/assets/abc123.png";

export default function StoryDetails() {
  return (
    <div className="bg-white relative size-full" data-node-id="180:22660">
      <img src={imgBannerImage} alt="" />
      {/* Full component structure with Tailwind classes */}
    </div>
  );
}
```

**Gotchas:**
- ⚠️ Always call `get_screenshot` after this for visual context
- ⚠️ Assets are localhost URLs (e.g., `http://localhost:3845/assets/...`)
- ⚠️ Assets only accessible while Figma Desktop is running
- ⚠️ Code assumes Tailwind CSS is configured (won't install it)
- ⚠️ Font families may need to be installed separately
- ⚠️ Design must be open in active Figma Desktop tab

---

### 2. `get_screenshot`

**Purpose:** Capture PNG screenshot of any Figma node.

**Parameters:**
- `nodeId` (string, optional) - Figma node ID
- `clientLanguages` (string, optional) - Context for formatting
- `clientFrameworks` (string, optional) - Context for formatting

**Output:**
- JSON with base64-encoded PNG (e.g., `http://localhost:3845/assets/...`)
- ⚠️ Assets only accessible while Figma Desktop is running
- Structure: `{"content": [{"data": "iVBORw0KGgo...", "mimeType": "image/png"}]}`

**Example:**
```bash
# Get screenshot and save to file
mcp-cli figma-desktop/get_screenshot '{"nodeId": "180:22660"}' > screenshot.json

# Extract and decode the image
jq -r '.content[0].data' screenshot.json | base64 -d > screenshot.png

# Verify the image
file screenshot.png  # Should show: PNG image data, 393 x 852, 8-bit/color RGBA
```

**Common Pipeline:**
```bash
# One-liner to get and save screenshot
mcp-cli figma-desktop/get_screenshot '{"nodeId": "123:456"}' | \
  jq -r '.content[0].data' | \
  base64 -d > design.png
```

**Gotchas:**
- ⚠️ Output is JSON, not raw image data
- ⚠️ Must use `jq` to extract base64 data, not `grep`/`sed`
- ⚠️ Don't forget to decode base64: `base64 -d`
- ⚠️ File will be empty if you pipe JSON directly to file
- ⚠️ Screenshot captures current viewport/zoom state

---

### 3. `get_variable_defs`

**Purpose:** Extract design tokens (colors, typography, spacing, etc.) from Figma designs.

**Parameters:**
- `nodeId` (string, optional) - Figma node ID
- `clientLanguages` (string, optional) - Format context
- `clientFrameworks` (string, optional) - Framework context

**Output:**
- JSON object with semantic variable names and values
- Colors as hex codes
- Typography as Font objects
- Spacing as pixel values
- Effects as Effect objects

**Example:**
```bash
mcp-cli figma-desktop/get_variable_defs '{"nodeId": "180:22660"}'
```

**Output Format:**
```json
{
  "System Colours/Label Colour/Primary/Light": "#000000",
  "neutrals/neutral-90": "#333333",
  "Default/Body/Bold": "Font(family: \"SF Pro Text\", style: Semibold, size: 17, weight: 600, lineHeight: 22, letterSpacing: -0.408)",
  "Mobile/+3 Mobile Header": "Font(family: \"Sofia Pro\", style: Semi Bold, size: 22, weight: 600, lineHeight: 30, letterSpacing: -0.3)",
  "In-component XL": "24",
  "Corner/Full": "1000",
  "White": "#ffffff",
  "Drop Shadow": "Effect(type: DROP_SHADOW, color: #00000029, offset: (0, 1), radius: 6, spread: 0)"
}
```

**Use Cases:**
```bash
# Convert to CSS variables
mcp-cli figma-desktop/get_variable_defs '{"nodeId": "123:456"}' | \
  jq -r 'to_entries[] | "--\(.key | gsub("/"; "-")): \(.value);"'

# Extract just colors
mcp-cli figma-desktop/get_variable_defs '{"nodeId": "123:456"}' | \
  jq 'to_entries | map(select(.value | startswith("#"))) | from_entries'

# Create Tailwind theme config
mcp-cli figma-desktop/get_variable_defs '{"nodeId": "123:456"}' | \
  jq '{colors: (to_entries | map(select(.value | startswith("#"))) | from_entries)}'
```

**Gotchas:**
- ⚠️ Font values are string representations, not direct CSS
- ⚠️ Spacing values are unitless (assume pixels)
- ⚠️ Variable names use `/` separators (Figma's hierarchy)
- ⚠️ Not all design properties create variables

---

### 4. `get_metadata`

**Purpose:** Get structural metadata and node hierarchy without full design context.

**Parameters:**
- `nodeId` (string, optional) - Figma node ID
- `clientLanguages` (string, optional) - Context
- `clientFrameworks` (string, optional) - Context

**Output:**
- XML format with node structure
- Node IDs, types, names
- Position and size data
- Layer hierarchy

**Example:**
```bash
mcp-cli figma-desktop/get_metadata '{"nodeId": "180:22660"}'
```

**Output Format:**
```xml
<frame id="180:22660" name="Story Details 49" x="0" y="0" width="393" height="852">
  <frame id="180:22661" name="Background" x="0" y="0" width="393" height="393">
    <!-- Child nodes -->
  </frame>
</frame>
```

**Use Cases:**
- Understanding design structure before code generation
- Finding specific nodes in complex designs
- Analyzing layer hierarchy
- Debugging node ID issues

**Gotchas:**
- ⚠️ Lightweight but less detailed than `get_design_context`
- ⚠️ No styling information, just structure
- ⚠️ Useful for exploration, not code generation

---

### 5. `create_design_system_rules`

**Purpose:** Get a prompt/template for documenting your design system integration.

**Parameters:**
- `clientLanguages` (string, optional) - Languages used
- `clientFrameworks` (string, optional) - Frameworks used

**Output:**
- Markdown template with questions about your codebase
- Sections for tokens, components, assets, styling
- Guides you to create rules documentation

**Example:**
```bash
mcp-cli figma-desktop/create_design_system_rules '{
  "clientLanguages": "typescript,html,css",
  "clientFrameworks": "react"
}'
```

**Output:**
- Template asking about your:
  - Token definitions and format
  - Component library structure
  - Frameworks and build system
  - Asset management approach
  - Icon system
  - CSS methodology
  - Project structure

**Purpose:**
This helps you create a `CLAUDE.md` or `.cursor/rules/design_system_rules.mdc` file that AI will reference when converting Figma designs to match your specific codebase patterns.

**Gotchas:**
- ⚠️ This is a template generator, not an analyzer
- ⚠️ You must fill in the answers based on your project
- ⚠️ Use this to document conventions, not discover them

---

### 6. `get_figjam`

**Purpose:** Extract structured content from FigJam whiteboard files.

**Parameters:**
- `nodeId` (string, optional) - FigJam node ID
- `clientLanguages` (string, optional) - Context
- `clientFrameworks` (string, optional) - Context
- `includeImagesOfNodes` (boolean, optional) - Include node images

**Output:**
- XML structure with FigJam content
- Text elements, sticky notes, frames
- Position and size data
- Hidden elements marked

**Example:**
```bash
mcp-cli figma-desktop/get_figjam '{"nodeId": "1:1769"}'
```

**Output Format:**
```xml
<section id="1:1769" name="Tips and Tools" x="256" y="244" width="1616" height="1392">
  <frame id="1:1770" name="Toolbar" x="151" y="220.5" width="575" height="201.6">
    <text id="1:1772" name="Toolbar" x="0" y="0" width="245" height="29" />
    <text id="1:1773" name="It's at the bottom of your screen..." />
  </frame>
</section>
```

**Use Cases:**
```bash
# Extract all text from FigJam board
mcp-cli figma-desktop/get_figjam '{"nodeId": "1:1769"}' | \
  grep 'name="' | \
  sed -E 's/.*name="([^"]*)".*/\1/' | \
  grep -v "Frame\|Screen\|Icon"

# Convert whiteboard to markdown
mcp-cli figma-desktop/get_figjam '{"nodeId": "1:1769"}' > figjam.xml
# Process XML to extract structured notes
```

**Gotchas:**
- ⚠️ Only works with FigJam files (URL: `figma.com/board/...`)
- ⚠️ Won't work with regular design files
- ⚠️ FigJam file must be open in Figma Desktop
- ⚠️ Text extraction requires XML parsing

---

## Usage Patterns

### Pattern 1: Design-to-Code Workflow

```bash
# 1. Get component code
mcp-cli figma-desktop/get_design_context '{
  "nodeId": "180:22660",
  "clientLanguages": "typescript,html,css",
  "clientFrameworks": "react"
}' > Component.tsx

# 2. Get visual reference
mcp-cli figma-desktop/get_screenshot '{"nodeId": "180:22660"}' | \
  jq -r '.content[0].data' | \
  base64 -d > component-reference.png

# 3. Get design tokens
mcp-cli figma-desktop/get_variable_defs '{"nodeId": "180:22660"}' > tokens.json

# 4. Review and integrate into your project
```

### Pattern 2: Screenshot Extraction for Documentation

```bash
# Function to extract screenshot from any node
extract_figma_screenshot() {
  local node_id="$1"
  local output_file="$2"
  
  mcp-cli figma-desktop/get_screenshot "{\"nodeId\": \"$node_id\"}" | \
    jq -r '.content[0].data' | \
    base64 -d > "$output_file"
    
  echo "Screenshot saved to $output_file"
  file "$output_file"
}

# Usage
extract_figma_screenshot "180:22660" "homepage.png"
extract_figma_screenshot "123:456" "button-states.png"
```

### Pattern 3: Design Token Extraction to CSS

```bash
# Extract tokens and convert to CSS variables
mcp-cli figma-desktop/get_variable_defs '{"nodeId": "180:22660"}' | \
  jq -r '
    to_entries |
    map(
      if .value | startswith("#") then
        "--" + (.key | gsub("/"; "-") | gsub(" "; "-") | ascii_downcase) + ": " + .value + ";"
      else
        empty
      end
    ) |
    .[]
  ' > design-tokens.css

# Add :root wrapper
echo ":root {" | cat - design-tokens.css <(echo "}") > theme.css
```

### Pattern 4: Batch Processing Multiple Nodes

```bash
# List of node IDs to process
NODE_IDS=(
  "180:22660"
  "180:22665"
  "180:22670"
)

# Process each node
for node_id in "${NODE_IDS[@]}"; do
  echo "Processing node $node_id..."
  
  # Get code
  mcp-cli figma-desktop/get_design_context "{\"nodeId\": \"$node_id\"}" > "component_${node_id//:/_}.tsx"
  
  # Get screenshot
  mcp-cli figma-desktop/get_screenshot "{\"nodeId\": \"$node_id\"}" | \
    jq -r '.content[0].data' | \
    base64 -d > "screenshot_${node_id//:/_}.png"
    
  echo "✓ Completed $node_id"
done
```

### Pattern 5: FigJam Documentation Extraction

```bash
# Extract all text from FigJam board for documentation
extract_figjam_text() {
  local node_id="$1"
  
  mcp-cli figma-desktop/get_figjam "{\"nodeId\": \"$node_id\"}" | \
    grep 'name="' | \
    sed -E 's/.*name="([^"]*)".*/\1/' | \
    grep -v "Frame\|Screen\|Group\|Rectangle\|Icon\|image\|Main\|content\|shortcuts\|Key\|Sticky" | \
    sort -u
}

# Usage
extract_figjam_text "1:1769" > meeting-notes.txt
```

---

## Common Workflows

### Workflow 1: Component Library Migration

**Goal:** Convert Figma design system components to React + Tailwind.

```bash
#!/bin/bash
# migrate-components.sh

# Array of component node IDs from Figma
COMPONENTS=(
  "button:123:456"
  "input:123:457"
  "card:123:458"
)

mkdir -p ./components
mkdir -p ./components/screenshots

for comp in "${COMPONENTS[@]}"; do
  # Extract name and node ID
  name="${comp%%:*}"
  node_id="${comp#*:}"
  
  echo "Migrating $name..."
  
  # Generate component code
  mcp-cli figma-desktop/get_design_context "{
    \"nodeId\": \"$node_id\",
    \"clientLanguages\": \"typescript,html,css\",
    \"clientFrameworks\": \"react\"
  }" > "./components/${name}.tsx"
  
  # Get reference screenshot
  mcp-cli figma-desktop/get_screenshot "{\"nodeId\": \"$node_id\"}" | \
    jq -r '.content[0].data' | \
    base64 -d > "./components/screenshots/${name}.png"
    
  echo "✓ $name complete"
done

# Extract design tokens
mcp-cli figma-desktop/get_variable_defs "{\"nodeId\": \"123:456\"}" > ./components/tokens.json

echo "Migration complete! Check ./components/"
```

### Workflow 2: Design QA with Screenshots

**Goal:** Generate screenshots of all screens for design review.

```bash
#!/bin/bash
# design-qa.sh

# Read screen IDs from file
while IFS=, read -r screen_name node_id; do
  echo "Capturing $screen_name..."
  
  mcp-cli figma-desktop/get_screenshot "{\"nodeId\": \"$node_id\"}" | \
    jq -r '.content[0].data' | \
    base64 -d > "./qa/${screen_name}.png"
    
  # Generate thumbnail
  sips -Z 400 "./qa/${screen_name}.png" --out "./qa/thumbs/${screen_name}_thumb.png"
  
done < screens.csv

# Generate HTML gallery
cat > ./qa/index.html <<EOF
<!DOCTYPE html>
<html><head><title>Design QA</title></head>
<body>
  <h1>Design QA Gallery</h1>
  <div class="gallery">
$(for img in ./qa/thumbs/*.png; do
  echo "    <img src='${img}' />"
done)
  </div>
</body></html>
EOF

echo "QA gallery created at ./qa/index.html"
```

### Workflow 3: Design Token Sync

**Goal:** Keep design tokens in sync between Figma and codebase.

```bash
#!/bin/bash
# sync-tokens.sh

FIGMA_NODE="123:456"  # Your design system root node
OUTPUT_DIR="./src/design-tokens"

mkdir -p "$OUTPUT_DIR"

# Get tokens from Figma
TOKENS=$(mcp-cli figma-desktop/get_variable_defs "{\"nodeId\": \"$FIGMA_NODE\"}")

# Generate CSS variables
echo "$TOKENS" | jq -r '
  ":root {" as $start |
  (
    to_entries |
    map(
      if .value | startswith("#") then
        "  --" + (.key | gsub("/"; "-") | gsub(" "; "-") | ascii_downcase) + ": " + .value + ";"
      else
        empty
      end
    ) |
    .[]
  ) as $vars |
  "}" as $end |
  [$start, $vars, $end] | join("\n")
' > "$OUTPUT_DIR/variables.css"

# Generate TypeScript theme
echo "$TOKENS" | jq '{
  colors: (to_entries | map(select(.value | startswith("#"))) | from_entries),
  spacing: (to_entries | map(select(.value | test("^[0-9]+$"))) | from_entries)
}' > "$OUTPUT_DIR/theme.json"

# Generate Tailwind config snippet
echo "$TOKENS" | jq '{
  theme: {
    extend: {
      colors: (to_entries | map(select(.value | startswith("#"))) | from_entries)
    }
  }
}' > "$OUTPUT_DIR/tailwind.config.snippet.json"

echo "✓ Tokens synced to $OUTPUT_DIR"
```

---

## Troubleshooting

### Error: "No node could be found for the provided nodeId"

**Cause:** The design file containing the node is not open in Figma Desktop, or wrong node ID.

**Solutions:**
1. ✅ Open the Figma file in Figma Desktop app (not browser)
2. ✅ Make sure it's the **active tab**
3. ✅ Verify node ID from URL: `https://figma.com/design/FILE_KEY/...?node-id=123-456`
   - Node ID format: Replace `-` with `:` → `123:456`
4. ✅ Check if using FigJam file with non-FigJam tool (or vice versa)

```bash
# Verify server is accessible first
mcp-cli figma-desktop

# Try getting metadata to verify node exists
mcp-cli figma-desktop/get_metadata '{"nodeId": "YOUR_NODE_ID"}'
```

### Error: "Connection refused" or "Server not responding"

**Cause:** Figma Desktop app is not running or MCP server disabled.

**Solutions:**
1. ✅ Launch Figma Desktop app
2. ✅ Check if MCP is enabled in Figma Desktop settings
3. ✅ Verify server URL: `http://127.0.0.1:3845/mcp`
4. ✅ Restart Figma Desktop if needed

```bash
# Test server connectivity
curl http://127.0.0.1:3845/mcp
```

### Empty Screenshot File (0 bytes)

**Cause:** Incorrect extraction pipeline, trying to pipe JSON directly.

**Wrong:**
```bash
# ❌ This creates empty file
mcp-cli figma-desktop/get_screenshot '{"nodeId": "123:456"}' | \
  base64 -d > screenshot.png
```

**Correct:**
```bash
# ✅ Extract base64 data first with jq
mcp-cli figma-desktop/get_screenshot '{"nodeId": "123:456"}' | \
  jq -r '.content[0].data' | \
  base64 -d > screenshot.png
```

**Debugging:**
```bash
# Save raw output to inspect structure
mcp-cli figma-desktop/get_screenshot '{"nodeId": "123:456"}' > output.json

# Check structure
jq '.content[0].mimeType' output.json  # Should be "image/png"
jq '.content[0].data' output.json | head -c 100  # Should start with "iVBORw0KGgo"

# Extract properly
jq -r '.content[0].data' output.json | base64 -d > screenshot.png
file screenshot.png  # Verify: PNG image data, 393 x 852, 8-bit/color RGBA
```

### Node ID Format Confusion

**In Figma URL:**
```
https://figma.com/design/FkWRxYA0LwtAvfHgBASHSp/ONBD-Awareness-Hub-v2?node-id=180-22660
                                                                              ^^^^^^^^^^^
                                                                              Uses hyphen
```

**In mcp-cli:**
```bash
# ✅ Correct: Use colon
mcp-cli figma-desktop/get_screenshot '{"nodeId": "180:22660"}'

# ❌ Wrong: Don't use hyphen
mcp-cli figma-desktop/get_screenshot '{"nodeId": "180-22660"}'
```

**Conversion:** Replace `-` with `:` from URL node-id parameter.

### Assets Not Loading (404 errors)

**Cause:** Figma Desktop app not running or file closed.

**Asset URLs from Figma Desktop:**
```
http://localhost:3845/assets/abc123.png
```
- ✅ Never expire
- ✅ Fast (localhost)
- ❌ Only accessible while Figma Desktop is running
- ❌ Not accessible from other machines

**Solution:**
For production builds, download and host assets yourself:
```bash
# Download all assets from generated code
grep -o 'http://localhost:3845/assets/[^"]*' component.tsx | \
while read url; do
  filename=$(basename "$url")
  curl "$url" -o "./assets/$filename"
done

# Update code to use local paths
sed -i 's|http://localhost:3845/assets/|./assets/|g' component.tsx
```

**Download Script:**
```
http://localhost:3845/assets/abc123.png
```
- ✅ Never expire
- ✅ Fast (localhost)
- ❌ Only accessible while Figma Desktop is running
- ❌ Not accessible from other machines

**Solution:**
For production builds, download and host assets yourself:

```bash
# Download all assets from generated code
grep -o 'http://localhost:3845/assets/[^"]*' component.tsx | \
while read url; do
  filename=$(basename "$url")
  curl "$url" -o "./assets/$filename"
done

# Update code to use local paths
sed -i 's|http://localhost:3845/assets/|./assets/|g' component.tsx
```

### FigJam Tool Not Working with Design Files

**Error:** "No node could be found..."

**Cause:** Using `get_figjam` on regular Figma design file.

**Solution:**
Check the Figma URL scheme and open the correct file type in Figma Desktop:

```bash
# ❌ Wrong: Regular design file
# URL: https://figma.com/design/FkWRxY.../
mcp-cli figma-desktop/get_figjam '{"nodeId": "180:22660"}'

# ✅ Correct: FigJam board file
# URL: https://figma.com/board/MKAmLk.../
mcp-cli figma-desktop/get_figjam '{"nodeId": "1:1769"}'
```

**File Type Guide:**
- **Design file** (`figma.com/design/...`) → Use `get_design_context`, `get_screenshot`
- **FigJam board** (`figma.com/board/...`) → Use `get_figjam`

Both must be open in Figma Desktop's active tab.

---

## Best Practices

### 1. Always Get Screenshot for Context

After generating code with `get_design_context`, **always** get a screenshot:

```bash
# Get code
mcp-cli figma-desktop/get_design_context '{"nodeId": "123:456"}' > component.tsx

# Get screenshot for visual reference
mcp-cli figma-desktop/get_screenshot '{"nodeId": "123:456"}' | \
  jq -r '.content[0].data' | \
  base64 -d > component.png
```

This allows you to compare the generated code with the actual design.

### 2. Always Use `jq` for JSON Parsing

**Never** try to parse JSON with `grep`, `sed`, or `awk`:

```bash
# ❌ BAD: Fragile, error-prone
mcp-cli figma-desktop/get_screenshot '...' | grep -o '"data": "[^"]*"' | ...

# ✅ GOOD: Robust JSON parsing
mcp-cli figma-desktop/get_screenshot '...' | jq -r '.content[0].data'
```

**Install jq if needed:**
```bash
# macOS
brew install jq

# Linux
sudo apt-get install jq
```

### 3. Verify Node IDs from Figma URL

**Always** extract node IDs from the Figma URL:

1. Open design in Figma Desktop
2. Select the frame/component
3. Copy URL (⌘K or Ctrl+K)
4. Extract node-id parameter: `?node-id=180-22660`
5. Convert to colon format: `180:22660`

```bash
# Helper function to convert URL to node ID
figma_url_to_node_id() {
  echo "$1" | grep -o 'node-id=[^&]*' | cut -d= -f2 | tr '-' ':'
}

# Usage
NODE_ID=$(figma_url_to_node_id "https://figma.com/design/FkWRxY.../...?node-id=180-22660")
echo $NODE_ID  # Output: 180:22660
```

### 4. Keep Figma Desktop Files Organized

**For mcp-cli workflows:**
- Only keep actively used files open
- Close files you're not working with
- Figma Desktop MCP only works with **active tab**
- Switch to correct tab before running commands

### 5. Handle Large Designs Carefully

For complex screens with many layers:

```bash
# Use forceCode sparingly (generates more tokens)
mcp-cli figma-desktop/get_design_context '{
  "nodeId": "123:456",
  "forceCode": true
}'

# Better: Break down into smaller components
# Instead of whole screen, select specific components
```

### 6. Version Control Generated Code

**Generated code is a starting point, not the final product:**

```bash
# Generate initial code
mcp-cli figma-desktop/get_design_context '{"nodeId": "123:456"}' > Button.tsx

# Commit to version control
git add Button.tsx
git commit -m "feat: generate Button component from Figma"

# Then refactor as needed:
# - Add proper TypeScript types
# - Extract repeated patterns
# - Add accessibility attributes
# - Connect to state management
# - Add tests
```

### 7. Automate Token Syncing

**Create scripts to keep tokens in sync:**

```bash
# Add to package.json
{
  "scripts": {
    "sync-tokens": "./scripts/sync-figma-tokens.sh",
    "prebuild": "npm run sync-tokens"
  }
}

# Run before builds to ensure latest tokens
npm run build  # Automatically syncs tokens first
```

### 8. Document Your Node IDs

**Create a reference file:**

```bash
# figma-nodes.txt
# Component Library
button-primary: 123:456
button-secondary: 123:457
input-text: 123:458
 scripts
{
  "scripts": {
    "sync-tokens": "./scripts/sync-figma-tokens.sh",
    "prebuild": "npm run sync-tokens"
  }
}

# Run before builds to ensure latest tokens
npm run build  # Automatically syncs tokens first
```

**Important:** Figma Desktop must be running with design file open when sync scripts execute.rep "^$1:" figma-nodes.txt | cut -d: -f2-
}

NODE_ID=$(get_node_id "home-screen")
mcp-cli figma-desktop/get_screenshot "{\"nodeId\": \"$NODE_ID\"}"
```

### 9. Cache Outputs When Possible

**Avoid repeated API calls:**

```bash
# Cache design context for 1 hour
CACHE_FILE=".cache/component_123_456.tsx"
CACHE_AGE=$((60 * 60))  # 1 hour in seconds

if [[ -f "$CACHE_FILE" ]] && \
   [[ $(($(date +%s) - $(stat -f %m "$CACHE_FILE"))) -lt $CACHE_AGE ]]; then
  cat "$CACHE_FILE"
else
  mcp-cli figma-desktop/get_design_context '{"nodeId": "123:456"}' | \
    tee "$CACHE_FILE"
fi
```

### 10. Handle Errors Gracefully

**Add error checking to scripts:**

```bash
#!/bin/bash
set -euo pipefail  # Exit on error

extract_screenshot() {
  local node_id="$1"
  local output="$2"
  
  # Check if Figma Desktop is running
  if ! curl -s http://127.0.0.1:3845/mcp >/dev/null 2>&1; then
    echo "Error: Figma Desktop is not running or MCP is disabled"
    return 1
  fi
  
  # Get screenshot with error handling
  if ! output_json=$(mcp-cli figma-desktop/get_screenshot "{\"nodeId\": \"$node_id\"}"); then
    echo "Error: Failed to get screenshot for node $node_id"
    return 1
  fi
  
  # Extract and decode
  if ! echo "$output_json" | jq -r '.content[0].data' | base64 -d > "$output"; then
    echo "Error: Failed to decode screenshot data"
    return 1
  fi
  
  # Verify output
  if [[ ! -s "$output" ]]; then
    echo "Error: Generated screenshot is empty"
    return 1
  fi
  
  echo "✓ Screenshot saved to $output"
  file "$output"
}
```

---

## Examples Library

### Example 1: Complete Component Migration

```bash
#!/bin/bash
# migrate-button-component.sh

NODE_ID="123:456"
COMPONENT_NAME="Button"

echo "Migrating $COMPONENT_NAME from Figma..."

# 1. Create output directory
mkdir -p "./src/components/$COMPONENT_NAME"
cd "./src/components/$COMPONENT_NAME"

# 2. Get component code
echo "Generating code..."
mcp-cli figma-desktop/get_design_context "{
  \"nodeId\": \"$NODE_ID\",
  \"clientLanguages\": \"typescript,html,css\",
  \"clientFrameworks\": \"react\"
}" > "$COMPONENT_NAME.tsx"

# 3. Get design tokens
echo "Extracting tokens..."
mcp-cli figma-desktop/get_variable_defs "{\"nodeId\": \"$NODE_ID\"}" > tokens.json

# 4. Get screenshot
echo "Capturing screenshot..."
mcp-cli figma-desktop/get_screenshot "{\"nodeId\": \"$NODE_ID\"}" | \
  jq -r '.content[0].data' | \
  base64 -d > "$COMPONENT_NAME.png"

# 5. Create README
cat > README.md <<EOF
# $COMPONENT_NAME Component

Figma Node ID: \`$NODE_ID\`

## Preview

![$COMPONENT_NAME](./$COMPONENT_NAME.png)

## Usage

\`\`\`tsx
import $COMPONENT_NAME from './$COMPONENT_NAME';

<$COMPONENT_NAME />
\`\`\`

## Design Tokens

See [tokens.json](./tokens.json)
EOF

echo "✓ $COMPONENT_NAME migration complete!"
ls -lh
```

### Example 2: Design System Documentation Generator

```bash
#!/bin/bash
# generate-design-system-docs.sh

# Configuration
DESIGN_SYSTEM_NODE="100:1000"
OUTPUT_DIR="./docs/design-system"

mkdir -p "$OUTPUT_DIR"

echo "Generating design system documentation..."

# Get all tokens
echo "Extracting design tokens..."
TOKENS=$(mcp-cli figma-desktop/get_variable_defs "{\"nodeId\": \"$DESIGN_SYSTEM_NODE\"}")

# Separate by category
echo "$TOKENS" | jq '
  {
    colors: (to_entries | map(select(.value | startswith("#"))) | from_entries),
    spacing: (to_entries | map(select(.key | contains("spacing") or contains("component"))) | from_entries),
    typography: (to_entries | map(select(.value | startswith("Font("))) | from_entries)
  }
' > "$OUTPUT_DIR/tokens.json"

# Generate markdown documentation
cat > "$OUTPUT_DIR/README.md" <<'EOF'
# Design System

## Colors

$(echo "$TOKENS" | jq -r '
  to_entries |
  map(select(.value | startswith("#"))) |
  map("- **\(.key)**: `\(.value)`") |
  .[]
')

## Typography

$(echo "$TOKENS" | jq -r '
  to_entries |
  map(select(.value | startswith("Font("))) |
  map("### \(.key)\n\n```\n\(.value)\n```\n") |
  .[]
')

## Spacing

$(echo "$TOKENS" | jq -r '
  to_entries |
  map(select(.key | contains("spacing") or contains("component"))) |
  map("- **\(.key)**: \(.value)px") |
  .[]
')
EOF

# Get screenshot of design system
mcp-cli figma-desktop/get_screenshot "{\"nodeId\": \"$DESIGN_SYSTEM_NODE\"}" | \
  jq -r '.content[0].data' | \
  base64 -d > "$OUTPUT_DIR/design-system.png"

echo "✓ Design system documentation generated at $OUTPUT_DIR"
```

### Example 3: Batch Screenshot Export

```bash
#!/bin/bash
# export-all-screens.sh

# Read screens from CSV: name,node_id
# Example CSV:
# Home,180:22660
# Profile,180:22665
# Settings,180:22670

INPUT_CSV="screens.csv"
OUTPUT_DIR="./screenshots"

mkdir -p "$OUTPUT_DIR"

echo "Exporting screenshots from Figma..."

# Process each line
while IFS=, read -r name node_id; do
  # Skip header
  [[ "$name" == "name" ]] && continue
  
  echo "Exporting $name (node: $node_id)..."
  
  # Get screenshot
  if mcp-cli figma-desktop/get_screenshot "{\"nodeId\": \"$node_id\"}" | \
     jq -r '.content[0].data' | \
     base64 -d > "$OUTPUT_DIR/${name}.png"; then
    
    # Get dimensions
    dimensions=$(file "$OUTPUT_DIR/${name}.png" | grep -o '[0-9]* x [0-9]*')
    echo "  ✓ $name ($dimensions)"
  else
    echo "  ✗ Failed to export $name"
  fi
  
done < "$INPUT_CSV"

# Generate index
echo "Generating index.html..."
cat > "$OUTPUT_DIR/index.html" <<EOF
<!DOCTYPE html>
<html>
<head>
  <title>Screen Exports</title>
  <style>
    body { font-family: system-ui; padding: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; }
    img { width: 100%; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Screen Exports</h1>
  <div class="grid">
$(for img in "$OUTPUT_DIR"/*.png; do
  name=$(basename "$img" .png)
  echo "    <div class='card'><h3>$name</h3><img src='$(basename "$img")' alt='$name' /></div>"
done)
  </div>
</body>
</html>
EOF

echo "✓ Export complete! Open $OUTPUT_DIR/index.html to view"
```

### Example 4: Design Token to Tailwind Config

```bash
#!/bin/bash
# generate-tailwind-config.sh

NODE_ID="100:1000"  # Design system root

echo "Generating Tailwind config from Figma tokens..."

# Get tokens
TOKENS=$(mcp-cli figma-desktop/get_variable_defs "{\"nodeId\": \"$NODE_ID\"}")

# Convert to Tailwind format
echo "$TOKENS" | jq '{
  theme: {
    extend: {
      colors: (
        to_entries |
        map(select(.value | startswith("#"))) |
        map({
          key: (.key | gsub("/"; "-") | gsub(" "; "-") | ascii_downcase),
          value: .value
        }) |
        from_entries
      ),
      spacing: (
        to_entries |
        map(select(.value | test("^[0-9]+$"))) |
        map({
          key: (.key | gsub("/"; "-") | gsub(" "; "-") | ascii_downcase),
          value: (.value + "px")
        }) |
        from_entries
      ),
      borderRadius: (
        to_entries |
        map(select(.key | contains("Corner") or contains("Radius"))) |
        map({
          key: (.key | gsub("/"; "-") | gsub(" "; "-") | ascii_downcase),
          value: (.value + "px")
        }) |
        from_entries
      )
    }
  }
}' > tailwind.figma.json

echo "✓ Tailwind config generated!"
echo ""
echo "Add to tailwind.config.js:"
echo ""
echo "const figmaTokens = require('./tailwind.figma.json');"
echo ""
echo "module.exports = {"
echo "  ...figmaTokens,"
echo "  // ... rest of config"
echo "};"
```

---

## Quick Reference

### Common Commands

```bash
# List available tools
mcp-cli figma-desktop

# Get design code
mcp-cli figma-desktop/get_design_context '{"nodeId": "NODE_ID"}'

# Get screenshot
mcp-cli figma-desktop/get_screenshot '{"nodeId": "NODE_ID"}' | \
  jq -r '.content[0].data' | base64 -d > screenshot.png

# Get tokens
mcp-cli figma-desktop/get_variable_defs '{"nodeId": "NODE_ID"}'

# Get FigJam content
mcp-cli figma-desktop/get_figjam '{"nodeId": "NODE_ID"}'
```

### Node ID Conversion

```
Figma URL: node-id=180-22660
mcp-cli:   nodeId: "180:22660"
           (replace - with :)
```

### File Type Detection

```
figma.com/design/... → Design file (use get_design_context, get_screenshot)
figma.com/board/...  → FigJam file (use get_figjam)
```

---

## Additional Resources

- **Figma MCP Documentation**: https://www.figma.com/developers/mcp
- **Figma Desktop Download**: https://www.figma.com/downloads/
- **MCP Specification**: https://modelcontextprotocol.io
- **mcp-cli Guide**: See `patterns/mcp-patterns/mcp-cli-guide.md`

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-11  
**Maintained by:** AI Agent Documentation Team
