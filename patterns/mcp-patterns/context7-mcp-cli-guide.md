# Context7 MCP via CLI - Complete Guide for AI Agents

> **Purpose**: Comprehensive guide for AI agents to use Context7 MCP through mcp-cli for library documentation lookup and retrieval.

## Table of Contents

1. [What is Context7 MCP?](#what-is-context7-mcp)
2. [Why Use Context7 MCP via CLI?](#why-use-context7-mcp-via-cli)
3. [Installation & Configuration](#installation--configuration)
4. [Available Tools](#available-tools)
5. [Usage Patterns](#usage-patterns)
6. [Common Workflows](#common-workflows)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)
9. [Examples Library](#examples-library)

---

## What is Context7 MCP?

**Context7** is a Model Context Protocol server that provides **AI-powered library documentation search and retrieval**. It's a cloud-based service that indexes popular libraries, frameworks, and APIs, making their documentation instantly accessible to AI agents.

**Key Features:**
- 📚 **500+ Libraries Indexed** - Popular frameworks, APIs, SDKs, and tools
- 🎯 **Semantic Search** - Natural language queries to find relevant docs
- 🔍 **Library Discovery** - Search for libraries by name or description
- 📊 **Benchmark Scores** - Quality ratings for search results
- 🚀 **Always Up-to-Date** - Documentation synced regularly
- ⚡ **No Installation** - Cloud-based HTTP service

**Official Website:** https://context7.com  
**MCP Endpoint:** https://mcp.context7.com/mcp

---

## Why Use Context7 MCP via CLI?

### Context Window Efficiency

Loading Context7 MCP directly in VS Code/Copilot Chat:
- **2 tools** + full schemas loaded into context
- Tool definitions consume tokens upfront
- Always present even when not needed

Using via mcp-cli:
- Tools discovered on-demand via `mcp-cli context7`
- Only load schemas when calling specific tools
- **70%+ reduction in context usage**

### Scriptability & Integration

```bash
# Search for library in scripts
LIBRARY_ID=$(mcp-cli context7/resolve-library-id '{"name": "pandas"}' | jq -r '.[0].id')

# Get docs and pipe to processing
mcp-cli context7/query-docs "{\"library_id\": \"$LIBRARY_ID\", \"query\": \"read CSV\"}" | \
  grep -A5 "read_csv"

# Use in CI/CD for documentation validation
mcp-cli context7/query-docs '{"library_id": "fastapi", "query": "authentication"}' > docs.json
```

### On-Demand Documentation

Unlike static documentation websites, Context7 provides:
- **Relevance-ranked results** via semantic search
- **Multiple library versions** when available
- **Snippet counts** to gauge coverage
- **Benchmark scores** for quality assessment

---

## Installation & Configuration

### Prerequisites

Context7 MCP is a **cloud-based HTTP service** - no installation required. You only need:
- mcp-cli installed (see [MCP-CLI-GUIDE.md](MCP-CLI-GUIDE.md))
- Internet connection

### Configuration

Add to `~/.config/mcp/mcp_servers.json`:

```json
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
```

**That's it!** Context7 is ready to use.

### Verification

```bash
# List available tools
mcp-cli context7

# Expected output:
# context7
#   - resolve-library-id
#   - query-docs
```

---

## Available Tools

Context7 MCP provides **2 tools** for library documentation access:

### Tool 1: `resolve-library-id`

**Purpose:** Search for libraries by name and get their unique identifiers.

**When to use:**
- Finding the correct library ID for documentation queries
- Discovering available libraries and versions
- Checking if a library is indexed by Context7

**Input Schema:**
```bash
mcp-cli context7/resolve-library-id
```

**Parameters:**
```json
{
  "name": "string (required)",  // Library name or partial name
  "limit": "number (optional)"   // Max results (default: 10)
}
```

**Output:** Array of libraries with:
- `id` - Unique library identifier (e.g., "dataforseo-v3-api", "pandas-2.2.0")
- `name` - Display name
- `description` - Brief description
- `version` - Library version (if applicable)
- `snippets_count` - Number of documentation snippets indexed
- `benchmark_score` - Quality/relevance score (0-100)

**Example:**
```bash
mcp-cli context7/resolve-library-id '{"name": "pandas", "limit": 5}'
```

**Output:**
```json
[
  {
    "id": "pandas-2.2.0",
    "name": "Pandas 2.2.0",
    "description": "Python Data Analysis Library",
    "version": "2.2.0",
    "snippets_count": 1247,
    "benchmark_score": 94.5
  },
  {
    "id": "pandas-1.5.3",
    "name": "Pandas 1.5.3",
    "version": "1.5.3",
    "snippets_count": 1189,
    "benchmark_score": 91.2
  }
]
```

---

### Tool 2: `query-docs`

**Purpose:** Search library documentation with natural language queries.

**When to use:**
- Finding specific API usage examples
- Looking up function/method signatures
- Understanding library features and patterns
- Getting code snippets for specific tasks

**Input Schema:**
```bash
mcp-cli context7/query-docs
```

**Parameters:**
```json
{
  "library_id": "string (required)",  // From resolve-library-id
  "query": "string (required)",        // Natural language search query
  "limit": "number (optional)"         // Max results (default: 5)
}
```

**Output:** Array of documentation snippets with:
- `title` - Section/topic title
- `content` - Documentation text (may include code examples)
- `url` - Source documentation URL (if available)
- `score` - Relevance score for the query (0-100)
- `section` - Documentation section/category

**Example:**
```bash
mcp-cli context7/query-docs '{"library_id": "pandas-2.2.0", "query": "how to read CSV file", "limit": 3}'
```

**Output:**
```json
[
  {
    "title": "pandas.read_csv",
    "content": "Read a comma-separated values (CSV) file into DataFrame.\n\nParameters:\n- filepath_or_buffer: str, path object or file-like object\n- sep: str, default ','\n- header: int, list of int, default 'infer'\n\nExample:\n```python\nimport pandas as pd\ndf = pd.read_csv('data.csv')\n```",
    "url": "https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html",
    "score": 98.5,
    "section": "Input/Output"
  }
]
```

---

## Usage Patterns

### Pattern 1: Two-Step Workflow (Discover → Query)

**Always follow this workflow when looking up documentation:**

```bash
# Step 1: Find library ID
mcp-cli context7/resolve-library-id '{"name": "fastapi"}'

# Output: [{"id": "fastapi-0.109.0", "name": "FastAPI 0.109.0", ...}]

# Step 2: Query documentation
mcp-cli context7/query-docs '{"library_id": "fastapi-0.109.0", "query": "authentication"}'
```

### Pattern 2: Using JSON Processing (jq)

Extract specific fields for scripting:

```bash
# Get first library ID
LIBRARY_ID=$(mcp-cli context7/resolve-library-id '{"name": "requests"}' | jq -r '.[0].id')

# Query and extract just the content
mcp-cli context7/query-docs "{\"library_id\": \"$LIBRARY_ID\", \"query\": \"POST request\"}" | \
  jq -r '.[].content'
```

### Pattern 3: Multiple Library Versions

When multiple versions exist, choose the right one:

```bash
# List all versions
mcp-cli context7/resolve-library-id '{"name": "django", "limit": 10}'

# Output:
# [
#   {"id": "django-5.0", "version": "5.0", "benchmark_score": 95.0},
#   {"id": "django-4.2", "version": "4.2", "benchmark_score": 94.5},
#   {"id": "django-3.2", "version": "3.2", "benchmark_score": 89.0}
# ]

# Query specific version
mcp-cli context7/query-docs '{"library_id": "django-5.0", "query": "async views"}'
```

### Pattern 4: Broad vs Specific Queries

**Broad queries** - Get overview/introduction:
```bash
mcp-cli context7/query-docs '{"library_id": "tensorflow-2.15", "query": "getting started"}'
```

**Specific queries** - Get API details:
```bash
mcp-cli context7/query-docs '{"library_id": "tensorflow-2.15", "query": "tf.keras.layers.Dense parameters"}'
```

### Pattern 5: Using Benchmark Scores

Filter libraries by quality:

```bash
# Get all results
ALL=$(mcp-cli context7/resolve-library-id '{"name": "rest api", "limit": 20}')

# Filter for high-quality libraries (score > 85)
echo "$ALL" | jq '.[] | select(.benchmark_score > 85)'
```

---

## Common Workflows

### Workflow 1: Quick API Lookup

**Scenario:** You need to know how to use a specific API.

```bash
# Example: DataForSEO API authentication

# Step 1: Find library
mcp-cli context7/resolve-library-id '{"name": "dataforseo"}'
# Output: [{"id": "dataforseo-v3-api", ...}]

# Step 2: Query authentication
mcp-cli context7/query-docs '{"library_id": "dataforseo-v3-api", "query": "authentication"}'
```

**Real output:**
```json
[
  {
    "title": "Authentication",
    "content": "DataForSEO uses HTTP Basic Authentication...\n\nExample:\n```bash\ncurl -u login:password https://api.dataforseo.com/v3/serp/google/organic/live/advanced\n```",
    "score": 97.2
  }
]
```

### Workflow 2: Compare Documentation Across Versions

**Scenario:** Check if a feature exists in different library versions.

```bash
#!/bin/bash
# compare-versions.sh

LIBRARY="pandas"
QUERY="read_parquet"

# Get all versions
VERSIONS=$(mcp-cli context7/resolve-library-id "{\"name\": \"$LIBRARY\", \"limit\": 5}" | \
  jq -r '.[].id')

# Query each version
for VERSION in $VERSIONS; do
  echo "=== $VERSION ==="
  mcp-cli context7/query-docs "{\"library_id\": \"$VERSION\", \"query\": \"$QUERY\", \"limit\": 1}" | \
    jq -r '.[0].title // "Not found"'
  echo ""
done
```

### Workflow 3: Build Custom Documentation Cache

**Scenario:** Pre-fetch commonly used docs for offline reference.

```bash
#!/bin/bash
# cache-docs.sh

LIBRARY_ID="fastapi-0.109.0"
QUERIES=("authentication" "dependency injection" "background tasks" "websockets" "testing")

mkdir -p docs-cache

for QUERY in "${QUERIES[@]}"; do
  FILENAME=$(echo "$QUERY" | tr ' ' '-')
  echo "Fetching: $QUERY"
  
  mcp-cli context7/query-docs "{\"library_id\": \"$LIBRARY_ID\", \"query\": \"$QUERY\"}" > \
    "docs-cache/${FILENAME}.json"
done

echo "✅ Cached ${#QUERIES[@]} documentation topics"
```

### Workflow 4: Search Multiple Libraries

**Scenario:** Find which library has the best documentation for a specific topic.

```bash
#!/bin/bash
# find-best-library.sh

TOPIC="authentication middleware"
LIBRARIES=("fastapi" "flask" "django" "starlette")

echo "Searching for: $TOPIC"
echo "===================="

for LIB in "${LIBRARIES[@]}"; do
  # Get library ID
  LIB_ID=$(mcp-cli context7/resolve-library-id "{\"name\": \"$LIB\", \"limit\": 1}" | jq -r '.[0].id')
  
  if [ "$LIB_ID" != "null" ]; then
    # Query docs
    RESULT=$(mcp-cli context7/query-docs "{\"library_id\": \"$LIB_ID\", \"query\": \"$TOPIC\", \"limit\": 1}")
    SCORE=$(echo "$RESULT" | jq -r '.[0].score // 0')
    
    echo "$LIB: Score $SCORE"
  fi
done
```

### Workflow 5: Documentation-Driven Code Generation

**Scenario:** Generate code based on documentation snippets.

```bash
#!/bin/bash
# generate-code.sh

LIBRARY_ID="requests-2.31.0"
TASK="make POST request with JSON body"

# Get documentation
DOCS=$(mcp-cli context7/query-docs "{\"library_id\": \"$LIBRARY_ID\", \"query\": \"$TASK\", \"limit\": 1}")

# Extract code snippet
CODE=$(echo "$DOCS" | jq -r '.[0].content' | sed -n '/```python/,/```/p' | sed '1d;$d')

# Save to file
echo "$CODE" > generated_code.py

echo "✅ Code generated from documentation"
cat generated_code.py
```

---

## Troubleshooting

### Issue 1: Library Not Found

**Error:**
```json
[]
```

**Cause:** Library name is incorrect or not indexed by Context7.

**Solutions:**

1. **Try partial name matching:**
```bash
# Instead of exact name
mcp-cli context7/resolve-library-id '{"name": "tensorflow"}'

# Try variations
mcp-cli context7/resolve-library-id '{"name": "tensor"}'
mcp-cli context7/resolve-library-id '{"name": "tf"}'
```

2. **Search by description/category:**
```bash
# Search by type
mcp-cli context7/resolve-library-id '{"name": "machine learning"}'
mcp-cli context7/resolve-library-id '{"name": "web framework"}'
```

3. **Increase limit:**
```bash
# Get more results
mcp-cli context7/resolve-library-id '{"name": "api", "limit": 50}'
```

### Issue 2: No Documentation Results

**Error:**
```json
[]
```

**Cause:** Query is too specific, misspelled, or feature not documented.

**Solutions:**

1. **Broaden your query:**
```bash
# Too specific
mcp-cli context7/query-docs '{"library_id": "pandas", "query": "pd.DataFrame.iloc[0:5, 2:4]"}'

# Better - broader
mcp-cli context7/query-docs '{"library_id": "pandas", "query": "DataFrame slicing"}'
```

2. **Use natural language:**
```bash
# Technical jargon may not match
mcp-cli context7/query-docs '{"library_id": "requests", "query": "HTTP 401 handling"}'

# Better - natural language
mcp-cli context7/query-docs '{"library_id": "requests", "query": "handle authentication errors"}'
```

3. **Try related terms:**
```bash
# Original
mcp-cli context7/query-docs '{"library_id": "fastapi", "query": "middleware"}'

# Alternative
mcp-cli context7/query-docs '{"library_id": "fastapi", "query": "request hooks"}'
```

### Issue 3: Invalid Library ID

**Error:**
```
Error: Invalid library_id
```

**Cause:** Using library name instead of ID, or typo in ID.

**Solution:** Always use `resolve-library-id` first:
```bash
# Wrong - using name
mcp-cli context7/query-docs '{"library_id": "pandas", "query": "read CSV"}'

# Right - use ID from resolve-library-id
LIBRARY_ID=$(mcp-cli context7/resolve-library-id '{"name": "pandas"}' | jq -r '.[0].id')
mcp-cli context7/query-docs "{\"library_id\": \"$LIBRARY_ID\", \"query\": \"read CSV\"}"
```

### Issue 4: Connection Timeout

**Error:**
```
Error: Request timeout
```

**Cause:** Network issues or Context7 service temporarily unavailable.

**Solutions:**

1. **Check internet connection:**
```bash
curl -I https://mcp.context7.com/mcp
```

2. **Retry with exponential backoff:**
```bash
for i in {1..3}; do
  if mcp-cli context7/resolve-library-id '{"name": "pandas"}'; then
    break
  else
    echo "Retry $i failed, waiting..."
    sleep $((2 ** i))
  fi
done
```

3. **Check service status:**
```bash
# Visit https://context7.com for status updates
```

### Issue 5: Outdated Documentation

**Symptom:** Documentation doesn't match latest library version.

**Solution:** Check available versions and choose the right one:
```bash
# List all versions
mcp-cli context7/resolve-library-id '{"name": "django", "limit": 10}'

# Choose latest
mcp-cli context7/query-docs '{"library_id": "django-5.0", "query": "async views"}'
```

---

## Best Practices

### 1. Always Resolve Library ID First

```bash
# DO: Two-step workflow
LIBRARY_ID=$(mcp-cli context7/resolve-library-id '{"name": "fastapi"}' | jq -r '.[0].id')
mcp-cli context7/query-docs "{\"library_id\": \"$LIBRARY_ID\", \"query\": \"authentication\"}"

# DON'T: Guess library ID
mcp-cli context7/query-docs '{"library_id": "fastapi", "query": "authentication"}'
```

### 2. Use Natural Language Queries

```bash
# DO: Natural language
mcp-cli context7/query-docs '{"library_id": "requests", "query": "how to make POST request with JSON"}'

# DON'T: Exact function names (unless searching for specific API)
mcp-cli context7/query-docs '{"library_id": "requests", "query": "requests.post()"}'
```

### 3. Check Benchmark Scores

```bash
# Get libraries with quality scores
RESULTS=$(mcp-cli context7/resolve-library-id '{"name": "http client"}')

# Filter for high-quality (score > 90)
echo "$RESULTS" | jq '.[] | select(.benchmark_score > 90)'
```

### 4. Limit Results Appropriately

```bash
# DO: Use reasonable limits
mcp-cli context7/query-docs '{"library_id": "pandas", "query": "data cleaning", "limit": 3}'

# DON'T: Fetch too many results (wastes tokens)
mcp-cli context7/query-docs '{"library_id": "pandas", "query": "data cleaning", "limit": 100}'
```

### 5. Cache Frequently Used Docs

```bash
# Create reusable cache
mkdir -p ~/.context7-cache

# Cache common queries
LIBRARY_ID="fastapi-0.109.0"
mcp-cli context7/query-docs "{\"library_id\": \"$LIBRARY_ID\", \"query\": \"authentication\"}" > \
  ~/.context7-cache/fastapi-auth.json

# Reuse cache
cat ~/.context7-cache/fastapi-auth.json
```

### 6. Combine with Other Tools

```bash
# Get docs and format with jq
mcp-cli context7/query-docs '{"library_id": "pandas", "query": "read CSV"}' | \
  jq -r '.[0].content' | \
  grep -A10 "Example"

# Pipe to less for readability
mcp-cli context7/query-docs '{"library_id": "django", "query": "models"}' | \
  jq -r '.[].content' | \
  less
```

### 7. Handle Missing Libraries Gracefully

```bash
#!/bin/bash
# safe-query.sh

LIBRARY_NAME="$1"
QUERY="$2"

# Resolve library
RESULT=$(mcp-cli context7/resolve-library-id "{\"name\": \"$LIBRARY_NAME\"}")

if [ "$(echo "$RESULT" | jq '. | length')" -eq 0 ]; then
  echo "❌ Library '$LIBRARY_NAME' not found in Context7"
  echo "Try searching with: mcp-cli context7/resolve-library-id '{\"name\": \"$LIBRARY_NAME\", \"limit\": 20}'"
  exit 1
fi

LIBRARY_ID=$(echo "$RESULT" | jq -r '.[0].id')
echo "✅ Found library: $LIBRARY_ID"

# Query docs
mcp-cli context7/query-docs "{\"library_id\": \"$LIBRARY_ID\", \"query\": \"$QUERY\"}"
```

---

## Examples Library

### Example 1: Find DataForSEO Authentication

```bash
# Step 1: Search for DataForSEO libraries
mcp-cli context7/resolve-library-id '{"name": "dataforseo"}'

# Output:
# [
#   {"id": "dataforseo-v3-api", "name": "DataForSEO V3 API", "snippets_count": 428, "benchmark_score": 88.5},
#   {"id": "dataforseo-python-client", "name": "DataForSEO Python Client", ...}
# ]

# Step 2: Query authentication docs
mcp-cli context7/query-docs '{"library_id": "dataforseo-v3-api", "query": "authentication", "limit": 2}'

# Output:
# [
#   {
#     "title": "Authentication",
#     "content": "DataForSEO API uses HTTP Basic Authentication...\n\nExample:\n```bash\ncurl -u login:password https://api.dataforseo.com/v3/...\n```",
#     "score": 97.2
#   }
# ]
```

### Example 2: Compare Pandas vs Polars for CSV Reading

```bash
#!/bin/bash
# compare-csv-libs.sh

echo "=== Pandas ==="
PANDAS_ID=$(mcp-cli context7/resolve-library-id '{"name": "pandas"}' | jq -r '.[0].id')
mcp-cli context7/query-docs "{\"library_id\": \"$PANDAS_ID\", \"query\": \"read CSV file\", \"limit\": 1}" | \
  jq -r '.[0].content' | head -20

echo -e "\n=== Polars ==="
POLARS_ID=$(mcp-cli context7/resolve-library-id '{"name": "polars"}' | jq -r '.[0].id')
mcp-cli context7/query-docs "{\"library_id\": \"$POLARS_ID\", \"query\": \"read CSV file\", \"limit\": 1}" | \
  jq -r '.[0].content' | head -20
```

### Example 3: Build Documentation Reference

```bash
#!/bin/bash
# build-reference.sh - Create markdown docs from Context7

LIBRARY_NAME="fastapi"
OUTPUT_FILE="fastapi-reference.md"

# Resolve library
LIBRARY_ID=$(mcp-cli context7/resolve-library-id "{\"name\": \"$LIBRARY_NAME\"}" | jq -r '.[0].id')

echo "# $LIBRARY_NAME Documentation Reference" > "$OUTPUT_FILE"
echo "Generated from Context7 on $(date)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Common topics
TOPICS=("getting started" "routing" "dependency injection" "authentication" "database" "testing")

for TOPIC in "${TOPICS[@]}"; do
  echo "## $TOPIC" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
  # Query and extract content
  mcp-cli context7/query-docs "{\"library_id\": \"$LIBRARY_ID\", \"query\": \"$TOPIC\", \"limit\": 1}" | \
    jq -r '.[0].content' >> "$OUTPUT_FILE"
  
  echo "" >> "$OUTPUT_FILE"
  echo "---" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
done

echo "✅ Reference created: $OUTPUT_FILE"
```

### Example 4: Find Best Library for a Task

```bash
#!/bin/bash
# find-best-for-task.sh

TASK="OAuth2 authentication"

echo "Finding best library for: $TASK"
echo "================================"

# Search for OAuth libraries
LIBRARIES=$(mcp-cli context7/resolve-library-id '{"name": "oauth", "limit": 10}')

# Query each and score
echo "$LIBRARIES" | jq -r '.[].id' | while read LIBRARY_ID; do
  RESULT=$(mcp-cli context7/query-docs "{\"library_id\": \"$LIBRARY_ID\", \"query\": \"$TASK\", \"limit\": 1}")
  SCORE=$(echo "$RESULT" | jq -r '.[0].score // 0')
  
  if (( $(echo "$SCORE > 80" | bc -l) )); then
    echo "✅ $LIBRARY_ID - Score: $SCORE"
    echo "$RESULT" | jq -r '.[0].title'
    echo ""
  fi
done
```

### Example 5: Extract Code Examples

```bash
#!/bin/bash
# extract-examples.sh

LIBRARY_ID="requests-2.31.0"
QUERY="POST request with JSON"

# Get documentation
DOCS=$(mcp-cli context7/query-docs "{\"library_id\": \"$LIBRARY_ID\", \"query\": \"$QUERY\"}")

# Extract all code blocks
echo "$DOCS" | jq -r '.[].content' | sed -n '/```python/,/```/p' | sed '1d;$d'

# Or save to file
echo "$DOCS" | jq -r '.[0].content' | sed -n '/```python/,/```/p' | sed '1d;$d' > example.py
```

### Example 6: Monitor Documentation Updates

```bash
#!/bin/bash
# monitor-docs.sh - Check if library docs changed

LIBRARY_NAME="fastapi"
QUERY="authentication"
CACHE_FILE="~/.context7-cache/${LIBRARY_NAME}-${QUERY}.json"

# Get current docs
LIBRARY_ID=$(mcp-cli context7/resolve-library-id "{\"name\": \"$LIBRARY_NAME\"}" | jq -r '.[0].id')
CURRENT=$(mcp-cli context7/query-docs "{\"library_id\": \"$LIBRARY_ID\", \"query\": \"$QUERY\"}")

# Compare with cache
if [ -f "$CACHE_FILE" ]; then
  CACHED=$(cat "$CACHE_FILE")
  
  if [ "$CURRENT" != "$CACHED" ]; then
    echo "⚠️  Documentation updated for $LIBRARY_NAME - $QUERY"
    diff <(echo "$CACHED" | jq -r '.[0].content') <(echo "$CURRENT" | jq -r '.[0].content')
  else
    echo "✅ No changes"
  fi
fi

# Update cache
echo "$CURRENT" > "$CACHE_FILE"
```

---

## Integration Examples

### With AI Prompts

```bash
#!/bin/bash
# ai-assisted-coding.sh

LIBRARY="pandas"
TASK="merge two DataFrames on multiple columns"

# Get documentation
LIBRARY_ID=$(mcp-cli context7/resolve-library-id "{\"name\": \"$LIBRARY\"}" | jq -r '.[0].id')
DOCS=$(mcp-cli context7/query-docs "{\"library_id\": \"$LIBRARY_ID\", \"query\": \"$TASK\"}")

# Extract relevant content
CONTEXT=$(echo "$DOCS" | jq -r '.[0].content')

# Use with AI (example - pipe to LLM CLI)
echo "Based on this documentation, write Python code to $TASK:

$CONTEXT

Code:" | llm generate
```

### With IDE Integration

```bash
#!/bin/bash
# vscode-snippet.sh - Generate VS Code snippet from docs

LIBRARY_ID="fastapi-0.109.0"
QUERY="dependency injection"

# Get docs
DOCS=$(mcp-cli context7/query-docs "{\"library_id\": \"$LIBRARY_ID\", \"query\": \"$QUERY\", \"limit\": 1}")

# Extract code and create snippet
CODE=$(echo "$DOCS" | jq -r '.[0].content' | sed -n '/```python/,/```/p' | sed '1d;$d')

# Generate VS Code snippet JSON
cat > fastapi-dependency.code-snippets <<EOF
{
  "FastAPI Dependency Injection": {
    "prefix": "fastapi-dep",
    "body": [
$(echo "$CODE" | sed 's/^/      "/; s/$/",/')
    ],
    "description": "$(echo "$DOCS" | jq -r '.[0].title')"
  }
}
EOF
```

---

## Advanced Usage

### Parallel Queries

```bash
#!/bin/bash
# parallel-queries.sh

LIBRARY_ID="django-5.0"
QUERIES=("models" "views" "forms" "admin" "authentication")

# Query in parallel
for QUERY in "${QUERIES[@]}"; do
  (
    mcp-cli context7/query-docs "{\"library_id\": \"$LIBRARY_ID\", \"query\": \"$QUERY\", \"limit\": 1}" > \
      "docs-${QUERY}.json"
  ) &
done

# Wait for all
wait
echo "✅ All queries completed"
```

### Version Comparison

```bash
#!/bin/bash
# compare-versions.sh

LIBRARY="react"
FEATURE="hooks"

# Get all versions
VERSIONS=$(mcp-cli context7/resolve-library-id "{\"name\": \"$LIBRARY\", \"limit\": 5}" | jq -r '.[].id')

# Compare feature across versions
for VERSION in $VERSIONS; do
  echo "=== $VERSION ==="
  mcp-cli context7/query-docs "{\"library_id\": \"$VERSION\", \"query\": \"$FEATURE\", \"limit\": 1}" | \
    jq -r '.[0].title // "Not available"'
done
```

---

## Key Takeaways for AI Agents

1. **Always use the two-step workflow**: `resolve-library-id` → `query-docs`
2. **Library IDs are required** - you cannot use library names directly in queries
3. **Use natural language queries** - Context7 uses semantic search
4. **Check benchmark scores** to assess documentation quality
5. **Cache frequently used docs** to reduce API calls
6. **Combine with jq** for powerful JSON processing
7. **Context7 is HTTP-based** - no local installation needed
8. **Limit results appropriately** to save context window tokens
9. **Try broader queries first** if specific queries return no results
10. **Use snippets_count** to gauge documentation coverage

---

## Quick Reference

### Essential Commands

```bash
# Add to config
cat >> ~/.config/mcp/mcp_servers.json <<EOF
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
EOF

# List tools
mcp-cli context7

# Find library
mcp-cli context7/resolve-library-id '{"name": "pandas"}'

# Query docs
mcp-cli context7/query-docs '{"library_id": "pandas-2.2.0", "query": "read CSV"}'

# With jq processing
LIBRARY_ID=$(mcp-cli context7/resolve-library-id '{"name": "fastapi"}' | jq -r '.[0].id')
mcp-cli context7/query-docs "{\"library_id\": \"$LIBRARY_ID\", \"query\": \"authentication\"}" | jq -r '.[0].content'
```

---

## Comparison with Alternatives

| Feature | Context7 MCP | Official Docs Website | Package Documentation |
|---------|--------------|----------------------|----------------------|
| **Semantic Search** | ✅ Yes | ❌ No (keyword only) | ❌ No |
| **Multiple Libraries** | ✅ 500+ indexed | ❌ One per site | ❌ One per package |
| **Version Comparison** | ✅ Easy | ⚠️ Manual | ⚠️ Manual |
| **CLI Access** | ✅ Yes | ❌ No | ⚠️ Limited |
| **Relevance Scoring** | ✅ Yes | ❌ No | ❌ No |
| **Code Examples** | ✅ Included | ✅ Yes | ✅ Yes |
| **API Integration** | ✅ MCP protocol | ⚠️ Some have APIs | ❌ No |
| **Offline Access** | ❌ Requires internet | ✅ Can cache | ✅ Local |

---

## Additional Resources

- **Context7 Website**: https://context7.com
- **MCP Specification**: https://modelcontextprotocol.io/
- **mcp-cli Guide**: See [MCP-CLI-GUIDE.md](MCP-CLI-GUIDE.md) in this repository
- **jq Documentation**: https://jqlang.github.io/jq/

---

**Document Version:** 1.0  
**Last Updated:** January 10, 2026  
**Author:** AI Agent Training Documentation
