---
id: client-setup
title: Client & IDE Setup
sidebar_label: Client Setup (Antigravity & IDEs)
description: Configure jfr-performance-mcp in Google Antigravity, Claude Desktop, Cursor, and VS Code.
keywords:
  - Antigravity IDE
  - Claude Desktop MCP
  - Cursor MCP
  - VS Code MCP
  - MCP setup
---

# Client & IDE Setup

`jfr-performance-mcp` connects to any client supporting the standard Model Context Protocol (MCP) specification over standard input/output (`STDIO`).

---

## 1. Google Antigravity Setup

Google Antigravity supports native MCP server configurations at either the global user level or project workspace level.

### Configuration Location
- **Global User Config:** `~/.gemini/antigravity-ide/mcp_config.json`
- **Workspace Config:** `<WORKSPACE_ROOT>/.agents/mcp_config.json`

### Configuration JSON
Add `jfr-performance` to the `mcpServers` object:

```json
{
  "mcpServers": {
    "jfr-performance": {
      "command": "java",
      "args": [
        "-Xmx2g",
        "-jar",
        "/ABSOLUTE/PATH/TO/jfr-performance-mcp/target/jfr-performance-mcp-1.0.0.jar"
      ],
      "env": {
        "JFR_RECORDINGS_DIR": "/ABSOLUTE/PATH/TO/jfr-performance-demo-app/recordings"
      }
    }
  }
}
```

:::tip Use Absolute Paths
Always use fully resolved absolute paths (e.g. `/home/user/...` or `C:/Users/...`) rather than relative paths (`./`) or tilde (`~`) notation.
:::

---

## 2. Claude Desktop Setup

Open your Claude Desktop configuration file:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "jfr-performance": {
      "command": "java",
      "args": [
        "-jar",
        "/ABSOLUTE/PATH/TO/jfr-performance-mcp/target/jfr-performance-mcp-1.0.0.jar"
      ],
      "env": {
        "JFR_RECORDINGS_DIR": "/ABSOLUTE/PATH/TO/recordings"
      }
    }
  }
}
```

Restart Claude Desktop to load the tools.

---

## 3. Cursor Setup

In Cursor Settings &rarr; **Features** &rarr; **MCP Servers** &rarr; **Add New MCP Server**:

- **Name:** `jfr-performance`
- **Type:** `command`
- **Command:** `java -jar /ABSOLUTE/PATH/TO/jfr-performance-mcp/target/jfr-performance-mcp-1.0.0.jar`
- **Environment Variables:**
  - Key: `JFR_RECORDINGS_DIR`
  - Value: `/ABSOLUTE/PATH/TO/recordings`

---

## 4. VS Code (Cline / Roo Code / MCP Extension)

In `~/.vscode/settings.json` or your extension MCP configuration:

```json
{
  "mcp.servers": {
    "jfr-performance": {
      "command": "java",
      "args": [
        "-jar",
        "/ABSOLUTE/PATH/TO/jfr-performance-mcp/target/jfr-performance-mcp-1.0.0.jar"
      ],
      "env": {
        "JFR_RECORDINGS_DIR": "/ABSOLUTE/PATH/TO/recordings"
      }
    }
  }
}
```

---

## Verifying Tool Discovery

Once configured and restarted, your MCP client should automatically discover the 11 registered tools:

```text
✓ list_recordings       - Discovers available .jfr recordings
✓ recording_summary     - Returns metadata, timeframe, JVM configuration
✓ analyze_cpu           - Evaluates execution samples and CPU load
✓ analyze_gc            - Evaluates GC pause times and heap occupancy
✓ analyze_allocation    - Evaluates memory allocation rates and top classes
✓ analyze_threads       - Summarizes thread states and per-thread CPU
✓ analyze_locks         - Detects monitor contention bottlenecks
✓ analyze_exceptions    - Identifies exception storms and thrown classes
✓ analyze_io            - Measures file and socket I/O latency
✓ analyze_latency       - Flags outlier latency events exceeding threshold
✓ analyze_recording     - Multi-dimensional triage correlating all evidence
```

---

## Testing in Prompt Chat

Submit a simple discovery prompt to verify the connection:

> **Developer Prompt:**  
> *"List the JFR recordings available in the current recordings directory."*

The AI assistant will invoke `list_recordings()` and return the directory contents.
