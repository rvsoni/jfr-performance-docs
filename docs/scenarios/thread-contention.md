---
id: thread-contention
title: "Scenario: Thread Contention"
sidebar_label: Thread Contention
description: Investigating synchronized monitor contention and serialized locks with JFR, JMC, and AI.
keywords:
  - Thread contention
  - jdk.JavaMonitorEnter
  - synchronized lock
  - AtomicInteger CAS
  - Java concurrency
---

# Scenario Guide: Thread Contention (`thread-contention`)

- **Component:** `com.shopsphere.demo.scenario.contention.ThreadContentionScenario`
- **Dominant JFR Event:** `jdk.JavaMonitorEnter`
- **Thread State:** `BLOCKED`

---

## 1. The Performance Symptom

As concurrent incoming requests increase from 1 to 8 or 16 threads, transaction throughput flatlines or degrades, while CPU utilization remains surprisingly low (under 20%). P95 and P99 latency percentiles escalate dramatically. Developers often mistakenly add more server instances or threads, which worsens queue delays.

---

## 2. How to Trigger the Scenario Safely

Run the standalone benchmark with 8 worker threads for 15 seconds:

```bash
cd jfr-performance-demo-app
./scripts/run-demo.sh thread-contention 15 8
```

Or via REST API:

```bash
curl -X POST "http://localhost:8080/api/scenarios/thread-contention/start?mode=FAULTY&durationSeconds=15&concurrency=8"
```

---

## 3. How to Capture the Recording

The runner script captures `recordings/thread-contention-faulty-<timestamp>.jfr`.

To record via `jcmd`:

```bash
jcmd <PID> JFR.start name=contention-run settings=profile duration=15s filename=recordings/thread-contention-faulty.jfr
```

---

## 4. What to Inspect in JDK Mission Control (JMC)

1. Launch `jmc` and open `recordings/thread-contention-faulty.jfr`.
2. Open **Threads &rarr; Lock Instances**.
3. Inspect the top contested monitor:
   - Monitor class: `java.lang.Object`
   - Field: `InventoryService.globalMonitor`
   - Number of blocking events: Hundreds to thousands
   - Cumulative blocked duration: Several seconds
4. Open **Threads &rarr; Thread States**:
   - Worker threads spend significant timeline percentages in **BLOCKED** state awaiting monitor acquisition.

---

## 5. Which MCP Tools to Use

Query the MCP server via your AI assistant:

1. `analyze_locks(recording="thread-contention-faulty.jfr", topN=5)`
2. `analyze_threads(recording="thread-contention-faulty.jfr")`

```json
{
  "totalContentionEvents": 248,
  "totalBlockedDurationMs": 14210.5,
  "contentions": [
    {
      "monitorClass": "java.lang.Object",
      "blockedThreads": 8,
      "eventCount": 248,
      "blockedTimeMs": 14210.5,
      "maxBlockedTimeMs": 112.4,
      "avgBlockedTimeMs": 57.3,
      "contendingThreads": ["worker-1", "worker-2", "worker-3", "worker-4"]
    }
  ]
}
```

---

## 6. What the Evidence Does and Does Not Prove

### What It DOES Prove:
- **Direct serialization:** Multiple threads are queueing behind a single mutual-exclusion lock (`globalMonitor`), directly explaining the latency inflation and low CPU usage.
- **Wait magnitude:** Quantitative blocked time metrics prove how many milliseconds threads spent sleeping in OS wait queues.

### What It DOES NOT Prove:
- **Thread safety implications of removing the lock:** The recording proves the lock causes contention, but removing it naively could cause data corruption. The engineer must verify thread safety.

---

## 7. How to Inspect and Correct the Source Code

Open `src/main/java/com/shopsphere/demo/service/InventoryService.java`:

### Faulty Implementation (Coarse Monitor Lock)
```java
// Coarse lock serialized across ALL products regardless of SKU
private final Object globalMonitor = new Object();

public boolean reserveWithHeavyLock(String productId, int quantity) {
    synchronized (globalMonitor) {
        // Redundant artificial delay and checksum calculation held inside lock
        simulateHeavyChecksum();
        int stock = inventoryMap.getOrDefault(productId, 0);
        if (stock >= quantity) {
            inventoryMap.put(productId, stock - quantity);
            return true;
        }
        return false;
    }
}
```

### Corrected Implementation (Fine-Grained Atomic CAS)
```java
// Lock-free atomic reservation per individual product SKU
private final ConcurrentHashMap<String, AtomicInteger> stockCounters = new ConcurrentHashMap<>();

public boolean reserveFineGrained(String productId, int quantity) {
    AtomicInteger stock = stockCounters.computeIfAbsent(productId, k -> new AtomicInteger(1000));
    while (true) {
        int current = stock.get();
        if (current < quantity) return false;
        if (stock.compareAndSet(current, current - quantity)) {
            return true;
        }
    }
}
```

---

## 8. Comparing Before-and-After Measurements

| Metric | Faulty (Global Monitor) | Corrected (Fine-Grained CAS) | Improvement |
| :--- | :--- | :--- | :--- |
| **Throughput (ops/sec)** | 142 ops/s | 89,400 ops/s | **+62,857%** |
| **P95 Latency** | 56.4 ms | 0.08 ms | **-99.8%** |
| **Total Blocked Time** | 14,210 ms | 0.0 ms | **Eliminated (100%)** |
| **Active Thread State** | `BLOCKED` (78% time) | `RUNNABLE` | Scalable |
