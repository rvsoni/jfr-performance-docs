---
id: prerequisites
title: System Prerequisites
sidebar_label: Prerequisites
description: Prerequisites for running JFR Performance Lab Java tools vs contributing to the documentation website.
keywords:
  - Java 21
  - OpenJDK
  - JDK Mission Control
  - Apache Maven
  - Antigravity
  - Node.js
---

# System Prerequisites

Before starting, determine whether you are **investigating JVM performance with the Java tools** or **developing and contributing to this documentation website**.

The dependencies differ significantly between runtime investigation and documentation development.

---

## 1. Prerequisites for Using the Java Performance Tools

These tools run the sample workloads, capture flight recordings, and execute the MCP analysis engine.

| Tool | Required Version | Purpose | Verification Command |
| :--- | :--- | :--- | :--- |
| **Java Development Kit (JDK)** | **Java 21 LTS** or newer (OpenJDK, Temurin, Corretto, Oracle) | Compiles and executes `jfr-performance-demo-app` and `jfr-performance-mcp`. JFR streaming APIs require Java 21+. | `java -version` |
| **Apache Maven** | **3.8.x** or **3.9.x+** | Builds the multi-module demo application and shades the standalone MCP fat JAR. | `mvn -version` |
| **JDK Mission Control (JMC)** | **8.x** or **9.x** | Authoritative desktop GUI for visual confirmation of flame graphs, call trees, and lock timelines. | Launch `jmc` from terminal or GUI |
| **Git** | **2.30+** | Source code management and cloning repositories. | `git --version` |
| **MCP Client** | Google Antigravity, Claude Desktop, Cursor, or VS Code | Hosts the AI agent that communicates with `jfr-performance-mcp` over standard I/O (JSON-RPC). | Check client version |

### Verifying Java 21+ Installation

Run the following in your terminal:

```bash
java -version
```

Expected output format:
```text
openjdk version "21.0.2" 2024-01-16 LTS
OpenJDK Runtime Environment Temurin-21.0.2+13 (build 21.0.2+13-LTS)
OpenJDK 64-Bit Server VM Temurin-21.0.2+13 (build 21.0.2+13-LTS, mixed mode, sharing)
```

:::warning Java 17 and Older Are Incompatible
Both `jfr-performance-mcp` and `jfr-performance-demo-app` leverage Java 21 language features (records, enhanced pattern matching, Virtual Thread APIs) and modern `jdk.jfr.consumer` streaming facilities. Java 17 and earlier will fail to compile.
:::

### Installing JDK Mission Control (JMC)

JDK Mission Control is free, open-source software provided by the OpenJDK project and Adoptium:

- **Linux**: Available via package managers (e.g., `sudo apt install openjdk-21-jmc` or `sudo dnf install jmc`) or tarball download from [Adoptium JMC Releases](https://adoptium.net/jmc/).
- **macOS**: `brew install --cask jmc` or direct DMG from Adoptium.
- **Windows**: Download ZIP or MSI installer from Adoptium.

---

## 2. Prerequisites for Contributing to the Website Only

If you are authoring documentation, refining playbooks, or submitting website improvements, you do **not** need Java 21 or JMC installed locally.

| Tool | Required Version | Purpose | Verification Command |
| :--- | :--- | :--- | :--- |
| **Node.js** | **20.0.0+** (LTS recommended, e.g., 20.x or 22.x) | JavaScript runtime for Docusaurus static site generator. | `node -v` |
| **npm** | **10.0.0+** | Node package manager for installing Docusaurus plugins and dependencies. | `npm -v` |
| **Git** | **2.30+** | Clones the docs repository and manages pull requests. | `git --version` |

### Verifying Node.js Environment

```bash
node -v
npm -v
```

Expected output:
```text
v22.23.1
10.2.5
```

---

## Summary Matrix

| Requirement | Java Performance Investigation | Website Documentation Development |
| :--- | :---: | :---: |
| Java 21+ JDK | **Required** | Not required |
| Apache Maven 3.8+ | **Required** | Not required |
| JDK Mission Control | **Required** | Not required |
| MCP Client (Antigravity) | **Required** | Not required |
| Node.js 20+ & npm | Not required | **Required** |
| Git | **Required** | **Required** |
