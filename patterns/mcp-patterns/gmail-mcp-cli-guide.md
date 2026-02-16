# Gmail MCP via CLI - Complete Guide for AI Agents

> **Purpose**: Comprehensive guide for AI agents to use Gmail MCP through mcp-cli for email management, thread handling, label organization, and draft composition.

## Table of Contents

1. [What is Gmail MCP?](#what-is-gmail-mcp)
2. [Why Use Gmail MCP via CLI?](#why-use-gmail-mcp-via-cli)
3. [Installation & Configuration](#installation--configuration)
4. [Available Tools](#available-tools)
5. [Usage Patterns](#usage-patterns)
6. [Common Workflows](#common-workflows)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)
9. [Examples Library](#examples-library)

---

## What is Gmail MCP?

**Gmail MCP** is a Model Context Protocol server that provides AI assistants with access to Gmail operations through an n8n-hosted workflow endpoint. It enables AI agents to search, read, reply to, label, and manage email messages, threads, drafts, and labels.

**Key Features:**
- **21 tools** covering messages, threads, drafts, and labels
- **Gmail search syntax** support for powerful email filtering
- **Thread-level operations** for conversation management
- **Label management** for email organization
- **Draft composition** with attachment support
- **Read/unread tracking** for inbox management

**Server type:** URL-based (n8n workflow endpoint)

---

## Why Use Gmail MCP via CLI?

### Context Window Efficiency

Loading Gmail MCP directly in VS Code/Copilot Chat:
- **21 tools** + schemas loaded into context
- Consumes tokens upfront
- Always present even when not needed

Using via mcp-cli:
- Tools discovered on-demand via `mcp-cli ms-gmail_mcp`
- Only load schemas when calling specific tools
- **Significant reduction in context usage**

### Scriptability & Automation

```bash
# Search for emails from a sender
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "from:boss@company.com", "Received_After": "", "Received_Before": "", "Sender": ""}'

# Get a specific message
mcp-cli ms-gmail_mcp/get '{"Message_ID": "19c08f59ebf736ee"}'

# Label management
mcp-cli ms-gmail_mcp/getLabels '{"Return_All": true}'
```

---

## Installation & Configuration

### Prerequisites

- **mcp-cli** installed (see [MCP-CLI-GUIDE.md](MCP-CLI-GUIDE.md))
- Gmail MCP workflow endpoint URL (hosted on n8n)

### Step 1: Configure mcp-cli

Add to `~/.config/mcp/mcp_servers.json`:

```json
{
  "mcpServers": {
    "ms-gmail_mcp": {
      "url": "https://workflows.moneysmart.co/mcp/<your-workflow-id>"
    }
  }
}
```

### Step 2: Verify Installation

```bash
# List available tools
mcp-cli ms-gmail_mcp

# List with descriptions
mcp-cli ms-gmail_mcp -d

# Test connectivity by fetching labels
mcp-cli ms-gmail_mcp/getLabels '{"Return_All": true}'
```

---

## Available Tools

Gmail MCP provides **21 tools** organized into four categories: Messages, Threads, Drafts, and Labels.

### Messages (8 tools)

#### 1. `search`

**Purpose:** Search for email messages using Gmail query syntax.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Return_All` | boolean | yes | Whether to return all matching messages |
| `Search` | string | yes | Gmail query string (supports full Gmail search syntax) |
| `Received_After` | string | yes | RFC3339 datetime filter (e.g., `2026-01-01T00:00:00Z`). Pass `""` to skip |
| `Received_Before` | string | yes | RFC3339 datetime filter. Pass `""` to skip |
| `Sender` | string | yes | Filter by sender email address. Pass `""` to skip |

**Examples:**
```bash
# Search for recent emails
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "newer_than:1d", "Received_After": "", "Received_Before": "", "Sender": ""}'

# Search by sender
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "", "Received_After": "", "Received_Before": "", "Sender": "alice@example.com"}'

# Search by subject
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "subject:quarterly report", "Received_After": "", "Received_Before": "", "Sender": ""}'

# Search with date range
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "is:unread", "Received_After": "2026-01-20T00:00:00Z", "Received_Before": "2026-01-29T23:59:59Z", "Sender": ""}'

# Search by label
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "label:INBOX is:unread", "Received_After": "", "Received_Before": "", "Sender": ""}'
```

**Gmail Search Syntax Quick Reference:**
| Query | Description |
|-------|-------------|
| `from:user@example.com` | From specific sender |
| `to:user@example.com` | To specific recipient |
| `subject:meeting` | Subject contains "meeting" |
| `is:unread` | Unread messages |
| `is:starred` | Starred messages |
| `has:attachment` | Messages with attachments |
| `newer_than:1d` | Received in last 1 day |
| `newer_than:7d` | Received in last 7 days |
| `label:INBOX` | Messages in INBOX |
| `in:sent` | Sent messages |
| `{from:a OR from:b}` | From either sender |

---

#### 2. `get`

**Purpose:** Retrieve full details of a specific email message.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Message_ID` | string | yes | The ID of the message to retrieve |

**Example:**
```bash
mcp-cli ms-gmail_mcp/get '{"Message_ID": "19c08f59ebf736ee"}'
```

**Output includes:** Message ID, thread ID, snippet, labels, From, To, Subject, size, internal date (Unix timestamp in ms).

---

#### 3. `reply`

**Purpose:** Reply to a specific email message.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Message_ID` | string | yes | The ID of the message to reply to |
| `Message` | string | yes | The reply body content |
| `Attachment_Field_Name` | string | yes | Input field name for attachments. Pass `""` if none |
| `BCC` | string | yes | Comma-separated BCC recipients. Pass `""` if none |
| `CC` | string | yes | Comma-separated CC recipients. Pass `""` if none |

**Example:**
```bash
# Simple reply
mcp-cli ms-gmail_mcp/reply '{"Message_ID": "19c08f59ebf736ee", "Message": "Thanks for the update!", "Attachment_Field_Name": "", "BCC": "", "CC": ""}'

# Reply with CC
mcp-cli ms-gmail_mcp/reply '{"Message_ID": "19c08f59ebf736ee", "Message": "Looping in the team.", "Attachment_Field_Name": "", "BCC": "", "CC": "team@example.com"}'
```

---

#### 4. `delete`

**Purpose:** Permanently delete an email message.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Message_ID` | string | yes | The ID of the message to delete |

**Example:**
```bash
mcp-cli ms-gmail_mcp/delete '{"Message_ID": "19c08f59ebf736ee"}'
```

> **Warning:** This permanently deletes the message. It does not move it to Trash.

---

#### 5. `addLabels`

**Purpose:** Add one or more labels to an email message.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Message_ID` | string | yes | The ID of the message |
| `Label_Names_or_IDs` | string | yes | Comma-separated label names or IDs |

**Example:**
```bash
mcp-cli ms-gmail_mcp/addLabels '{"Message_ID": "19c08f59ebf736ee", "Label_Names_or_IDs": "IMPORTANT,STARRED"}'
```

---

#### 6. `removeLabels`

**Purpose:** Remove one or more labels from an email message.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Message_ID` | string | yes | The ID of the message |
| `Label_Names_or_IDs` | string | yes | Comma-separated label names or IDs |

**Example:**
```bash
mcp-cli ms-gmail_mcp/removeLabels '{"Message_ID": "19c08f59ebf736ee", "Label_Names_or_IDs": "UNREAD"}'
```

---

#### 7. `markAsRead`

**Purpose:** Mark an email message as read.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Message_ID` | string | yes | The ID of the message |

**Example:**
```bash
mcp-cli ms-gmail_mcp/markAsRead '{"Message_ID": "19c08f59ebf736ee"}'
```

---

#### 8. `markAsUnread`

**Purpose:** Mark an email message as unread.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Message_ID` | string | yes | The ID of the message |

**Example:**
```bash
mcp-cli ms-gmail_mcp/markAsUnread '{"Message_ID": "19c08f59ebf736ee"}'
```

---

### Threads (4 tools)

#### 9. `getManyThreads`

**Purpose:** Retrieve multiple email threads based on filters.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Return_All` | boolean | yes | Whether to return all matching threads |
| `Search` | string | yes | Gmail query string to filter threads |
| `Received_After` | string | yes | Datetime filter. Pass `""` to skip |
| `Received_Before` | string | yes | Datetime filter. Pass `""` to skip |

**Examples:**
```bash
# Get recent threads
mcp-cli ms-gmail_mcp/getManyThreads '{"Return_All": false, "Search": "newer_than:1d", "Received_After": "", "Received_Before": ""}'

# Get threads from a specific sender
mcp-cli ms-gmail_mcp/getManyThreads '{"Return_All": false, "Search": "from:boss@company.com", "Received_After": "", "Received_Before": ""}'
```

---

#### 10. `getThread`

**Purpose:** Retrieve full details of a specific email thread (all messages in the conversation).

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Thread_ID` | string | yes | The ID of the thread |

**Example:**
```bash
mcp-cli ms-gmail_mcp/getThread '{"Thread_ID": "19c08f59ebf736ee"}'
```

---

#### 11. `replyThread`

**Purpose:** Reply to an email thread.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Thread_ID` | string | yes | The ID of the thread to reply to |
| `Message` | string | yes | The reply body content |
| `BCC` | string | yes | Comma-separated BCC recipients. Pass `""` if none |
| `CC` | string | yes | Comma-separated CC recipients. Pass `""` if none |

**Example:**
```bash
mcp-cli ms-gmail_mcp/replyThread '{"Thread_ID": "19c08f59ebf736ee", "Message": "Thanks everyone, noted.", "BCC": "", "CC": ""}'
```

---

#### 12. `addLabelThread`

**Purpose:** Add one or more labels to an entire email thread.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Thread_ID` | string | yes | The ID of the thread |
| `Label_Names_or_IDs` | string | yes | Comma-separated label names or IDs |

**Example:**
```bash
mcp-cli ms-gmail_mcp/addLabelThread '{"Thread_ID": "19c08f59ebf736ee", "Label_Names_or_IDs": "IMPORTANT"}'
```

---

#### 13. `removeLabelThread`

**Purpose:** Remove one or more labels from an entire email thread.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Thread_ID` | string | yes | The ID of the thread |
| `Label_Names_or_IDs` | string | yes | Comma-separated label names or IDs |

**Example:**
```bash
mcp-cli ms-gmail_mcp/removeLabelThread '{"Thread_ID": "19c08f59ebf736ee", "Label_Names_or_IDs": "INBOX"}'
```

---

### Drafts (4 tools)

#### 14. `createDraft`

**Purpose:** Create a new email draft.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Subject` | string | yes | The subject line |
| `Message` | string | yes | The body of the draft |
| `Attachment_Field_Name__in_Input_` | string | yes | Input field name for attachments. Pass `""` if none |
| `BCC` | string | yes | Comma-separated BCC recipients. Pass `""` if none |
| `CC` | string | yes | Comma-separated CC recipients. Pass `""` if none |

**Example:**
```bash
# Create a simple draft
mcp-cli ms-gmail_mcp/createDraft '{"Subject": "Weekly Update", "Message": "Hi team, here is the weekly update...", "Attachment_Field_Name__in_Input_": "", "BCC": "", "CC": ""}'

# Create draft with CC
mcp-cli ms-gmail_mcp/createDraft '{"Subject": "Project Proposal", "Message": "Please review the attached proposal.", "Attachment_Field_Name__in_Input_": "", "BCC": "", "CC": "manager@company.com"}'
```

---

#### 15. `getManyDrafts`

**Purpose:** Retrieve multiple email drafts.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Return_All` | boolean | yes | Whether to return all drafts |
| `Include_Spam_and_Trash` | boolean | yes | Whether to include drafts in spam or trash |

**Example:**
```bash
mcp-cli ms-gmail_mcp/getManyDrafts '{"Return_All": true, "Include_Spam_and_Trash": false}'
```

---

#### 16. `getDraft`

**Purpose:** Retrieve a specific email draft.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Draft_ID` | string | yes | The ID of the draft |

**Example:**
```bash
mcp-cli ms-gmail_mcp/getDraft '{"Draft_ID": "r-123456789"}'
```

---

#### 17. `deleteDraft`

**Purpose:** Delete an email draft.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Draft_ID` | string | yes | The ID of the draft to delete |

**Example:**
```bash
mcp-cli ms-gmail_mcp/deleteDraft '{"Draft_ID": "r-123456789"}'
```

---

### Labels (4 tools)

#### 18. `getLabels`

**Purpose:** Retrieve all labels (system and user-created).

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Return_All` | boolean | yes | Whether to return all labels |

**Example:**
```bash
mcp-cli ms-gmail_mcp/getLabels '{"Return_All": true}'
```

**Output includes:** Label ID, name, type (system/user), visibility settings, and color.

**Common system labels:** INBOX, SENT, DRAFT, SPAM, TRASH, STARRED, UNREAD, IMPORTANT, CATEGORY_UPDATES, CATEGORY_PROMOTIONS, CATEGORY_SOCIAL, CATEGORY_PERSONAL, CATEGORY_FORUMS.

---

#### 19. `getLabel`

**Purpose:** Retrieve details of a specific label.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Label_ID` | string | yes | The ID of the label |

**Example:**
```bash
# System label
mcp-cli ms-gmail_mcp/getLabel '{"Label_ID": "INBOX"}'

# User label (use the label ID, not the name)
mcp-cli ms-gmail_mcp/getLabel '{"Label_ID": "Label_1696647671332234240"}'
```

---

#### 20. `createLabel`

**Purpose:** Create a new label.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Label_ID` | string | yes | The name of the label to create |

**Example:**
```bash
mcp-cli ms-gmail_mcp/createLabel '{"Label_ID": "AI-Processed"}'
```

---

#### 21. `deleteLabel`

**Purpose:** Delete a label.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Label_ID` | string | yes | The ID of the label to delete |

**Example:**
```bash
mcp-cli ms-gmail_mcp/deleteLabel '{"Label_ID": "Label_1234567890"}'
```

> **Warning:** This permanently deletes the label. Messages with this label are not deleted, but the label is removed from them.

---

## Usage Patterns

### Pattern 1: Search -> Read -> Act

**The most common workflow for processing emails:**

```bash
# Step 1: Search for relevant emails
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "is:unread newer_than:1d", "Received_After": "", "Received_Before": "", "Sender": ""}'

# Step 2: Get full message details (use ID from search results)
mcp-cli ms-gmail_mcp/get '{"Message_ID": "<id-from-search>"}'

# Step 3: Act on the message (reply, label, mark as read, etc.)
mcp-cli ms-gmail_mcp/markAsRead '{"Message_ID": "<id>"}'
```

### Pattern 2: Thread-Based Conversation Management

**For managing email conversations as threads:**

```bash
# Step 1: Search for threads
mcp-cli ms-gmail_mcp/getManyThreads '{"Return_All": false, "Search": "subject:project update", "Received_After": "", "Received_Before": ""}'

# Step 2: Get full thread (all messages)
mcp-cli ms-gmail_mcp/getThread '{"Thread_ID": "<thread-id>"}'

# Step 3: Reply to the thread
mcp-cli ms-gmail_mcp/replyThread '{"Thread_ID": "<thread-id>", "Message": "Thanks, noted.", "BCC": "", "CC": ""}'
```

### Pattern 3: Label-Based Organization

**For organizing emails with labels:**

```bash
# Step 1: Get existing labels
mcp-cli ms-gmail_mcp/getLabels '{"Return_All": true}'

# Step 2: Create a new label if needed
mcp-cli ms-gmail_mcp/createLabel '{"Label_ID": "AI-Reviewed"}'

# Step 3: Apply label to messages
mcp-cli ms-gmail_mcp/addLabels '{"Message_ID": "<id>", "Label_Names_or_IDs": "AI-Reviewed"}'

# Step 4: Search by label later
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "label:AI-Reviewed", "Received_After": "", "Received_Before": "", "Sender": ""}'
```

### Pattern 4: Draft Composition

**For preparing emails without sending:**

```bash
# Step 1: Create a draft
mcp-cli ms-gmail_mcp/createDraft '{"Subject": "Follow-up", "Message": "Hi, following up on our conversation...", "Attachment_Field_Name__in_Input_": "", "BCC": "", "CC": ""}'

