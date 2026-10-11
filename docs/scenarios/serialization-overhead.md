---
id: serialization-overhead
title: "Scenario: Serialization Overhead"
sidebar_label: Serialization Overhead
description: Investigating Jackson JSON multi-pass serialization and allocation churn with JFR, JMC, and AI.
keywords:
  - Serialization overhead
  - Jackson ObjectMapper
  - JSON performance
  - byte array churn
---

# Scenario Guide: Serialization Overhead (`serialization-overhead`)

- **Component:** `com.shopsphere.demo.scenario.serialization.SerializationOverheadScenario`
- **Dominant JFR Events:** `jdk.ExecutionSample`, `jdk.ObjectAllocationSample`
- **Library / Layer:** Jackson Dataformat (`com.fasterxml.jackson.databind`)

---

## 1. The Performance Symptom

REST API response serialization consumes 30% to 50% of application CPU cycles and generates massive byte-array memory churn. Endpoint logic is simple, yet profiling reveals deep execution stacks in JSON encoders.

---

## 2. How to Trigger the Scenario Safely

Run the standalone benchmark runner:

```bash
cd jfr-performance-demo-app
./scripts/run-demo.sh serialization-overhead 15 8
```

---

## 3. How to Capture the Recording

Capturing with `jcmd`:

```bash
jcmd <PID> JFR.start name=ser-run settings=profile duration=15s filename=recordings/serialization-overhead-faulty.jfr
```

---

## 4. What to Inspect in JDK Mission Control (JMC)

1. Open `recordings/serialization-overhead-faulty.jfr` in JMC.
2. Navigate to **Method Profiling &rarr; Hot Methods**.
3. Group by **Package**:
   - `com.fasterxml.jackson.databind` and `com.fasterxml.jackson.core` account for >45% of execution samples.
4. Select **Memory &rarr; Allocations**:
   - `byte[]`, `char[]`, and `com.fasterxml.jackson.databind.node.ObjectNode` represent the top allocating classes.

---

## 5. Which MCP Tools to Use

Query the MCP server via your AI assistant:

1. `analyze_cpu(recording="serialization-overhead-faulty.jfr", topN=10)`
2. `analyze_allocation(recording="serialization-overhead-faulty.jfr", topN=5)`

```json
{
  "totalSamples": 9200,
  "topMethods": [
    {
      "method": "com.fasterxml.jackson.databind.ObjectMapper.writeValueAsString()",
      "samples": 2410,
      "percentage": 26.2
    },
    {
      "method": "com.fasterxml.jackson.databind.ObjectMapper.readTree()",
      "samples": 1820,
      "percentage": 19.8
    }
  ]
}
```

---

## 6. What the Evidence Does and Does Not Prove

### What It DOES Prove:
- **Serialization Dominance:** Significant CPU time and allocations are consumed in Jackson parsing and serialization pipelines.

### What It DOES NOT Prove:
- **Jackson Library Bug:** The evidence does not prove Jackson is intrinsically broken; rather, it indicates application-level misuse (e.g. redundant round-trip transformations).

---

## 7. How to Inspect and Correct the Source Code

Open `src/main/java/com/shopsphere/demo/scenario/serialization/SerializationOverheadScenario.java`:

### Faulty Implementation (Multi-Pass Roundtrips)
```java
// Converts DTO to JSON string, parses to JsonNode, maps to intermediate Map, and writes back
public String serializePayload(OrderPayload payload) throws Exception {
    String json1 = objectMapper.writeValueAsString(payload);
    JsonNode node = objectMapper.readTree(json1);
    Map<String, Object> map = objectMapper.convertValue(node, Map.class);
    return objectMapper.writeValueAsString(map); // 4 Jackson passes!
}
```

### Corrected Implementation (Direct Single-Pass Streaming)
```java
// Direct single-pass serialization
public byte[] serializePayload(OrderPayload payload) throws Exception {
    return objectMapper.writeValueAsBytes(payload);
}
```

---

## 8. Comparing Before-and-After Measurements

| Metric | Faulty (Multi-Pass Roundtrip) | Corrected (Single-Pass Direct) | Improvement |
| :--- | :--- | :--- | :--- |
| **Throughput (ops/sec)** | 2,840 ops/s | 34,200 ops/s | **+1,104%** |
| **Serialization CPU Share** | 46.0% | 4.8% | **-89.5%** |
| **Allocation Churn** | 185 MB/s | 12 MB/s | **-93.5%** |
