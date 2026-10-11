import React, { type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Heading from '@theme/Heading';

import styles from './index.module.css';

interface ScenarioFeature {
  id: string;
  title: string;
  event: string;
  description: string;
  link: string;
  badge: string;
  badgeClass: string;
}

const FEATURED_SCENARIOS: ScenarioFeature[] = [
  {
    id: 'cpu-hotspot',
    title: 'CPU Hotspot',
    event: 'jdk.ExecutionSample',
    description: 'Redundant polynomial discount calculations consume CPU cycles in pricing calculation.',
    link: '/docs/scenarios/cpu-hotspot',
    badge: 'CPU',
    badgeClass: 'badge-blue',
  },
  {
    id: 'thread-contention',
    title: 'Thread Contention',
    event: 'jdk.JavaMonitorEnter',
    description: 'Coarse synchronized lock on shared inventory causes severe thread serialization.',
    link: '/docs/scenarios/thread-contention',
    badge: 'Locks',
    badgeClass: 'badge-purple',
  },
  {
    id: 'allocation-pressure',
    title: 'Allocation & GC Pressure',
    event: 'jdk.ObjectAllocationSample',
    description: 'Intermediate map and string allocations trigger excessive Eden churn and GC pauses.',
    link: '/docs/scenarios/allocation-and-gc',
    badge: 'Memory',
    badgeClass: 'badge-green',
  },
  {
    id: 'thread-pool-starvation',
    title: 'Thread Pool Starvation',
    event: 'jdk.ThreadPark',
    description: 'Undersized executor queues cause worker starvation and latency spikes.',
    link: '/docs/scenarios/thread-pool-starvation',
    badge: 'Threads',
    badgeClass: 'badge-amber',
  },
  {
    id: 'slow-io',
    title: 'Slow Downstream I/O',
    event: 'jdk.ThreadPark (Low CPU)',
    description: 'Network delays from downstream payment APIs without consuming JVM CPU.',
    link: '/docs/scenarios/slow-io',
    badge: 'I/O',
    badgeClass: 'badge-blue',
  },
  {
    id: 'exception-storm',
    title: 'Exception Storm',
    event: 'jdk.JavaExceptionThrow',
    description: 'Using exceptions for normal validation control flow inflates stack trace costs.',
    link: '/docs/scenarios/exception-storm',
    badge: 'Runtime',
    badgeClass: 'badge-purple',
  },
];

function HeroBanner(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const orgName = (siteConfig.customFields?.organizationName as string) || 'rvsoni';

  return (
    <header className={styles.heroSection}>
      <div className="container">
        <div className={styles.heroTaglinePill}>
          <span>JVM Runtime Telemetry + Model Context Protocol</span>
        </div>
        <Heading as="h1" className={styles.heroTitle}>
          JFR Performance <span className={styles.heroGradientText}>Lab</span>
        </Heading>
        <p className={styles.heroSubtitle}>
          Evidence-driven JVM performance investigation with JFR, JMC and AI.
          Stop asking LLMs to guess why production JVMs are slow—give them measured runtime facts.
        </p>

        <div className={styles.ctaGroup}>
          <Link className="button button--primary button--lg" to="/docs/getting-started/quickstart">
            Get Started in 5 Minutes
          </Link>
          <Link className="button button--secondary button--lg" to="/docs/scenarios/overview">
            Explore Demo Lab Scenarios
          </Link>
          <Link className="button button--outline button--secondary button--lg" to="/docs/architecture">
            System Architecture
          </Link>
        </div>

        <div className={styles.repoButtonsGroup}>
          <a
            href={`https://github.com/${orgName}/jfr-performance-mcp`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.repoBtn}
          >
            <span>📦</span>
            <strong>jfr-performance-mcp</strong>
            <span className="badge badge--secondary">Java MCP Server</span>
          </a>
          <a
            href={`https://github.com/${orgName}/jfr-performance-demo-app`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.repoBtn}
          >
            <span>🚀</span>
            <strong>jfr-performance-demo-app</strong>
            <span className="badge badge--secondary">Spring Boot Demo</span>
          </a>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const canonicalUrl = `${siteConfig.url}${siteConfig.baseUrl}`;
  const socialImageUrl = `${canonicalUrl}img/jfr-lab-social-card.png`;

  return (
    <Layout
      title="Evidence-Driven JVM Performance Investigation with JFR, JMC and AI"
      description="JFR Performance Lab pairs Java Flight Recorder (JFR) runtime telemetry and JDK Mission Control (JMC) with Model Context Protocol (MCP) to power AI-assisted JVM diagnostics."
    >
      <Head>
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="JFR Performance Lab | JVM Diagnostics with JFR & AI" />
        <meta
          property="og:description"
          content="Stop asking LLMs to guess why production JVMs are slow. Empower AI assistants with measured runtime facts from Java Flight Recorder via Model Context Protocol."
        />
        <meta property="og:image" content={socialImageUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={socialImageUrl} />
      </Head>
      <HeroBanner />
      <main>
        {/* Core Triad Section */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <Heading as="h2">Why JFR, JMC and MCP Work Together</Heading>
              <p>
                Bridging low-overhead JVM diagnostic profiling with AI reasoning models using structured runtime facts.
              </p>
            </div>

            <div className={styles.triadGrid}>
              <div className={styles.triadCard}>
                <span className="badge-pill badge-blue triadBadge">Runtime Telemetry</span>
                <Heading as="h3">Java Flight Recorder (JFR)</Heading>
                <p>
                  Built into OpenJDK with sub-1% production overhead. Records exact hardware thread samples,
                  lock contention timelines, memory allocation churn, and GC pauses directly inside the JVM kernel.
                </p>
                <ul style={{ paddingLeft: '1.2rem', marginTop: 'auto', fontSize: '0.9rem' }}>
                  <li>Continuous ring-buffer in-memory capture</li>
                  <li>Zero external agent or bytecode instrumentation</li>
                  <li>Deterministic, nanosecond-precision event timestamps</li>
                </ul>
              </div>

              <div className={styles.triadCard}>
                <span className="badge-pill badge-purple triadBadge">Visual Workbench</span>
                <Heading as="h3">JDK Mission Control (JMC)</Heading>
                <p>
                  The authoritative desktop interface for inspecting JVM flight recordings. Provides call trees,
                  method flame graphs, lock duration scatter plots, and memory consumption timelines for human verification.
                </p>
                <ul style={{ paddingLeft: '1.2rem', marginTop: 'auto', fontSize: '0.9rem' }}>
                  <li>Visual verification of hotspot methods</li>
                  <li>Thread timeline and blocking dependencies</li>
                  <li>Independent ground-truth cross-check</li>
                </ul>
              </div>

              <div className={styles.triadCard}>
                <span className="badge-pill badge-green triadBadge">AI Reasoning Layer</span>
                <Heading as="h3">JFR Performance MCP</Heading>
                <p>
                  Exposes 11 specialized diagnostic tools over the Model Context Protocol (MCP). Extracts verified
                  measurements from <code>.jfr</code> files and presents them to AI assistants with calibrated confidence.
                </p>
                <ul style={{ paddingLeft: '1.2rem', marginTop: 'auto', fontSize: '0.9rem' }}>
                  <li>Strict separation of facts vs. hypotheses</li>
                  <li>Directory-confined safe read-only execution</li>
                  <li>Direct integration with Google Antigravity & IDEs</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section className={styles.sectionAlt}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <Heading as="h2">The Evidence-Driven Workflow</Heading>
              <p>
                A systematic 4-step path from symptom reproduction to validated code correction.
              </p>
            </div>

            <div className={styles.workflowGrid}>
              <div className={styles.workflowStep}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepIcon}>⚙️</div>
                <Heading as="h3">Trigger Workload</Heading>
                <p>
                  Launch a controlled scenario from <code>jfr-performance-demo-app</code> with bounded duration,
                  deterministic concurrency, and safety guards.
                </p>
              </div>

              <div className={styles.workflowStep}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepIcon}>📊</div>
                <Heading as="h3">Capture JFR Recording</Heading>
                <p>
                  Stream execution samples, lock events, and GC pauses directly to a <code>.jfr</code> artifact
                  via automated runner script or <code>jcmd</code>.
                </p>
              </div>

              <div className={styles.workflowStep}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepIcon}>🤖</div>
                <Heading as="h3">Analyze via MCP</Heading>
                <p>
                  Ask your AI assistant to triage the recording. The MCP server computes hotspot methods,
                  evaluates contention, and reports structured findings.
                </p>
              </div>

              <div className={styles.workflowStep}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepIcon}>✅</div>
                <Heading as="h3">Validate the Fix</Heading>
                <p>
                  Apply the optimized code pattern, capture a comparison recording, and quantitatively prove
                  latency and throughput gains.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Scenarios */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <Heading as="h2">Featured Performance Investigations</Heading>
              <p>
                Hands-on investigation guides based on production anti-patterns with exact reproduction steps.
              </p>
            </div>

            <div className={styles.scenariosGrid}>
              {FEATURED_SCENARIOS.map((item) => (
                <Link key={item.id} to={item.link} className={styles.scenarioCard}>
                  <div className={styles.scenarioHeader}>
                    <Heading as="h3" className={styles.scenarioTitle}>
                      {item.title}
                    </Heading>
                    <span className={`badge-pill ${item.badgeClass}`}>{item.badge}</span>
                  </div>
                  <code className={styles.scenarioEvent}>{item.event}</code>
                  <p>{item.description}</p>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ifm-color-primary)', marginTop: 'auto' }}>
                    View Playbook &rarr;
                  </span>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link className="button button--secondary" to="/docs/scenarios/overview">
                View All 10 Lab Scenarios &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Quickstart Terminal Preview */}
        <section className={styles.sectionAlt}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <Heading as="h2">Quick-Start Preview</Heading>
              <p>Run a complete investigation cycle in three shell commands.</p>
            </div>

            <div className={styles.quickstartTerminal}>
              <div className={styles.terminalHeader}>
                <span className={`${styles.terminalDot} ${styles.dotRed}`} />
                <span className={`${styles.terminalDot} ${styles.dotYellow}`} />
                <span className={`${styles.terminalDot} ${styles.dotGreen}`} />
                <span className={styles.terminalTitle}>bash — terminal</span>
              </div>
              <div className={styles.terminalBody}>
                <div><span className={styles.termComment}># 1. Run controlled CPU Hotspot scenario (15s duration, 8 threads)</span></div>
                <div><span className={styles.termCommand}>cd jfr-performance-demo-app &amp;&amp; ./scripts/run-demo.sh cpu-hotspot 15 8</span></div>
                <br />
                <div><span className={styles.termComment}># 2. Start MCP server in standalone diagnostic mode to verify recording</span></div>
                <div><span className={styles.termCommand}>cd ../jfr-performance-mcp &amp;&amp; ./scripts/run.sh --analyze ../jfr-performance-demo-app/recordings/cpu-hotspot-faulty.jfr</span></div>
                <br />
                <div><span className={styles.termComment}># 3. Connect Antigravity IDE and prompt your AI assistant</span></div>
                <div style={{ color: '#7ee787' }}>
                  &gt; &quot;Analyze recordings/cpu-hotspot-faulty.jfr. Identify dominant CPU methods, distinguish sample percentage from continuous CPU time, and recommend source code improvements.&quot;
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link className="button button--primary button--lg" to="/docs/getting-started/quickstart">
                Read Full Step-by-Step Tutorial
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