# Step 2: List drafts to verify
mcp-cli ms-gmail_mcp/getManyDrafts '{"Return_All": true, "Include_Spam_and_Trash": false}'

# Step 3: Get draft details
mcp-cli ms-gmail_mcp/getDraft '{"Draft_ID": "<draft-id>"}'
```

---

## Common Workflows

### Workflow 1: Daily Inbox Summary

**Scenario:** Get a summary of today's unread emails.

```bash
#!/bin/bash
# inbox-summary.sh

echo "=== Today's Unread Emails ==="
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "is:unread newer_than:1d label:INBOX", "Received_After": "", "Received_Before": "", "Sender": ""}'
```

---

### Workflow 2: Find and Read Emails from a Specific Sender

**Scenario:** Find all recent emails from a particular person and read the latest one.

```bash
#!/bin/bash
# find-sender.sh

SENDER="$1"

echo "=== Emails from $SENDER ==="
RESULTS=$(mcp-cli ms-gmail_mcp/search "{\"Return_All\": false, \"Search\": \"newer_than:7d\", \"Received_After\": \"\", \"Received_Before\": \"\", \"Sender\": \"$SENDER\"}")

# Get first message ID
MSG_ID=$(echo "$RESULTS" | jq -r '.[0].id')

if [ "$MSG_ID" != "null" ]; then
  echo -e "\n=== Latest Email ==="
  mcp-cli ms-gmail_mcp/get "{\"Message_ID\": \"$MSG_ID\"}"
