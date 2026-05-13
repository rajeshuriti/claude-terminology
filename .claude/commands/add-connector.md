Add a new connector to `src/data/connectorsData.ts`. The user will provide the connector name and details.

## Shape to add

Append a new `ConnectorData` object to the `connectors` array:

```ts
{
  id: 'kebab-case-id',
  name: 'Display Name',
  category: ConnectorCategory,   // one of: 'productivity' | 'development' | 'data' | 'cloud' | 'crm' | 'communication' | 'security' | 'analytics'
  emoji: '🔧',
  tagline: 'One-line value proposition.',
  whatItIs: 'What the system is and what the connector provides access to.',
  whyItExists: 'The business/engineering problem it solves.',
  claudeCapabilities: [
    'Capability 1',
    'Capability 2',
    // 5-8 items
  ],
  useCases: [
    {
      title: 'Use Case Title',
      scenario: 'Realistic enterprise scenario description.',
      workflow: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
      outcome: 'Quantified or specific outcome.',
      industry: 'Industry name',
    },
  ],
  analogy: 'One-sentence analogy starting with "Like..."',
  analogyDetail: 'Two-sentence expansion of why the analogy holds.',
  internals: {
    authentication: 'Auth mechanism.',
    permissions: 'Scoping and least-privilege approach.',
    dataFlow: 'How data moves between Claude and the system.',
    rateLimits: 'Rate limit details and handling strategy.',
    securityConsiderations: 'Key security risks and mitigations.',
    mcpFlow: 'How the MCP tool call sequence works end-to-end.',
  },
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'enterprise',
  enterpriseReady: true | false,
  securityLevel: 'low' | 'medium' | 'high' | 'critical',
  relatedConnectors: ['id1', 'id2'],   // IDs of related connectors already in the array
  tags: ['tag1', 'tag2'],
}
```

## After adding

Run `npx tsc --noEmit` from `learning-platform/` and confirm zero errors. The new connector will automatically appear in the Connector Library tab of ConnectorsPage.
