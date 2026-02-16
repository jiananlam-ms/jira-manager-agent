---
name: setup-mcp-cli
type: tool
description: Detects, installs, and configures mcp-cli binary and its config directory. Use when a user wants to set up mcp-cli; when mcp-cli is not found on the system; or when the MCP config directory needs bootstrapping.
---

# Setup MCP CLI

This skill guides Claude in detecting, installing, and configuring the mcp-cli binary and its configuration directory.

It focuses on **getting mcp-cli ready to use**, not on adding specific MCP servers (that's the `install-mcp-server` skill's job).

---

## Purpose

Use this skill to:

- Detect whether mcp-cli is installed and accessible
- Install mcp-cli via the official install script if missing
- Configure PATH so mcp-cli is accessible without full path
- Bootstrap the config directory with an empty server configuration
- Verify the installation is working

This skill is intended to feed into:

- `install-mcp-server` skill — which requires mcp-cli to be installed
- `create-skill-spec` skill (Phase 2.6) — invokes this skill inline when mcp-cli is not installed
- Any workflow that calls MCP tools via `mcp-cli` commands

---

## Applicability

### When to use this skill

Trigger this skill when:

- User explicitly asks to set up or install mcp-cli
- Another skill requires mcp-cli and it is not detected (e.g., `create-skill-spec` Phase 2.6 invokes this inline)
- User wants to configure MCP infrastructure from scratch

Common trigger phrases: "Set up mcp-cli", "Install mcp-cli", "Configure MCP".

### When not to use this skill

Avoid using this skill when:

- mcp-cli is already installed, in PATH, and config directory exists
- User wants to add a specific MCP server (use `install-mcp-server` instead)
- User wants to call MCP tools directly (mcp-cli must already be set up)

In those cases, use `install-mcp-server` for server setup or call `mcp-cli` commands directly.

---

## Dependencies

This skill relies on:

- `patterns/mcp-patterns/mcp-server-catalog.md` — for config directory conventions
- `patterns/mcp-patterns/mcp-cli-guide.md` — reference for installation and PATH setup commands
- Bash tool — for running shell commands
- Internet connection — for downloading the mcp-cli binary

---

## Inputs

### From the Input Envelope

- **From `goal`:** The user's request to set up or install mcp-cli
- **From `context`:** Any existing MCP setup or shell environment details

### From the File System

Use Bash tool to detect:

- `~/.local/bin/mcp-cli` — binary location
- `$SHELL` — current shell type
- `~/.config/mcp/mcp_servers.json` — existing config

### Missing Input Handling

No user input is required. All values are auto-detected:

- **Shell type:** Read from `$SHELL` environment variable
- **Install path:** Always `~/.local/bin/mcp-cli`
- **Config path:** Always `~/.config/mcp/`

---

## Outputs

### Output Type

System configuration (binary, PATH, config directory)

### Primary Output

- Installed `mcp-cli` binary at `~/.local/bin/mcp-cli`
- PATH configured in shell profile
- Config directory at `~/.config/mcp/` with `mcp_servers.json`

### Verification

- `mcp-cli --version` returns a version string

### Downstream Usage

- `install-mcp-server` skill consumes the configured environment
- `create-skill-spec` skill (Phase 2.6) resumes MCP discovery after this skill completes
- MCP tool calls via `mcp-cli <server>/<tool>` become available

---

## Procedure

Claude should follow this procedure when using this skill.

### Phase 1: Detection (1.1-1.4)

#### 1.1 Check binary existence

Run via Bash:

```bash
test -f "$HOME/.local/bin/mcp-cli" && echo "BINARY_EXISTS" || echo "BINARY_MISSING"
```

Record result.

#### 1.2 Check PATH

Run via Bash:

```bash
which mcp-cli 2>/dev/null && echo "IN_PATH" || echo "NOT_IN_PATH"
```

Record result.

#### 1.3 Check config directory

Run via Bash:

```bash
test -d "$HOME/.config/mcp" && echo "CONFIG_DIR_EXISTS" || echo "CONFIG_DIR_MISSING"
```

Record result.

#### 1.4 Check config file

Run via Bash:

```bash
test -f "$HOME/.config/mcp/mcp_servers.json" && echo "CONFIG_FILE_EXISTS" || echo "CONFIG_FILE_MISSING"
```

Record result.

