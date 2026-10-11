# JFR Performance Lab Documentation Website

> **Evidence-driven JVM performance investigation with JFR, JMC and AI.**

This repository hosts the official documentation website for the **JFR Performance Lab** ecosystem, which comprises two companion open-source projects:

1. [`jfr-performance-mcp`](https://github.com/YOUR-GITHUB-USERNAME/jfr-performance-mcp) — A Java 21 MCP server exposing 11 structured JVM performance diagnostic tools to AI assistants.
2. [`jfr-performance-demo-app`](https://github.com/YOUR-GITHUB-USERNAME/jfr-performance-demo-app) — A Spring Boot application providing 10 reproducible, safe JVM performance anti-patterns and controlled `.jfr` captures.

The documentation website guides Java engineers and SREs from initial installation to diagnosing production bottlenecks and quantitatively validating fixes.

---

## 🛠️ Technology Stack

- **Framework:** [Docusaurus 3](https://docusaurus.io/) (Classic Preset)
- **Language:** TypeScript
- **Diagrams:** Native Mermaid diagram integration (`@docusaurus/theme-mermaid`)
- **Hosting:** GitHub Pages
- **Continuous Integration & Deployment:** GitHub Actions (`.github/workflows/deploy.yml`)

---

## 🚀 Local Development

### Prerequisites
- **Node.js:** Version `20.0.0` or newer (LTS recommended)
- **npm:** Version `10.0.0` or newer
- **Git:** Version `2.30+`

*(Note: Java 21, Maven, and JMC are only needed to run the companion demo application and MCP server, not to build this documentation site).*

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Live Development Server
```bash
npm start
```
By default, the development server runs at:
```text
http://localhost:3000/jfr-performance-docs/
```
Changes to markdown files and CSS are hot-reloaded automatically.

### 3. Build Production Bundle
To validate all TypeScript types, MDX syntax, and internal hyperlinks:
```bash
npm run build
```
The output static bundle is generated in the `build/` directory.

### 4. Preview Production Build Locally
```bash
npm run serve
```

---

## 🌐 GitHub Pages Deployment Setup

The website is configured to deploy as a GitHub Pages project site:
`https://YOUR-GITHUB-USERNAME.github.io/jfr-performance-docs/`

### 1. Required Repository Settings in GitHub
Before your first push to `main`:
1. In your GitHub repository, navigate to **Settings &rarr; Pages**.
2. Under **Build and deployment &rarr; Source**, select **GitHub Actions**.
3. Under **Branch**, leave it unmanaged (GitHub Actions handles deployment directly).

### 2. Automated CI/CD Workflow
The included `.github/workflows/deploy.yml` workflow:
- **Pull Requests:** Validates the full Docusaurus build and broken link integrity without publishing changes.
- **Pushes to `main`:** Automatically compiles static assets and deploys them to GitHub Pages with least-privilege tokens (`pages: write`, `id-token: write`).

### 3. Configuring a Custom Domain (Optional)
If you wish to point a custom domain (e.g., `jfr-lab.example.com`) to the site:
1. In `docusaurus.config.ts`, set `url: 'https://jfr-lab.example.com'` and `baseUrl: '/'` (or export environment variables `SITE_URL` and `BASE_URL`).
2. Add a `CNAME` file in the `static/` directory containing your domain:
   ```text
   jfr-lab.example.com
   ```
3. Configure your DNS provider with a `CNAME` record pointing to `<YOUR-GITHUB-USERNAME>.github.io`.

---

## 📂 Documentation Structure

```text
docs/
├── architecture.md               # End-to-end system and developer workflow diagrams
├── contributing.md               # Contribution workflow and guidelines
├── reference.md                  # Curated authoritative external links
├── getting-started/
│   ├── prerequisites.md          # Runtime vs website dependencies
│   └── quickstart.md             # 5-minute walkthrough from symptom to fix
├── mcp/
│   ├── overview.md               # MCP server architecture and three-layer design
│   ├── installation.md           # Build scripts and standalone CLI mode
│   ├── configuration.md          # Security boundaries and STDIO transport isolation
│   ├── client-setup.md           # Antigravity, Claude Desktop, Cursor, and VS Code
│   ├── tools-reference.md        # Reference for all 11 MCP diagnostic tools
│   ├── evidence-model.md         # Facts vs findings, confidence, and limitations
│   └── troubleshooting.md        # Error codes and resolution steps
├── playbooks/
│   ├── overview.md               # Scientific triage cycle and AI prompt guidelines
│   ├── cpu-playbook.md           # Diagnosing algorithmic CPU hotspots
│   ├── lock-contention-playbook.md # Diagnosing synchronized monitor contention
│   ├── memory-gc-playbook.md     # Distinguishing allocation churn from memory leaks
│   ├── blocked-vs-cpu-playbook.md # Classifying compute-bound vs off-CPU wait states
│   └── before-after-validation.md # Validating fixes and regression prevention
└── scenarios/
    ├── overview.md               # Catalog of 10 reproducible performance scenarios
    ├── cpu-hotspot.md            # Polynomial discount calculation
    ├── thread-contention.md      # Coarse monitor locking
    ├── allocation-and-gc.md      # Intermediate collections and buffer churn
    ├── thread-pool-starvation.md # Undersized worker pool queue starvation
    ├── slow-io.md                # Downstream blocking I/O with low CPU
    ├── exception-storm.md        # Exceptions used for validation control flow
    ├── serialization-overhead.md # Redundant Jackson JSON roundtrips
    └── other-scenarios.md        # Lock & I/O and JVM heap sizing variations
```

---

## 📄 License

- `jfr-performance-mcp` is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
- This documentation repository is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
