---
id: allocation-and-gc
title: "Scenario: Allocation Pressure & GC"
sidebar_label: Allocation & GC Pressure
description: Investigating memory allocation churn and garbage collection pause times with JFR, JMC, and AI.
keywords:
  - Allocation pressure
  - GC pause times
  - jdk.ObjectAllocationSample
  - Eden churn
  - StringBuilder
---

# Scenario Guide: Allocation Pressure & GC (`allocation-pressure` & `gc-pressure`)

- **Components:** `AllocationPressureScenario` & `GcPressureScenario`
- **Dominant JFR Events:** `jdk.ObjectAllocationSample`, `jdk.GarbageCollection`, `jdk.GCPhasePause`
- **Subsystem:** HotSpot Memory & Garbage Collector (G1 / Parallel)

---

## 1. The Performance Symptom

The application suffers from periodic throughput stuttering and tail latency spikes. Monitoring shows JVM process CPU spikes corresponding with garbage collection activity, while Eden space fills and resets every few seconds.

---

## 2. How to Trigger the Scenario Safely

Run the allocation pressure benchmark:

```bash
cd jfr-performance-demo-app
./scripts/run-demo.sh allocation-pressure 15 8
```

Or trigger GC pressure directly:

```bash
./scripts/run-demo.sh gc-pressure 15 8
```

Both workloads operate within a bounded 15-second window with zero static collection leaks.

---

## 3. How to Capture the Recording

Capturing with `jcmd`:

```bash
jcmd <PID> JFR.start name=alloc-run settings=profile duration=15s filename=recordings/allocation-pressure-faulty.jfr
```

---

## 4. What to Inspect in JDK Mission Control (JMC)

1. Open `recordings/allocation-pressure-faulty.jfr` in JMC.
2. Select **Memory &rarr; Allocations**.
3. Inspect **Allocations by Class**:
   - `java.lang.String` and `java.util.HashMap$Node` dominate allocations.
4. Select **JVM Internals &rarr; Garbage Collections**:
   - Observe the count of Young Generation collections, pause durations, and GC frequency (e.g. GC every 800ms).
5. Inspect the **Allocation Call Tree**:
   - Follow the stack trace directly to `AllocationPressureScenario.generateInefficientSummary()`.

---

## 5. Which MCP Tools to Use

Query the MCP server via your AI assistant:

1. `analyze_allocation(recording="allocation-pressure-faulty.jfr", topN=5)`
2. `analyze_gc(recording="allocation-pressure-faulty.jfr")`

```json
{
  "totalAllocationSamples": 8420,
  "estimatedAllocationRateMbPerSec": 412.5,
  "topAllocatingClasses": [
    {
      "className": "java.lang.String",
      "sampleCount": 4210,
      "estimatedBytes": 274877900,
      "percentage": 50.0
    },
    {
      "className": "java.util.HashMap$Node",
      "sampleCount": 2105,
      "estimatedBytes": 137438900,
      "percentage": 25.0
    }
  ]
}
```

---

## 6. What the Evidence Does and Does Not Prove

### What It DOES Prove:
- **High allocation rate:** Identifies that application code is generating hundreds of megabytes of short-lived objects per second, straining Eden memory pools.
- **Root call paths:** Stack traces confirm exact classes and methods responsible for the allocation churn.

### What It DOES NOT Prove:
- **Memory Leak:** JFR evidence proves *churn*, not a *leak*. Post-GC live heap occupancy returns to baseline, confirming objects are successfully garbage collected.

---

## 7. How to Inspect and Correct the Source Code

Open `src/main/java/com/shopsphere/demo/scenario/allocation/AllocationPressureScenario.java`:

### Faulty Implementation (Intermediate Maps and String Concatenation)
```java
public String generateInefficientSummary(List<Order> orders) {
    String summary = "";
    // Iterative concatenation creates thousands of throwaway String and char[] instances
    for (Order order : orders) {
        Map<String, Object> tempMap = new HashMap<>(); // intermediate map per item
        tempMap.put("id", order.getId());
        tempMap.put("total", order.getTotal());
        summary = summary + "Order:" + tempMap.get("id") + ",Total:" + tempMap.get("total") + "\n";
    }
    return summary;
}
```

### Corrected Implementation (Pre-sized StringBuilder & Zero Throwaways)
```java
public String generateEfficientSummary(List<Order> orders) {
    StringBuilder sb = new StringBuilder(orders.size() * 32);
    for (Order order : orders) {
        sb.append("Order:").append(order.getId())
          .append(",Total:").append(order.getTotal())
          .append('\n');
    }
    return sb.toString();
}
```

---

## 8. Comparing Before-and-After Measurements

| Metric | Faulty Run | Corrected Run | Improvement |
| :--- | :--- | :--- | :--- |
| **Allocation Rate** | 412.5 MB/sec | 3.2 MB/sec | **-99.2%** |
| **Young GC Pauses** | 18 collections (145ms total) | 1 collection (8ms total) | **-94.5%** |
| **Throughput (ops/sec)** | 1,240 ops/s | 68,100 ops/s | **+5,391%** |
| **GC Pause Overhead** | 8.2% of total runtime | < 0.1% | Negligible |
