---
id: thread-pool-starvation
title: "Scenario: Thread Pool Starvation"
sidebar_label: Thread Pool Starvation
description: Investigating executor queue buildup and worker starvation with JFR, JMC, and AI.
keywords:
  - Thread pool starvation
  - jdk.ThreadPark
  - ExecutorService
  - Virtual Threads
  - Java 21
---

# Scenario Guide: Thread Pool Starvation (`thread-pool-starvation`)

- **Component:** `com.shopsphere.demo.scenario.threadpool.ThreadPoolStarvationScenario`
- **Dominant JFR Event:** `jdk.ThreadPark`
- **Thread State:** `WAITING` / `TIMED_WAITING`

---

## 1. The Performance Symptom

The application becomes unresponsive under concurrency. Inbound web requests wait dozens of seconds or encounter gateway timeout errors (HTTP 504), even though host CPU usage remains low.

---

## 2. How to Trigger the Scenario Safely

Run the standalone benchmark runner:

```bash
cd jfr-performance-demo-app
./scripts/run-demo.sh thread-pool-starvation 15 8
```

---

## 3. How to Capture the Recording

Capturing with `jcmd`:

```bash
jcmd <PID> JFR.start name=starvation-run settings=profile duration=15s filename=recordings/thread-pool-starvation-faulty.jfr
```

---

## 4. What to Inspect in JDK Mission Control (JMC)

1. Open `recordings/thread-pool-starvation-faulty.jfr` in JMC.
2. Navigate to **Threads &rarr; Threads View**.
3. Inspect caller thread states:
   - Request threads spend almost 100% of their lifespan parked on `Future.get()`.
4. Check **Event Browser &rarr; Java Application &rarr; Java Thread Park**:
   - Park durations range from 500ms to 2000ms.
   - Stack traces lead to `java.util.concurrent.FutureTask.awaitDone()` while waiting for worker threads.

---

## 5. Which MCP Tools to Use

Query the MCP server via your AI assistant:

1. `analyze_threads(recording="thread-pool-starvation-faulty.jfr")`: Highlights high counts of parked and waiting threads compared to runnable threads.
2. `analyze_latency(recording="thread-pool-starvation-faulty.jfr", thresholdMs=100.0)`: Lists parked thread events exceeding the latency threshold.

```json
{
  "totalThreadCount": 24,
  "blockedThreads": 0,
  "waitingThreads": 2,
  "parkedThreads": 14,
  "topCpuThreads": [
    {
      "threadName": "bounded-worker-0",
      "cpuSamples": 120,
      "percentage": 45.0
    }
  ]
}
```

---

## 6. What the Evidence Does and Does Not Prove

### What It DOES Prove:
- **Queue and Worker Starvation:** Caller threads are spending their duration in OS park state waiting on completion of tasks submitted to an executor.
- **Low CPU Activity:** Confirms that threads are idle rather than performing CPU-intensive work.

### What It DOES NOT Prove:
- **Optimal Sizing Strategy:** The evidence shows the executor is saturated, but whether to increase pool capacity, apply backpressure, or migrate to Java 21 Virtual Threads depends on whether tasks are I/O-bound or CPU-bound.

---

## 7. How to Inspect and Correct the Source Code

Open `src/main/java/com/shopsphere/demo/scenario/threadpool/ThreadPoolStarvationScenario.java`:

### Faulty Implementation (Undersized Fixed Pool)
```java
// Fixed 2-thread worker pool for 16+ concurrent requests
private final ExecutorService executor = Executors.newFixedThreadPool(2);

public OrderResult processAsync(OrderRequest request) {
    Future<OrderResult> future = executor.submit(() -> doProcess(request));
    return future.get(); // Blocks waiting for one of the 2 threads to become free
}
```

### Corrected Implementation (Java 21 Virtual Threads)
```java
// Java 21 lightweight virtual thread executor: 1 virtual thread per task
private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

public OrderResult processAsync(OrderRequest request) {
    Future<OrderResult> future = executor.submit(() -> doProcess(request));
    return future.get(); // Instantaneous worker scheduling without queue delay
}
```

---

## 8. Comparing Before-and-After Measurements

| Metric | Faulty (2 Fixed Workers) | Corrected (Virtual Threads) | Improvement |
| :--- | :--- | :--- | :--- |
| **Throughput (ops/sec)** | 18 ops/s | 1,420 ops/s | **+7,788%** |
| **P99 Latency** | 1,240 ms | 12.4 ms | **-99.0%** |
| **Parked Request Threads** | 14 threads | 0 threads waiting on pool | Solved |
