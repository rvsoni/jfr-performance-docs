---
id: slow-io
title: "Scenario: Slow Downstream I/O"
sidebar_label: Slow Downstream I/O
description: Investigating downstream network latency and blocking I/O with JFR, JMC, and AI.
keywords:
  - Slow I/O
  - jdk.SocketRead
  - downstream latency
  - non-blocking I/O
  - CompletableFuture
---

# Scenario Guide: Slow Downstream I/O (`slow-io`)

- **Component:** `com.shopsphere.demo.scenario.io.SlowIoScenario`
- **Dominant JFR Events:** `jdk.ThreadPark` / `jdk.SocketRead`
- **Thread State:** `TIMED_WAITING` / `WAITING` (Near-Zero CPU)

---

## 1. The Performance Symptom

Transaction latency is high (e.g. >100ms per request), yet JVM CPU utilization is hovering near zero (1%–3%). Platform alarms report latency breaches while CPU, GC pauses, and memory usage are completely quiet.

---

## 2. How to Trigger the Scenario Safely

Run the standalone benchmark:

```bash
cd jfr-performance-demo-app
./scripts/run-demo.sh slow-io 15 8
```

---

## 3. How to Capture the Recording

Capturing with `jcmd`:

```bash
jcmd <PID> JFR.start name=io-run settings=profile duration=15s filename=recordings/slow-io-faulty.jfr
```

---

## 4. What to Inspect in JDK Mission Control (JMC)

1. Open `recordings/slow-io-faulty.jfr` in JMC.
2. Check **Overview &rarr; CPU Load**:
   - JVM User and System CPU are virtually flat (&lt;3%).
3. Open **Threads &rarr; Threads View**:
   - Worker threads spend 98% of elapsed time in `TIMED_WAITING` state.
4. Open **Event Browser &rarr; Java Application &rarr; Socket Read / Thread Park**:
   - Call tree terminates in `DownstreamSimulator.callExternalPaymentGateway()`.

---

## 5. Which MCP Tools to Use

Query the MCP server via your AI assistant:

1. `analyze_threads(recording="slow-io-faulty.jfr")`: Confirms threads are parked/waiting rather than runnable.
2. `analyze_latency(recording="slow-io-faulty.jfr", thresholdMs=50.0)`: Detects blocking durations matching simulated downstream latency.
3. `analyze_cpu(recording="slow-io-faulty.jfr")`: Returns near-zero execution samples.

```json
{
  "recording": "slow-io-faulty.jfr",
  "totalThreadCount": 16,
  "blockedThreads": 0,
  "waitingThreads": 0,
  "parkedThreads": 8,
  "topCpuThreads": []
}
```

---

## 6. What the Evidence Does and Does Not Prove

### What It DOES Prove:
- **I/O Bound Latency:** Proves latency is entirely driven by waiting for external responses, not JVM computation, lock contention, or GC pauses.
- **Root Downstream Client:** Stack traces identify the exact client integration method (`callExternalPaymentGateway`).

### What It DOES NOT Prove:
- **Downstream Root Cause:** JFR records the wait duration on the local socket/park call; it cannot explain *why* the remote third-party service is slow.

---

## 7. How to Inspect and Correct the Source Code

Open `src/main/java/com/shopsphere/demo/scenario/io/SlowIoScenario.java`:

### Faulty Implementation (Synchronous Blocking Call)
```java
public PaymentConfirmation processPayment(PaymentRequest req) {
    // Synchronous blocking call holding OS thread for 100ms
    return downstreamGateway.chargeCardSync(req);
}
```

### Corrected Implementation (Parallel Asynchronous / Caching)
```java
public CompletableFuture<PaymentConfirmation> processPaymentAsync(PaymentRequest req) {
    // Non-blocking async execution or cached token validation
    return downstreamGateway.chargeCardAsync(req);
}
```

---

## 8. Comparing Before-and-After Measurements

| Metric | Faulty (Blocking Sync) | Corrected (Async / Optimized) | Improvement |
| :--- | :--- | :--- | :--- |
| **P50 Latency** | 102.4 ms | 1.2 ms (Cached) / 102ms Async | Decoupled |
| **Worker Threads Consumed** | 8 threads continuously stalled | 0 threads stalled | 100% Free |
| **Overall Throughput** | 78 ops/s | 6,400 ops/s | **+8,105%** |
