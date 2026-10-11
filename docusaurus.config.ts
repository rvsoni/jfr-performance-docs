import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const organizationName = process.env.GITHUB_ORG || 'YOUR-GITHUB-USERNAME';
const projectName = process.env.GITHUB_PROJECT || 'jfr-performance-docs';
const url = process.env.SITE_URL || `https://${organizationName}.github.io`;
const baseUrl = process.env.BASE_URL || '/jfr-performance-docs/';

const config: Config = {
  title: 'JFR Performance Lab',
  tagline: 'Evidence-driven JVM performance investigation with JFR, JMC and AI.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url,
  baseUrl,

  organizationName,
  projectName,
  trailingSlash: false,

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'theme-color',
        content: '#0b0f19',
        media: '(prefers-color-scheme: dark)',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'theme-color',
        content: '#0284c7',
        media: '(prefers-color-scheme: light)',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'robots',
        content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      },
    },
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'JFR Performance Lab',
        headline: 'Evidence-driven JVM performance investigation with JFR, JMC and AI',
        description:
          'Open-source developer guides and diagnostic tools connecting Java Flight Recorder (JFR) runtime telemetry and JDK Mission Control (JMC) with AI assistants via Model Context Protocol (MCP).',
        url: `${url}${baseUrl}`,
        inLanguage: 'en-US',
        publisher: {
          '@type': 'Organization',
          name: 'JFR Performance Lab Team',
        },
      }),
    },
  ],

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          showLastUpdateTime: false,
        },
        blog: false,
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.8,
          ignorePatterns: ['/404', '/404.html'],
          filename: 'sitemap.xml',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/jfr-lab-social-card.png',
    metadata: [
      {
        name: 'keywords',
        content:
          'Java, JVM, JFR, Java Flight Recorder, JMC, JDK Mission Control, MCP, Model Context Protocol, Performance Tuning, Profiling, AI Agent, Antigravity, Spring Boot, OpenJDK, Thread Contention, CPU Profiling, Garbage Collection, Stop The World, Latency Optimization',
      },
      {
        name: 'description',
        content:
          'Evidence-driven JVM performance investigation with JFR, JMC and AI. Open-source guides, reproduction scenarios, and MCP diagnostic tools connecting runtime JVM telemetry with AI assistants.',
      },
      {name: 'author', content: 'JFR Performance Lab Team'},
      {property: 'og:site_name', content: 'JFR Performance Lab'},
      {property: 'og:type', content: 'website'},
      {property: 'og:locale', content: 'en_US'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:title', content: 'JFR Performance Lab - Evidence-Driven JVM Performance Investigation'},
      {
        name: 'twitter:description',
        content:
          'Evidence-driven JVM performance investigation with JFR, JMC and AI. Stop asking LLMs to guess—give them measured runtime facts.',
      },
    ],
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'JFR Performance Lab',
      logo: {
        alt: 'JFR Performance Lab Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/docs/scenarios/overview',
          label: 'Demo Lab',
          position: 'left',
        },
        {
          to: '/docs/playbooks/overview',
          label: 'Playbooks',
          position: 'left',
        },
        {
          to: '/docs/mcp/overview',
          label: 'MCP Server',
          position: 'left',
        },
        {
          to: '/docs/architecture',
          label: 'Architecture',
          position: 'left',
        },
        {
          href: `https://github.com/${organizationName}/jfr-performance-mcp`,
          label: 'MCP Repo',
          position: 'right',
        },
        {
          href: `https://github.com/${organizationName}/jfr-performance-demo-app`,
          label: 'Demo App Repo',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Getting Started',
          items: [
            {
              label: 'Introduction & Setup',
              to: '/docs/getting-started/quickstart',
            },
            {
              label: 'Prerequisites Guide',
              to: '/docs/getting-started/prerequisites',
            },
            {
              label: 'System Architecture',
              to: '/docs/architecture',
            },
          ],
        },
        {
          title: 'Demo Lab & Playbooks',
          items: [
            {
              label: 'Scenario Catalog',
              to: '/docs/scenarios/overview',
            },
            {
              label: 'CPU Hotspot Guide',
              to: '/docs/scenarios/cpu-hotspot',
            },
            {
              label: 'Thread Contention Guide',
              to: '/docs/scenarios/thread-contention',
            },
            {
              label: 'Investigation Playbooks',
              to: '/docs/playbooks/overview',
            },
          ],
        },
        {
          title: 'MCP Server',
          items: [
            {
              label: 'Server Architecture',
              to: '/docs/mcp/overview',
            },
            {
              label: '11 MCP Tools Reference',
              to: '/docs/mcp/tools-reference',
            },
            {
              label: 'Antigravity Setup',
              to: '/docs/mcp/client-setup',
            },
            {
              label: 'Evidence & Limitations',
              to: '/docs/mcp/evidence-model',
            },
          ],
        },
        {
          title: 'Community & Reference',
          items: [
            {
              label: 'Contributing Guide',
              to: '/docs/contributing',
            },
            {
              label: 'External Reference Links',
              to: '/docs/reference',
            },
            {
              label: 'jfr-performance-mcp GitHub',
              href: `https://github.com/${organizationName}/jfr-performance-mcp`,
            },
            {
              label: 'jfr-performance-demo-app GitHub',
              href: `https://github.com/${organizationName}/jfr-performance-demo-app`,
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} JFR Performance Lab. Open source under Apache 2.0. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java', 'bash', 'json', 'yaml', 'diff', 'properties'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