else
  echo "No emails found from $SENDER"
fi
```

**Usage:**
```bash
./find-sender.sh "alice@example.com"
```

---

### Workflow 3: Bulk Label Management

**Scenario:** Find emails matching a query and apply a label to all of them.

```bash
#!/bin/bash
# bulk-label.sh

SEARCH_QUERY="$1"
LABEL="$2"

echo "=== Searching for: $SEARCH_QUERY ==="
RESULTS=$(mcp-cli ms-gmail_mcp/search "{\"Return_All\": false, \"Search\": \"$SEARCH_QUERY\", \"Received_After\": \"\", \"Received_Before\": \"\", \"Sender\": \"\"}")

# Extract message IDs and label each
echo "$RESULTS" | jq -r '.[].id' | while read -r MSG_ID; do
  echo "Labeling message: $MSG_ID"
  mcp-cli ms-gmail_mcp/addLabels "{\"Message_ID\": \"$MSG_ID\", \"Label_Names_or_IDs\": \"$LABEL\"}"
done

echo "Done."
```

**Usage:**
```bash
./bulk-label.sh "from:newsletter@example.com" "Newsletters"
```

---

### Workflow 4: Draft a Reply Based on Thread Context

**Scenario:** Read a thread and prepare a draft reply.

```bash
#!/bin/bash
# draft-reply.sh

