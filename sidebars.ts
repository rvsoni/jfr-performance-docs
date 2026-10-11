import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/quickstart',
        'getting-started/prerequisites',
      ],
    },
    {
      type: 'category',
      label: 'JFR Performance MCP',
      collapsed: false,
      items: [
        'mcp/overview',
        'mcp/installation',
        'mcp/configuration',
        'mcp/client-setup',
        'mcp/tools-reference',
        'mcp/evidence-model',
        'mcp/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Demo Lab Scenarios',
      collapsed: false,
      items: [
        'scenarios/overview',
        'scenarios/cpu-hotspot',
        'scenarios/thread-contention',
        'scenarios/allocation-and-gc',
        'scenarios/thread-pool-starvation',
        'scenarios/slow-io',
        'scenarios/exception-storm',
        'scenarios/serialization-overhead',
        'scenarios/other-scenarios',
      ],
    },
    {
      type: 'category',
      label: 'Investigation Playbooks',
      collapsed: false,
      items: [
        'playbooks/overview',
        'playbooks/cpu-playbook',
        'playbooks/lock-contention-playbook',
        'playbooks/memory-gc-playbook',
        'playbooks/blocked-vs-cpu-playbook',
        'playbooks/before-after-validation',
      ],
    },
    {
      type: 'doc',
      id: 'architecture',
      label: 'Architecture',
    },
    {
      type: 'doc',
      id: 'reference',
      label: 'Reference',
    },
    {
      type: 'doc',
      id: 'contributing',
      label: 'Contributing',
    },
  ],
};

export default sidebars;
