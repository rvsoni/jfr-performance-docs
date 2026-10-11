---
id: troubleshooting
title: Troubleshooting & Error Handling
sidebar_label: Troubleshooting
description: Diagnosing common errors, standard error payloads, and connection issues in jfr-performance-mcp.
keywords:
  - MCP troubleshooting
  - RECORDING_NOT_FOUND
  - RECORDING_ACCESS_DENIED
  - JSON-RPC errors
---

# Troubleshooting & Error Handling

This guide covers common connection issues, error codes, and operational fixes for `jfr-performance-mcp`.

---

## Standard Error Payload Format

When an MCP tool invocation encounters an invalid argument or environment issue, `jfr-performance-mcp` returns a structured error object conforming to the MCP specification:

```json
{
  "isError": true,
  "errorCode": "RECORDING_NOT_FOUND",
  "message": "Recording 'cpu-run.jfr' was not found in directory '/path/to/recordings'."
}
```

---

## Error Code Catalog

### `RECORDING_NOT_FOUND`
- **Cause:** The requested `.jfr` file does not exist in the configured directory.
- **Remedy:**
  1. Verify the filename passed to the tool.
  2. Invoke `list_recordings` to verify which files are present.
  3. Verify that `JFR_RECORDINGS_DIR` points to the directory containing your recordings.

### `RECORDING_ACCESS_DENIED`
- **Cause:** The path contains relative traversal sequences (`../`) or attempts to follow a symlink outside the allowed directory tree.
- **Remedy:** Pass only the relative filename within `JFR_RECORDINGS_DIR` (e.g., `cpu-hotspot-faulty.jfr`, not `../../recordings/cpu-hotspot-faulty.jfr`).

### `INVALID_RECORDING`
- **Cause:** The file is empty, partially written, or not a valid Java Flight Recorder binary format.
- **Remedy:**
  1. Ensure the JVM process that generated the recording has fully flushed and stopped the recording.
  2. Test opening the file in JDK Mission Control (`jmc <filename>`) to verify file integrity.

### `INVALID_ARGUMENT`
- **Cause:** A required parameter is missing or out of bounds (e.g. `topN: -5` or missing `recording`).
- **Remedy:** Review the parameter definitions in the [MCP Tools Reference](tools-reference.md).

### `INTERNAL_ERROR`
- **Cause:** An unhandled runtime exception occurred within the parser engine.
- **Remedy:** Check the client's STDERR console log. Detailed stack traces are emitted to `STDERR` without polluting the JSON-RPC stream.

---

## Operational Troubleshooting

### MCP Client Hangs or Times Out on Startup
- **Verify Java 21+ on `PATH`:** Run `java -version` in your terminal. If your IDE launches with a system default Java 17 or 11, specify the full path to the Java 21 binary in your client config:
  ```json
  "command": "/usr/lib/jvm/temurin-21-jdk/bin/java"
  ```
- **Verify JAR Exists:** Ensure the path to `jfr-performance-mcp-1.0.0.jar` is an absolute path.

### JSON-RPC Parser Error in Client Console
- **Symptom:** Client reports *"SyntaxError: Unexpected token in JSON at position 0"*.
- **Root Cause:** A log message or JVM warning was written to `STDOUT`.
- **Remedy:**
  1. Verify that `logback.xml` routes console output strictly to `System.err`.
  2. Avoid passing JVM flags like `-verbose:class` or `-XX:+PrintCommandLineFlags` that print directly to `STDOUT`.

### High Memory Usage or OutOfMemoryError on Large Recordings
- **Symptom:** The server process terminates with `java.lang.OutOfMemoryError: Java heap space` when reading recordings > 500 MB.
- **Remedy:** Increase the max heap limit in the client configuration args:
  ```json
  "args": ["-Xms1g", "-Xmx4g", "-jar", "/path/to/jfr-performance-mcp-1.0.0.jar"]
  ```