THREAD_ID="$1"

echo "=== Thread Contents ==="
mcp-cli ms-gmail_mcp/getThread "{\"Thread_ID\": \"$THREAD_ID\"}"

echo -e "\n=== Creating Draft Reply ==="
mcp-cli ms-gmail_mcp/createDraft '{"Subject": "Re: Thread Follow-up", "Message": "Based on the discussion, here are my thoughts...", "Attachment_Field_Name__in_Input_": "", "BCC": "", "CC": ""}'
```

---

## Troubleshooting

### Issue 1: Connection Failed

**Error:**
```
Error [SERVER_CONNECTION_FAILED]: Failed to connect to server "ms-gmail_mcp"
```

**Cause:** Incorrect URL or server is down.

**Solutions:**

1. **Check the URL in config:**
```bash
cat ~/.config/mcp/mcp_servers.json | jq '.mcpServers["ms-gmail_mcp"]'
```

2. **Ensure the URL does not have a trailing `/sse`:**
```json
// Wrong
"url": "https://workflows.moneysmart.co/mcp/<id>/sse"

// Correct
"url": "https://workflows.moneysmart.co/mcp/<id>"
```

3. **Verify the n8n workflow is active.**

---

### Issue 2: Empty Search Results

**Symptom:** `search` returns an empty array.

**Cause:** Search query too restrictive or incorrect syntax.

**Solutions:**

1. **Broaden the search:**
```bash
# Too specific
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "from:specific@email.com subject:exact title newer_than:1d", "Received_After": "", "Received_Before": "", "Sender": ""}'

