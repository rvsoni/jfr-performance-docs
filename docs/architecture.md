---
id: architecture
title: System Architecture & Data Flow
sidebar_label: Architecture
description: Architecture diagrams and end-to-end data flows connecting JFR, JMC, MCP, and AI assistants.
keywords:
  - JFR Performance Lab architecture
  - Mermaid diagrams
  - JVM data flow
  - decoupled MCP design
---

# System Architecture & Data Flow

JFR Performance Lab unites three distinct technical ecosystems:
1. **JVM Runtime Diagnostics** (Java Flight Recorder in OpenJDK)
2. **Visual Desktop Inspection** (JDK Mission Control)
3. **AI Reasoning & Automation** (Model Context Protocol & AI IDEs)

---

## 1. End-to-End System Architecture

This diagram shows how telemetry flows from the running application through the binary flight recorder, across the three-layer MCP engine, and into the AI assistant:

```mermaid
flowchart TD
    subgraph S1["Workload Generation Layer"]
        APP["ShopSphere Demo App (Spring Boot)"]
        SCENARIO["Scenario Engine (Bounded Duration & Threads)"]
        HOTSPOT["Performance Anti-Pattern (e.g. CPU Loop, Coarse Lock)"]
        APP --> SCENARIO --> HOTSPOT
    end

    subgraph S2["JVM Telemetry Capture"]
        HOTSPOT -->|"In-JVM Telemetry (sub-1% Overhead)"| JFR_ENGINE["Java Flight Recorder (HotSpot Engine)"]
        JFR_ENGINE -->|"Stream to Disk"| FILE[(".jfr Recording File")]
    end

    subgraph S3["Human Verification"]
        FILE -->|"Direct Inspection"| JMC["JDK Mission Control (JMC GUI)"]
        JMC -->|"Flame Graphs & Lock Tables"| DEV_VIS["Developer Verification"]
    end

    subgraph S4["AI Analysis Layer (jfr-performance-mcp)"]
        FILE -->|"Sequential Event Stream"| READER["JfrRecordingReader (Streaming)"]
        READER --> PARSER["JFR Analysis Engine (com.ravi.jfrmcp.jfr)"]
        PARSER <--> CACHE["LRU Result Cache"]
        PARSER --> MODEL["Domain Fact Model (Evidence & Findings)"]
        MODEL --> ADAPTER["MCP Adapter (11 Tools, STDIO Provider)"]
    end

    subgraph S5["AI Assistant / IDE"]
        ADAPTER <-->|"JSON-RPC Protocol (Pure STDOUT)"| AI_CLIENT["Google Antigravity / MCP Client"]
        AI_CLIENT -->|"Reasoning with Calibrated Confidence"| LLM["LLM Agent"]
        LLM -->|"Root Cause & Line Numbers"| DEV_VIS
    end
```

---

## 2. Developer Investigation Workflow: From Symptom to Validated Fix

This diagram illustrates the complete diagnostic loop executed by a developer when troubleshooting a production degradation:

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant App as Demo Application (ShopSphere)
    participant JFR as Flight Recorder (.jfr)
    participant MCP as jfr-performance-mcp Server
    participant AI as Antigravity AI Assistant
    participant JMC as JDK Mission Control GUI

    Note over Dev,App: Phase 1: Symptom Reproduction
    Dev->>App: Trigger controlled workload (e.g. ./scripts/run-demo.sh cpu-hotspot 15 8)
    App->>JFR: Capture baseline recording (cpu-hotspot-faulty.jfr)

    Note over Dev,AI: Phase 2: AI-Assisted Triage
    Dev->>AI: "Investigate cpu-hotspot-faulty.jfr and cite measured facts"
    AI->>MCP: Call recording_summary()
    MCP-->>AI: Return JVM version, core count, timeframe
    AI->>MCP: Call analyze_cpu(topN=5)
    MCP->>JFR: Stream jdk.ExecutionSample events
    MCP-->>AI: Return top methods (95.8% in calculateComplexDiscountMatrix)
    AI-->>Dev: Report root cause, line numbers, and closed-form fix

    Note over Dev,JMC: Phase 3: Human Verification
    Dev->>JMC: Open cpu-hotspot-faulty.jfr
    JMC-->>Dev: Verify Hot Methods and Call Tree visually

    Note over Dev,App: Phase 4: Code Correction & Validation
    Dev->>App: Apply closed-form algorithm in CpuHotspotScenario.java
    Dev->>App: Trigger candidate run (cpu-hotspot-corrected.jfr)
    Dev->>AI: "Compare before vs after recordings"
    AI->>MCP: Call analyze_cpu on both recordings
    MCP-->>AI: Calculate sample reduction delta (-100% hotspot elimination)
    AI-->>Dev: Validate 130,000% throughput gain and zero regressions
```

---

## 3. Decoupled Three-Layer MCP Server Design

The `jfr-performance-mcp` server adheres strictly to hexagonal separation:

```mermaid
flowchart LR
    subgraph Layer3["Layer 3: Protocol Transport"]
        MCP_SERVER["JfrMcpServer"]
        STDIO["StdioServerTransportProvider"]
        LOGBACK["Logback (STDERR Only)"]
    end

    subgraph Layer2["Layer 2: Domain Model"]
        EVIDENCE["Evidence Record"]
        FINDING["PerformanceFinding Record"]
        SEVERITY["FindingSeverity"]
    end

    subgraph Layer1["Layer 1: Analysis Engine"]
        ENGINE["JfrAnalysisEngine"]
        STREAMER["JfrRecordingReader"]
        CACHE["InMemoryRecordingAnalysisCache"]
        ANALYZERS["8 Domain Analyzers"]
    end

    Layer3 <-->|"Converts Tools to Domain Calls"| Layer2
    Layer2 <-->|"Structured Finding DTOs"| Layer1
    Layer1 -->|"Safe jdk.jfr.consumer streaming"| JDK_JVM["HotSpot JVM APIs"]
```

### Architectural Key Properties:
- **Engine Purity:** Layer 1 knows nothing about MCP, JSON-RPC, or AI prompt semantics. It can be embedded in any CLI or web backend.
- **Fact Model Immutability:** Layer 2 guarantees that raw measurements are preserved intact without subjective alteration.
- **Protocol Safety:** Layer 3 ensures standard output carries only valid JSON-RPC frames, eliminating communication desync.
