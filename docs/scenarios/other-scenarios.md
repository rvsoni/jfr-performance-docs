---
id: other-scenarios
title: Extended Scenarios
sidebar_label: Extended Scenarios
description: Investigating lock scope across I/O calls and JVM heap sizing variations with JFR, JMC, and AI.
keywords:
  - Lock and I/O
  - JVM heap sizing
  - memory MXBean
  - Garbage Collection flags
---

# Extended Scenarios: Lock & I/O and JVM Configuration

This guide details the two extended scenarios in the `jfr-performance-demo-app` catalog: `lock-and-io` and `jvm-configuration`.

---

## 1. Lock Scope with I/O (`lock-and-io`)

- **Component:** `com.shopsphere.demo.scenario.contention.LockAndIoScenario`
- **Dominant JFR Events:** `jdk.JavaMonitorEnter` + `jdk.ThreadPark` / Socket Wait
- **Root Cause:** Holding a shared synchronization monitor across a slow downstream network call.

### The Performance Symptom
When downstream partner APIs slow down, unrelated local transactions freeze. A delay in payment processing causes catalog browsing or account profile updates to stall because unrelated operations contend for the same shared monitor.

### Trigger Safely
```bash
./scripts/run-demo.sh lock-and-io 15 8
```

### JMC & MCP Evidence
- **JMC:** Open **Threads &rarr; Lock Instances**. Threads are blocked on `java.lang.Object` for the entire 20ms–50ms duration of the downstream network call.
- **MCP Tool:** `analyze_locks` flags high blocked duration, while `analyze_io` confirms slow I/O occurred on the lock-holding thread.

### Source Code Correction
Move the downstream I/O call outside the `synchronized` block:

```java
// Faulty: Holding lock during network call
synchronized (inventoryLock) {
    paymentClient.charge(paymentReq); // BLOCKS other threads for 25ms!
    stockCount--;
}

// Corrected: Network call performed outside critical section
PaymentResult res = paymentClient.charge(paymentReq);
if (res.isSuccess()) {
    synchronized (inventoryLock) {
        stockCount--; // In-memory lock held for < 1 microsecond
    }
}
```

---

## 2. JVM Heap Sizing Comparison (`jvm-configuration`)

- **Component:** `com.shopsphere.demo.scenario.jvm.JvmConfigurationScenario`
- **Dominant JFR Events:** `jdk.GarbageCollection`, `jdk.GCPhasePause`, `jdk.CPULoad`
- **Root Cause:** Inadequate heap sizing triggering frequent Full GCs or excessive pause times.

### The Performance Symptom
Elevated CPU usage in garbage collection worker threads (`GC Thread#`), high tail latency, or OutOfMemory errors when the heap is undersized (e.g. `-Xmx256m` for a high-allocation workload) versus optimal sizing (`-Xmx2g`).

### Comparing Configurations
Run the demo with constrained memory:
```bash
java -Xms256m -Xmx256m -jar target/jfr-performance-demo-app-1.0.0-SNAPSHOT.jar
```
Versus properly sized memory:
```bash
java -Xms2g -Xmx2g -XX:+UseG1GC -jar target/jfr-performance-demo-app-1.0.0-SNAPSHOT.jar
```

### JMC & MCP Evidence
- **JMC:** Open **Memory &rarr; Garbage Collections** and compare Young GC intervals and Full GC counts.
- **MCP Tool:** `analyze_gc` outputs assessment `CRITICAL` or `HIGH` on constrained heap due to elevated pause time totals (>1500ms), but reports `LOW` on appropriately sized heap.