# Broader
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "newer_than:7d", "Received_After": "", "Received_Before": "", "Sender": ""}'
```

2. **Use `Sender` parameter instead of `from:` in Search:**
```bash
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "", "Received_After": "", "Received_Before": "", "Sender": "alice@example.com"}'
```

---

### Issue 3: Message Not Found

**Error:** Tool returns error when using a Message_ID.

**Cause:** Message ID is expired or incorrect.

**Solution:** Re-search to get fresh message IDs:
```bash
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "newer_than:1d", "Received_After": "", "Received_Before": "", "Sender": ""}'
```

---

### Issue 4: Required Parameters Error

**Symptom:** Tool call fails with parameter errors.

**Cause:** All parameters are required, even when not used.

**Solution:** Pass empty strings `""` for unused string parameters and `false` for unused boolean parameters:
```bash
# Wrong - missing parameters
mcp-cli ms-gmail_mcp/search '{"Search": "is:unread"}'

# Correct - all parameters included
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "is:unread", "Received_After": "", "Received_Before": "", "Sender": ""}'
```

---

## Best Practices

### 1. Always Pass All Required Parameters

Every tool requires all its parameters, even if not used. Pass `""` for unused strings and `false` for unused booleans.

```bash
# DO: Include all parameters
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "is:unread", "Received_After": "", "Received_Before": "", "Sender": ""}'

