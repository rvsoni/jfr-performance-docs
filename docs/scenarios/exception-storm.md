---
id: exception-storm
title: "Scenario: Exception Storm"
sidebar_label: Exception Storm
description: Investigating JVM overhead from using exceptions for control flow with JFR, JMC, and AI.
keywords:
  - Exception storm
  - jdk.JavaExceptionThrow
  - fillInStackTrace
  - Java performance anti-pattern
---

# Scenario Guide: Exception Storm (`exception-storm`)

- **Component:** `com.shopsphere.demo.scenario.exception.ExceptionStormScenario`
- **Dominant JFR Events:** `jdk.JavaExceptionThrow`, `jdk.ExecutionSample` (`Throwable.fillInStackTrace`)
- **Subsystem:** HotSpot Execution Engine & Stack Unwinding

---

## 1. The Performance Symptom

The application consumes elevated CPU during business validation routines. Service logs might not show unhandled errors because exceptions are caught and swallowed internally, yet throughput is degraded by 50% to 80%.

---

## 2. How to Trigger the Scenario Safely

Run the standalone benchmark runner:

```bash
cd jfr-performance-demo-app
./scripts/run-demo.sh exception-storm 15 8
```

---

## 3. How to Capture the Recording

Capturing with `jcmd`:

```bash
jcmd <PID> JFR.start name=exception-run settings=profile duration=15s filename=recordings/exception-storm-faulty.jfr
```

---

## 4. What to Inspect in JDK Mission Control (JMC)

1. Open `recordings/exception-storm-faulty.jfr` in JMC.
2. Navigate to **JVM Internals &rarr; Exceptions**:
   - Check the exception rate: Thousands of exceptions thrown per second.
   - Thrown class: `com.shopsphere.demo.scenario.exception.OrderValidationException`.
3. Open **Method Profiling &rarr; Hot Methods**:
   - Notice high sample concentrations in `java.lang.Throwable.fillInStackTrace()`.
   - The HotSpot JVM must walk the current call frame on every exception instantiation to construct the stack trace array.

---

## 5. Which MCP Tools to Use

Query the MCP server via your AI assistant:

1. `analyze_exceptions(recording="exception-storm-faulty.jfr", topN=5)`
2. `analyze_cpu(recording="exception-storm-faulty.jfr", topN=5)`

```json
{
  "totalExceptionsThrown": 24800,
  "totalErrors": 0,
  "topExceptions": [
    {
      "exceptionClass": "com.shopsphere.demo.scenario.exception.OrderValidationException",
      "count": 24800,
      "sampleMessage": "Validation failed: item quantity exceeds limit",
      "isError": false
    }
  ]
}
```

---

## 6. What the Evidence Does and Does Not Prove

### What It DOES Prove:
- **Massive exception instantiation:** Quantitative proof that exceptions are being generated in tight business loops.
- **CPU waste in stack generation:** Corroborated by `ExecutionSample` events inside `Throwable.fillInStackTrace()`.

### What It DOES NOT Prove:
- **Application Crash or Bug:** These exceptions do not indicate an unhandled outage or application crash—they are being caught and handled as anti-pattern control flow.

---

## 7. How to Inspect and Correct the Source Code

Open `src/main/java/com/shopsphere/demo/scenario/exception/ExceptionStormScenario.java`:

### Faulty Implementation (Exception as Control Flow)
```java
// Throws exception for normal expected business validation
public void validateOrderItem(OrderItem item) throws OrderValidationException {
    if (item.getQuantity() > 100) {
        throw new OrderValidationException("Quantity too large"); // Expensive stack walk!
    }
}
```

### Corrected Implementation (Explicit ValidationResult Type)
```java
// Returns typed record without allocating exception or walking stack
public ValidationResult validateOrderItem(OrderItem item) {
    if (item.getQuantity() > 100) {
        return ValidationResult.invalid("Quantity too large");
    }
    return ValidationResult.valid();
}
```

---

## 8. Comparing Before-and-After Measurements

| Metric | Faulty (Exception Control Flow) | Corrected (ValidationResult) | Improvement |
| :--- | :--- | :--- | :--- |
| **Exceptions Thrown** | 24,800 events | 0 events | **-100%** |
| **Throughput (ops/sec)** | 2,150 ops/s | 94,800 ops/s | **+4,309%** |
| **Stack Trace CPU Share** | 24.2% of CPU samples | 0.0% | Eliminated |
