---
id: cpu-hotspot
title: "Scenario: CPU Hotspot"
sidebar_label: CPU Hotspot
description: Investigating algorithmic CPU saturation in pricing calculation with JFR, JMC, and AI.
keywords:
  - CPU hotspot
  - jdk.ExecutionSample
  - HotSpot profiling
  - Java CPU profiling
  - discount calculation
---

# Scenario Guide: CPU Hotspot (`cpu-hotspot`)

- **Component:** `com.shopsphere.demo.scenario.cpu.CpuHotspotScenario`
- **Dominant JFR Event:** `jdk.ExecutionSample`
- **Thread State:** `STATE_RUNNABLE`

---

## 1. The Performance Symptom

Under modest concurrent user requests, the service experiences severe throughput degradation and latency inflation. Worker threads peg available CPU cores at 100% capacity while servicing relatively low transactions per second. Thread dumps confirm threads are continuously runnable, not blocked on I/O or locks.

---

## 2. How to Trigger the Scenario Safely

Run the standalone benchmark runner with an 8-thread workload capped at 15 seconds:

```bash
cd jfr-performance-demo-app
./scripts/run-demo.sh cpu-hotspot 15 8
```

Alternatively, if running the interactive Spring Boot server on port 8080:

```bash
curl -X POST "http://localhost:8080/api/scenarios/cpu-hotspot/start?mode=FAULTY&durationSeconds=15&concurrency=8"
```

Safety constraints ensure the benchmark terminates automatically after 15 seconds.

---

## 3. How to Capture the Recording

When using `./scripts/run-demo.sh`, JFR capture is automated.

If capturing manually against the running Spring Boot server using JDK `jcmd`:

```bash
# 1. Identify JVM PID
jcmd | grep ShopSphereApplication

# 2. Start JFR profile recording
jcmd <PID> JFR.start name=cpu-run settings=profile duration=15s filename=recordings/cpu-hotspot-faulty.jfr

# 3. Check status
jcmd <PID> JFR.check
```

---

## 4. What to Inspect in JDK Mission Control (JMC)

1. Launch `jmc` and open `recordings/cpu-hotspot-faulty.jfr`.
2. Navigate to **Method Profiling &rarr; Hot Methods**.
3. Locate `CpuHotspotScenario.calculateComplexDiscountMatrix`:
   - It accounts for **>95%** of all recorded execution samples.
4. Select the **Call Tree** tab and expand callers:
   - All worker threads converge on `executeStep() &rarr; calculateComplexDiscountMatrix()`.
5. Check **Threads**:
   - All 8 worker threads remain in `RUNNABLE` state throughout the sample duration.

---

## 5. Which MCP Tools to Use

Query the MCP server through your AI assistant using:

1. `recording_summary(recording="cpu-hotspot-faulty.jfr")`: Confirms total recording timeframe and sample volume.
2. `analyze_cpu(recording="cpu-hotspot-faulty.jfr", topN=5)`: Returns top methods, execution sample count, sample share percentage, and sample stack trace.

```json
{
  "totalSamples": 14820,
  "topMethods": [
    {
      "method": "com.shopsphere.demo.scenario.cpu.CpuHotspotScenario.calculateComplexDiscountMatrix()",
      "samples": 14210,
      "percentage": 95.88,
      "isNative": false,
      "sampleStackTrace": [
        "com.shopsphere.demo.scenario.cpu.CpuHotspotScenario.calculateComplexDiscountMatrix():84",
        "com.shopsphere.demo.scenario.cpu.CpuHotspotScenario.executeStep():48"
      ]
    }
  ],
  "averageJvmUserCpu": 0.88
}
```

---

## 6. What the Evidence Does and Does Not Prove

### What It DOES Prove:
- **Strong statistical dominance:** Over 95% of execution ticks captured thread program counters inside `calculateComplexDiscountMatrix()`.
- **Compute-bound execution:** Threads were actively runnable on CPU, ruling out lock contention and downstream I/O waits.

### What It DOES NOT Prove:
- **Exact nanosecond accounting:** `jdk.ExecutionSample` is a statistical sampling mechanism (10ms–20ms interval). It does not guarantee continuous execution between sample ticks.
- **Root algorithmic flaw:** JFR identifies *where* the CPU cycles were burned; human or AI code analysis is required to determine *why* the loop is computationally redundant.

---

## 7. How to Inspect and Correct the Source Code

Open `src/main/java/com/shopsphere/demo/scenario/cpu/CpuHotspotScenario.java`:

### Faulty Implementation
```java
// O(N) loop computing redundant trigonometric polynomials per transaction
private double calculateComplexDiscountMatrix(String customerId, double subtotal, int itemCount) {
    double discount = 0.0;
    for (int i = 1; i <= 5000; i++) {
        discount += Math.sin(i) * Math.cos(i) * Math.sqrt(subtotal) / 10000.0;
    }
    return Math.min(discount, subtotal * 0.30);
}
```

### Corrected Implementation
```java
// O(1) closed-form calculation
private double calculateClosedFormDiscount(String customerId, double subtotal, int itemCount) {
    double baseRate = 0.30;
    return subtotal * baseRate;
}
```

---

## 8. Comparing Before-and-After Measurements

Execute `./scripts/run-demo.sh cpu-hotspot 15 8` to generate the comparison report:

| Metric | Faulty Baseline | Corrected Version | Improvement |
| :--- | :--- | :--- | :--- |
| **Throughput (ops/sec)** | 358 ops/s | 468,210 ops/s | **+130,538%** |
| **P50 Latency** | 22.3 ms | 0.016 ms | **-99.9%** |
| **P99 Latency** | 31.4 ms | 0.042 ms | **-99.8%** |
| **Hotspot Sample Share** | 95.8% | < 1.0% | **Eliminated** |

The corrected recording demonstrates near-zero CPU time spent in discount calculation, allowing the worker pool to reach memory-bus throughput limits.