# DON'T: Omit optional-seeming parameters
mcp-cli ms-gmail_mcp/search '{"Search": "is:unread"}'
```

### 2. Use Gmail Search Syntax for Precision

Gmail's search syntax is powerful. Use it in the `Search` parameter:

```bash
# Combine multiple filters
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "from:boss@company.com is:unread has:attachment newer_than:7d", "Received_After": "", "Received_Before": "", "Sender": ""}'
```

### 3. Prefer Thread Operations for Conversations

When working with email conversations, use thread-level tools to get full context:

```bash
# DO: Get the full thread
mcp-cli ms-gmail_mcp/getThread '{"Thread_ID": "<thread-id>"}'

# DON'T: Get individual messages one by one
```

### 4. Use `Return_All: false` for Large Mailboxes

Avoid `Return_All: true` with broad searches to prevent timeouts and large responses:

```bash
# DO: Limit results
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "newer_than:1d", "Received_After": "", "Received_Before": "", "Sender": ""}'

# DON'T: Return all with broad queries
mcp-cli ms-gmail_mcp/search '{"Return_All": true, "Search": "", "Received_After": "", "Received_Before": "", "Sender": ""}'
```

### 5. Use Label IDs for User Labels

System labels use readable IDs (INBOX, SENT, etc.), but user-created labels use numeric IDs. Fetch labels first:

```bash
# Step 1: Get label IDs
mcp-cli ms-gmail_mcp/getLabels '{"Return_All": true}'

# Step 2: Use the label ID (not name) for operations
mcp-cli ms-gmail_mcp/addLabels '{"Message_ID": "<id>", "Label_Names_or_IDs": "Label_1696647671332234240"}'
```

### 6. Be Cautious with Delete Operations

`delete` permanently removes messages. Prefer labeling or archiving:

```bash
# Prefer: Remove from inbox (archive)
mcp-cli ms-gmail_mcp/removeLabels '{"Message_ID": "<id>", "Label_Names_or_IDs": "INBOX"}'

# Use with caution: Permanent delete
mcp-cli ms-gmail_mcp/delete '{"Message_ID": "<id>"}'
```

### 7. Convert Internal Dates

Message timestamps (`internalDate`) are Unix milliseconds. Convert for readability:

```bash
# Convert internalDate to readable format (macOS)
TZ='Asia/Singapore' date -r $((1769676838)) '+%A, %d %B %Y at %I:%M:%S %p %Z'
```

---

## Examples Library

### Example 1: Check Unread Count by Category

```bash
#!/bin/bash
# unread-by-category.sh

CATEGORIES=("INBOX" "CATEGORY_UPDATES" "CATEGORY_PROMOTIONS" "CATEGORY_SOCIAL")

for CATEGORY in "${CATEGORIES[@]}"; do
  RESULTS=$(mcp-cli ms-gmail_mcp/search "{\"Return_All\": false, \"Search\": \"is:unread label:$CATEGORY\", \"Received_After\": \"\", \"Received_Before\": \"\", \"Sender\": \"\"}")
  COUNT=$(echo "$RESULTS" | jq 'length')
  echo "$CATEGORY: $COUNT unread"
done
```

---

### Example 2: Export Recent Emails as JSON

```bash
#!/bin/bash
# export-emails.sh

