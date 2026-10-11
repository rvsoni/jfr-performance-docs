---
id: reference
title: Authoritative Reference & Resources
sidebar_label: Reference
description: Authoritative documentation links for JFR, JDK Mission Control, Model Context Protocol, and Antigravity.
keywords:
  - JFR reference
  - JDK Mission Control docs
  - Model Context Protocol specification
  - Adoptium
---

# Authoritative Reference & Resources

A curated collection of official, authoritative documentation, specifications, and tools referenced throughout JFR Performance Lab.

---

## 1. Java Flight Recorder (JFR) & JDK Mission Control (JMC)

- [Oracle Java Flight Recorder Runtime Guide](https://docs.oracle.com/en/java/javase/21/troubleshoot/troubleshoot-process-and-performance.html) — Comprehensive OpenJDK and Oracle troubleshooting reference for continuous recording, event settings, and CPU profiling.
- [Adoptium Eclipse Temurin JDK Mission Control](https://adoptium.net/jmc/) — Open-source binaries and installer packages for JDK Mission Control (JMC) 8.x and 9.x.
- [OpenJDK JMC GitHub Repository](https://github.com/openjdk/jmc) — Source code, automated rule definitions, and issue tracker for JDK Mission Control.
- [JDK 21 `jdk.jfr.consumer` Javadoc](https://docs.oracle.com/en/java/javase/21/docs/api/jdk.jfr/jdk/jfr/consumer/package-summary.html) — Official API documentation for `RecordingFile`, `RecordedEvent`, `RecordedThread`, and `EventStream`.

---

## 2. Model Context Protocol (MCP)

- [Official Model Context Protocol Specification](https://modelcontextprotocol.io/) — Open standard specification governing tools, prompts, resources, and STDIO/SSE transports.
- [Model Context Protocol Java SDK](https://github.com/modelcontextprotocol/java-sdk) — The official Java implementation of the MCP client and server protocol used by `jfr-performance-mcp`.
- [MCP Architecture & Transport Overview](https://modelcontextprotocol.io/docs/concepts/transports) — Details on JSON-RPC 2.0 framing, STDIO protocol isolation, and error code structures.

---

## 3. Java Runtime & Performance

- [Oracle HotSpot Virtual Machine Garbage Collection Tuning Guide](https://docs.oracle.com/en/java/javase/21/gctuning/) — Detailed reference for G1, ZGC, and Parallel GC algorithms, pause time goals, and heap ergonomics.
- [Java Virtual Machine Specification (Java SE 21 Edition)](https://docs.oracle.com/javase/specs/jvms/se21/html/) — Formal specifications for bytecode execution, monitor synchronization semantics (`monitorenter`, `monitorexit`), and memory layout.
- [Apache Maven Official Documentation](https://maven.apache.org/guides/) — Reference for Maven build lifecycles, plugins, and dependencies.

---

## 4. AI Assistants & MCP Client Integrations

- [Google Antigravity Documentation](https://cloud.google.com/) — Guide to configuring MCP servers, agents, and tool palettes inside Antigravity IDE.
- [Anthropic Claude Desktop MCP Documentation](https://docs.anthropic.com/en/docs/agents-and-tools/mcp) — Instructions for configuring third-party STDIO servers in Claude Desktop.
- [Cursor MCP Setup Guide](https://docs.cursor.com/) — Connecting local process-based MCP servers into the Cursor AI editor.

---

## 5. Companion Projects

- [jfr-performance-mcp Repository](https://github.com/rvsoni/jfr-performance-mcp) — The Java MCP server providing 11 diagnostic tools for JFR recordings.
- [jfr-performance-demo-app Repository](https://github.com/rvsoni/jfr-performance-demo-app) — The ShopSphere Spring Boot application generating reproducible JVM performance anti-patterns.
- [jfr-performance-docs Repository](https://github.com/rvsoni/jfr-performance-docs) — The source repository for this Docusaurus documentation website.
