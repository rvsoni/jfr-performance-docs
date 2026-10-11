---
id: installation
title: Installation & Build
sidebar_label: Installation & Build
description: How to compile, test, and run the jfr-performance-mcp standalone fat JAR.
keywords:
  - MCP installation
  - build JAR
  - standalone CLI
  - jfr-performance-mcp
---

# Installation & Build

`jfr-performance-mcp` is distributed as a self-contained, standalone executable JAR (shaded with all dependencies).

---

## Prerequisites

- **Java Development Kit:** Version **21** or newer (`java -version`).
- **Apache Maven:** Version **3.8+** or **3.9+** (`mvn -version`).
- **Git:** Version **2.30+**.

---

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR-GITHUB-USERNAME/jfr-performance-mcp.git
cd jfr-performance-mcp
```

---

## 2. Build the Standalone JAR

The repository includes a dedicated build script that runs static checks, unit tests, and packages the shaded JAR:

```bash
./scripts/build.sh
```

Alternatively, you can build directly using standard Maven:

```bash
mvn clean package -DskipTests=false
```

### Build Artifact
Upon successful compilation and verification of all 40 automated unit and integration tests, Maven produces the shaded executable JAR at:

```text
target/jfr-performance-mcp-1.0.0.jar
```

This JAR packages:
- The MCP Java SDK core runtime
- Logback diagnostic logging configured for `STDERR`
- Jackson JSON serialization libraries
- The complete `com.ravi.jfrmcp` analysis engine and MCP server adapter

---

## 3. Running Automated Tests

To execute the test suite independently:

```bash
./scripts/test.sh
```

Or using Maven:

```bash
mvn test
```

The test suite validates:
- Low-level streaming event parsing with synthetic `.jfr` recordings
- LRU caching behavior and cache invalidation on file modification
- Directory boundary enforcement and path traversal defenses
- JSON-RPC serialization and error formatting

---

## 4. Standalone CLI Diagnostic Mode

Before wiring the server to an AI assistant, you can run immediate diagnostics directly from your shell without starting an MCP client:

```bash
./scripts/run.sh --analyze recordings/demo-production.jfr
```

Or via direct Java execution:

```bash
java -jar target/jfr-performance-mcp-1.0.0.jar --analyze recordings/demo-production.jfr
```

### Example CLI Output
```text
============================================================
JFR Performance Diagnostic Report: demo-production.jfr
============================================================
File Size: 144.8 KB | Duration: 1.33s | Events: 4,210
JVM: OpenJDK 64-Bit Server VM (21.0.2+13-LTS) | 16 Cores

[CPU HOTSPOTS]
1. com.shopsphere.demo.scenario.cpu.CpuHotspotScenario.calculateComplexDiscountMatrix()
   Samples: 1,780 (96.22% of captured samples)
   Avg JVM User CPU: 88.0%

[LOCK CONTENTION]
1. Monitor: java.lang.Object (InventoryService.globalMonitor)
   Events: 48 | Total Blocked: 2,740.5ms | Max Blocked: 150.2ms

[GARBAGE COLLECTION]
Assessments: LOW (Max pause: 9.2ms, Young GCs: 2, Old GCs: 0)

[ASSESSMENT]
Overall: HIGH | 1 Critical Bottleneck Identified
============================================================
```

This confirms that the JAR is functional and ready for AI client integration.
