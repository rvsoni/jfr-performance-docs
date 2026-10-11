---
id: tools-reference
title: MCP Tools Reference
sidebar_label: MCP Tools Reference
description: Complete reference for all 11 MCP diagnostic tools, parameter schemas, and response formats.
keywords:
  - MCP tools
  - analyze_cpu
  - analyze_gc
  - analyze_locks
  - analyze_allocation
  - JVM performance tools
---

# MCP Tools Reference

`jfr-performance-mcp` exposes 11 production-ready tools via the Model Context Protocol. Each tool is designed to deliver unambiguous, structured evidence to AI models.

---

## Tool Summary Matrix

| Tool | Category | Key Inputs | Primary Purpose |
| :--- | :--- | :--- | :--- |
| [`list_recordings`](#1-list_recordings) | Discovery | `directory` *(opt)* | Lists `.jfr` files in the configured directory |
| [`recording_summary`](#2-recording_summary) | Metadata | `recording` *(req)* | Returns timeframe, JVM flags, core count, event types |
| [`analyze_cpu`](#3-analyze_cpu) | Compute | `recording`, `topN` | Analyzes execution sample distribution and hotspots |
| [`analyze_gc`](#4-analyze_gc) | Memory | `recording` | Evaluates pause times, STW phases, and collections |
| [`analyze_allocation`](#5-analyze_allocation) | Memory | `recording`, `topN` | Evaluates allocation rates and top allocating classes |
| [`analyze_threads`](#6-analyze_threads) | Concurrency | `recording` | Summarizes thread states, counts, and per-thread CPU |
| [`analyze_locks`](#7-analyze_locks) | Concurrency | `recording`, `topN` | Detects monitor enter contention and blocked durations |
| [`analyze_exceptions`](#8-analyze_exceptions) | Errors | `recording`, `topN` | Detects exception storms and top throwing classes |
| [`analyze_io`](#9-analyze_io) | I/O | `recording`, `topN` | Measures Socket/File I/O operations and latency |
| [`analyze_latency`](#10-analyze_latency) | Outliers | `recording`, `thresholdMs` | Flags pauses, waits, and I/O exceeding a threshold |
| [`analyze_recording`](#11-analyze_recording) | Triage | `recording` *(req)* | Multi-dimensional triage correlating all evidence |

---

## 1. `list_recordings`

Discovers available `.jfr` recordings inside the configured directory.

- **Parameters**:
  - `directory` *(string, optional)*: Subdirectory relative to `JFR_RECORDINGS_DIR`. Defaults to root.
- **Example Response**:
```json
{
  "recordings": [
    {
      "name": "cpu-hotspot-faulty.jfr",
      "path": "cpu-hotspot-faulty.jfr",
      "sizeBytes": 148342,
      "lastModified": "2026-10-10T14:44:00Z"
    },
    {
      "name": "thread-contention-faulty.jfr",
      "path": "thread-contention-faulty.jfr",
      "sizeBytes": 214890,
      "lastModified": "2026-10-10T14:44:30Z"
    }
  ],
  "totalCount": 2
}
```

---

## 2. `recording_summary`

Returns global recording metadata, recording window duration, JVM version and hardware cores, and event distribution.

- **Parameters**:
  - `recording` *(string, required)*: Recording filename.
- **Example Response**:
```json
{
  "fileName": "demo-production.jfr",
  "fileSizeBytes": 148342,
  "startTime": "2026-10-10T14:40:00.123Z",
  "endTime": "2026-10-10T14:40:15.456Z",
  "durationSeconds": 15.33,
  "jvm": {
    "version": "21.0.2+13-LTS",
    "vendor": "Eclipse Adoptium",
    "vmName": "OpenJDK 64-Bit Server VM",
    "cpuCount": 16
  },
  "eventCount": 4210,
  "eventTypeCount": 24,
  "eventTypes": ["jdk.ExecutionSample", "jdk.JavaMonitorEnter", "jdk.CPULoad", "jdk.ObjectAllocationSample"]
}
```

---

## 3. `analyze_cpu`

Evaluates `jdk.ExecutionSample` and `jdk.CPULoad` events to locate application CPU hotspots.

- **Parameters**:
  - `recording` *(string, required)*: Recording filename.
  - `topN` *(integer, optional, default: 10)*: Number of top methods to return.
- **Example Response**:
```json
{
  "recording": "cpu-hotspot-faulty.jfr",
  "totalSamples": 1850,
  "topMethods": [
    {
      "method": "com.shopsphere.demo.scenario.cpu.CpuHotspotScenario.calculateComplexDiscountMatrix()",
      "samples": 1780,
      "percentage": 96.22,
      "isNative": false,
      "sampleStackTrace": [
        "com.shopsphere.demo.scenario.cpu.CpuHotspotScenario.calculateComplexDiscountMatrix():84",
        "com.shopsphere.demo.scenario.cpu.CpuHotspotScenario.executeStep():48"
      ]
    }
  ],
  "averageJvmUserCpu": 0.88,
  "evidenceNote": "Percentages represent statistical share of captured execution samples, NOT guaranteed continuous CPU time."
}
```

---

## 4. `analyze_gc`

Evaluates `jdk.GarbageCollection` and `jdk.GCPhasePause` events. Ranks GC health using deterministic assessment thresholds.

- **Parameters**:
  - `recording` *(string, required)*: Recording filename.
- **Assessment Thresholds**:
  - `CRITICAL`: Max pause > 1000ms, Old/Full GCs > 10, or post-GC heap occupancy > 90%.
  - `HIGH`: Max pause > 500ms, Old/Full GCs > 3, post-GC heap occupancy > 80%, or total pause > 5000ms.
  - `MEDIUM`: Max pause > 200ms, post-GC heap occupancy > 70%, or total pause > 1500ms.
  - `LOW`: Normal GC activity within safe bounds.
- **Example Response**:
```json
{
  "recording": "demo-production.jfr",
  "gcCount": 2,
  "totalPauseMs": 14.5,
  "maxPauseMs": 9.2,
  "averagePauseMs": 7.25,
  "youngGcCount": 2,
  "oldGcCount": 0,
  "assessment": "LOW",
  "assessmentRules": "CRITICAL: Max pause > 1000ms...",
  "findings": []
}
```

---

## 5. `analyze_allocation`

Evaluates memory allocation churn and top allocating classes from sampled `jdk.ObjectAllocationSample` events.

- **Parameters**:
  - `recording` *(string, required)*: Recording filename.
  - `topN` *(integer, optional, default: 10)*: Maximum items to return.
- **Example Response**:
```json
{
  "recording": "allocation-pressure-faulty.jfr",
  "totalAllocationSamples": 520,
  "estimatedTotalAllocatedBytes": 4259840,
  "estimatedAllocationRateMbPerSec": 3.05,
  "topAllocatingClasses": [
    {
      "className": "java.util.HashMap$Node",
      "sampleCount": 260,
      "estimatedBytes": 2129920,
      "percentage": 50.00
    },
    {
      "className": "java.lang.String",
      "sampleCount": 180,
      "estimatedBytes": 1474560,
      "percentage": 34.62
    }
  ],
  "estimationNote": "Allocation metrics are derived from sampled events (New TLAB allocation and Outside TLAB allocation)."
}
```

---

## 6. `analyze_threads`

Summarizes thread concurrency levels, execution states (`RUNNABLE`, `BLOCKED`, `WAITING`, `TIMED_WAITING`), and per-thread CPU consumption.

- **Parameters**:
  - `recording` *(string, required)*: Recording filename.
- **Example Response**:
```json
{
  "recording": "demo-production.jfr",
  "totalThreadCount": 18,
  "activeThreadCount": 18,
  "peakThreadCount": 24,
  "blockedThreads": 5,
  "waitingThreads": 2,
  "parkedThreads": 4,
  "topCpuThreads": [
    {
      "threadName": "workload-worker-1",
      "cpuSamples": 450,
      "percentage": 24.32
    }
  ]
}
```

---

## 7. `analyze_locks`

Analyzes `jdk.JavaMonitorEnter` events to detect synchronized lock contention.

- **Parameters**:
  - `recording` *(string, required)*: Recording filename.
  - `topN` *(integer, optional, default: 10)*: Maximum contended locks to return.
- **Example Response**:
```json
{
  "recording": "thread-contention-faulty.jfr",
  "totalContentionEvents": 48,
  "totalBlockedDurationMs": 2740.5,
  "contentions": [
    {
      "monitorClass": "java.lang.Object",
      "blockedThreads": 5,
      "eventCount": 48,
      "blockedTimeMs": 2740.5,
      "maxBlockedTimeMs": 150.2,
      "avgBlockedTimeMs": 57.09,
      "contendingThreads": ["worker-1", "worker-2", "worker-3"]
    }
  ]
}
```

---

## 8. `analyze_exceptions`

Identifies exception storms, top thrown classes, and fatal JVM errors from `jdk.JavaExceptionThrow` and `jdk.JavaErrorThrow`.

- **Parameters**:
  - `recording` *(string, required)*: Recording filename.
  - `topN` *(integer, optional, default: 10)*: Number of top exceptions to return.
- **Example Response**:
```json
{
  "recording": "exception-storm-faulty.jfr",
  "totalExceptionsThrown": 4500,
  "totalErrors": 0,
  "topExceptions": [
    {
      "exceptionClass": "com.shopsphere.demo.scenario.exception.OrderValidationException",
      "count": 4500,
      "sampleMessage": "Invalid item quantity",
      "isError": false
    }
  ]
}
```

---

## 9. `analyze_io`

Measures File and Socket I/O operation counts, total byte transfers, and slow operations exceeding duration thresholds.

- **Parameters**:
  - `recording` *(string, required)*: Recording filename.
  - `topN` *(integer, optional, default: 10)*: Number of slow events to return.

---

## 10. `analyze_latency`

Cross-correlates outlier latency events across monitor waits, GC pauses, and I/O operations exceeding a specified duration threshold.

- **Parameters**:
  - `recording` *(string, required)*: Recording filename.
  - `thresholdMs` *(number, optional, default: 100.0)*: Minimum latency in milliseconds.

---

## 11. `analyze_recording`

Primary multi-dimensional triage tool. Runs all analyzers in parallel, correlates cross-cutting evidence, scores confidence, highlights healthy subsystems, and produces actionable next steps.

- **Parameters**:
  - `recording` *(string, required)*: Recording filename.
- **Example Response**:
```json
{
  "recording": "demo-production.jfr",
  "overallAssessment": "HIGH",
  "findings": [
    {
      "category": "CPU",
      "severity": "HIGH",
      "confidence": 0.88,
      "title": "Dominant CPU Hotspot Detected in OrderService.calculatePrice()",
      "summary": "Method OrderService.calculatePrice() accounts for 96.12% of all execution samples.",
      "evidence": [
        {
          "metric": "methodCpuSamplePercentage",
          "value": 96.12,
          "unit": "percent_samples",
          "source": "jdk.ExecutionSample",
          "confidence": 0.90,
          "description": "Method calculatePrice() accounted for 96.12% of execution samples"
        }
      ],
      "impact": "High CPU utilization saturates worker pool cores.",
      "recommendedInvestigation": [
        "Review algorithm and loop structures in OrderService.calculatePrice()",
        "Inspect caller stack traces for unmemoized calculations"
      ]
    }
  ],
  "healthyAreas": [
    "GC pause times appear normal (max pause: 9.2ms, total pause: 14.5ms)",
    "No exception storm or JVM fatal error events detected"
  ],
  "nextSteps": [
    "Review algorithm and loop structures in OrderService.calculatePrice()"
  ]
}
```

---

## Planned Capabilities (Roadmap)

The following capabilities are in design or development:

- `compare_recordings`: Compares two recordings side-by-side (before vs. after fix) and reports delta metrics. (Data model `PerformanceSnapshot` is already defined in Layer 2).
- `analyze_rules`: Evaluates JMC Core automated rule definitions (`org.openjdk.jmc.flightrecorder.rules`) via `JfrAdvancedAnalyzer`.
- `LiveJfrDataSource`: Connects directly to a live running JVM via `jdk.jfr.consumer.EventStream` instead of offline `.jfr` files.