**Output of Phase 1:** Detection status for binary, PATH, config directory, and config file. If all four exist, report "mcp-cli is already fully configured" and complete this skill (return to caller if invoked inline).

### Phase 2: Installation (2.1-2.2)

Skip this phase if binary already exists (Phase 1.1 = BINARY_EXISTS).

#### 2.1 Install mcp-cli

Run via Bash:

```bash
curl -fsSL https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh | bash
```

#### 2.2 Verify binary created

Run via Bash:

```bash
test -f "$HOME/.local/bin/mcp-cli" && echo "INSTALL_SUCCESS" || echo "INSTALL_FAILED"
```

If INSTALL_FAILED, report the error and complete this skill with failure status. The user may need to check their internet connection or permissions. When invoked inline from another skill, the caller should handle the failure gracefully.

**Output of Phase 2:** Binary installed at `~/.local/bin/mcp-cli`.

### Phase 3: PATH Configuration (3.1-3.4)

Skip this phase if mcp-cli is already in PATH (Phase 1.2 = IN_PATH).

#### 3.1 Detect shell type

Run via Bash:

```bash
echo "$SHELL"
```

Map result:
- Contains `zsh` → profile file is `~/.zshrc`
- Contains `bash` → profile file is `~/.bashrc`
- Other → use `~/.profile` as fallback

#### 3.2 Check if PATH entry already exists in profile

Run via Bash (using the detected profile file):

```bash
grep -q '\.local/bin' ~/.zshrc 2>/dev/null && echo "PATH_ENTRY_EXISTS" || echo "PATH_ENTRY_MISSING"
```

Skip step 3.3 if PATH_ENTRY_EXISTS.

#### 3.3 Append PATH entry

Run via Bash (using the detected profile file):

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
```

#### 3.4 Export PATH for current session

Run via Bash:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

**Output of Phase 3:** `~/.local/bin` added to PATH in shell profile and current session.

### Phase 4: Config Bootstrap (4.1-4.2)

#### 4.1 Create config directory

Skip if directory already exists (Phase 1.3 = CONFIG_DIR_EXISTS).

Run via Bash:

```bash
mkdir -p "$HOME/.config/mcp"
```

#### 4.2 Create empty config file

Skip if config file already exists (Phase 1.4 = CONFIG_FILE_EXISTS).

Use Write tool to create `~/.config/mcp/mcp_servers.json` with content:

```json
{
  "mcpServers": {}
}
```

**Output of Phase 4:** Config directory and empty config file created.

### Phase 5: Verification (5.1-5.2)

#### 5.1 Run version check

Run via Bash:

```bash
"$HOME/.local/bin/mcp-cli" --version
```

#### 5.2 Report status

Present a summary to the user:

```
mcp-cli Setup Complete:
- Binary: ~/.local/bin/mcp-cli [installed/already present]
- PATH: [configured/already configured]
- Config: ~/.config/mcp/mcp_servers.json [created/already present]
- Version: [version string]

Next step: Use install-mcp-server to add MCP servers.
```

**Output of Phase 5:** Verified working mcp-cli installation.

---

## Failure Modes and Corrections

1. **Install script fails (Execution)**
   - Symptom: `curl` command returns non-zero exit code
   - Fix: Check internet connectivity, verify the install URL is reachable, try downloading manually

2. **PATH not taking effect (Execution)**
   - Symptom: `which mcp-cli` still fails after PATH configuration
   - Fix: The current shell session may need restarting. Use full path `~/.local/bin/mcp-cli` as fallback.

3. **Wrong shell profile detected (Execution)**
   - Symptom: PATH entry added to wrong file (e.g., `.bashrc` when user runs zsh)
   - Fix: Always read `$SHELL` to detect the active shell, not assume based on OS

4. **Config directory permissions (Execution)**
   - Symptom: Cannot create `~/.config/mcp/` directory
   - Fix: Check permissions on `~/.config/`, report to user if permission issue

---

## Safety and Constraints

When using this skill:

- **Do NOT** overwrite an existing `mcp_servers.json` — only create if missing
- **Do NOT** modify PATH if `~/.local/bin` is already in the shell profile
- **Do NOT** install mcp-cli if binary already exists at `~/.local/bin/mcp-cli`
- **ALWAYS** detect shell type before modifying profile files
- **ALWAYS** verify installation succeeded before reporting success
- **ALWAYS** export PATH for the current session after modifying the profile
- **PREFER** non-destructive operations — check before acting at every step