QUERY="${1:-newer_than:1d}"
OUTPUT="${2:-emails-export.json}"

echo "Exporting emails matching: $QUERY"
mcp-cli ms-gmail_mcp/search "{\"Return_All\": false, \"Search\": \"$QUERY\", \"Received_After\": \"\", \"Received_Before\": \"\", \"Sender\": \"\"}" > "$OUTPUT"
echo "Exported to: $OUTPUT"
```

**Usage:**
```bash
./export-emails.sh "from:boss@company.com newer_than:30d" boss-emails.json
```

---

### Example 3: Mark All Emails from a Sender as Read

```bash
#!/bin/bash
# mark-read-from.sh

SENDER="$1"

RESULTS=$(mcp-cli ms-gmail_mcp/search "{\"Return_All\": false, \"Search\": \"is:unread\", \"Received_After\": \"\", \"Received_Before\": \"\", \"Sender\": \"$SENDER\"}")

echo "$RESULTS" | jq -r '.[].id' | while read -r MSG_ID; do
  echo "Marking as read: $MSG_ID"
  mcp-cli ms-gmail_mcp/markAsRead "{\"Message_ID\": \"$MSG_ID\"}"
done

echo "Done."
```

**Usage:**
```bash
./mark-read-from.sh "newsletter@example.com"
```

---

## Quick Reference

### Essential Commands

```bash
# List all tools
mcp-cli ms-gmail_mcp

# List with descriptions
mcp-cli ms-gmail_mcp -d

# Search messages
mcp-cli ms-gmail_mcp/search '{"Return_All": false, "Search": "is:unread", "Received_After": "", "Received_Before": "", "Sender": ""}'

# Get message
mcp-cli ms-gmail_mcp/get '{"Message_ID": "<id>"}'

# Reply to message
mcp-cli ms-gmail_mcp/reply '{"Message_ID": "<id>", "Message": "Reply text", "Attachment_Field_Name": "", "BCC": "", "CC": ""}'

# Get thread
mcp-cli ms-gmail_mcp/getThread '{"Thread_ID": "<id>"}'

# Reply to thread
mcp-cli ms-gmail_mcp/replyThread '{"Thread_ID": "<id>", "Message": "Reply text", "BCC": "", "CC": ""}'

# Get labels
mcp-cli ms-gmail_mcp/getLabels '{"Return_All": true}'

# Add label to message
mcp-cli ms-gmail_mcp/addLabels '{"Message_ID": "<id>", "Label_Names_or_IDs": "IMPORTANT"}'

# Mark as read/unread
mcp-cli ms-gmail_mcp/markAsRead '{"Message_ID": "<id>"}'
mcp-cli ms-gmail_mcp/markAsUnread '{"Message_ID": "<id>"}'

# Create draft
mcp-cli ms-gmail_mcp/createDraft '{"Subject": "Subject", "Message": "Body", "Attachment_Field_Name__in_Input_": "", "BCC": "", "CC": ""}'

# Get drafts
mcp-cli ms-gmail_mcp/getManyDrafts '{"Return_All": true, "Include_Spam_and_Trash": false}'
```

---

## Key Takeaways for AI Agents

1. **All parameters are required** - pass `""` for unused string params and `false` for unused booleans
2. **Use Gmail search syntax** in the `Search` parameter for powerful filtering
3. **Thread IDs and Message IDs** are different - use the right one for the right tool
4. **`internalDate` is Unix milliseconds** - divide by 1000 for standard Unix timestamp
5. **Prefer `Return_All: false`** to avoid large responses and timeouts
6. **Use thread operations** for conversation context instead of individual message reads
7. **Label IDs vs names** - system labels use readable names, user labels use numeric IDs
8. **Delete is permanent** - prefer removing the INBOX label to archive instead
9. **Empty strings are valid** - required parameters accept `""` when not applicable
10. **URL format matters** - do not append `/sse` to the workflow URL

---

## Additional Resources

- **Gmail Search Operators**: https://support.google.com/mail/answer/7190
- **MCP Specification**: https://modelcontextprotocol.io/
- **mcp-cli Guide**: See [MCP-CLI-GUIDE.md](MCP-CLI-GUIDE.md) in this repository

---

**Document Version:** 1.0
**Last Updated:** January 29, 2026
**Author:** AI Agent Training Documentation
