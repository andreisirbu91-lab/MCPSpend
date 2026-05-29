/**
 * Schema.org JSON-LD blocks rendered into the homepage. Google reads these
 * to identify the entity (Organization), the product (SoftwareApplication),
 * and the searchable site (WebSite). Strong structured-data signals lift the
 * domain's perceived authority on niche queries like "mcp cost", "cursor mcp
 * expense" — exactly the ones GSC shows us ranking 30-80 on right now.
 *
 * Embedded as a single <script type="application/ld+json"> to keep the DOM
 * payload tiny.
 */

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MCPSpend',
    legalName: 'NEW RZS SRL',
    url: 'https://mcpspend.com',
    logo: 'https://mcpspend.com/logo.png',
    foundingDate: '2026',
    founders: [{ '@type': 'Person', name: 'Andrei Sirbu' }],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Str. Gliei nr. 34-38, corp B',
      addressLocality: 'Bragadiru',
      addressRegion: 'Ilfov',
      postalCode: '077025',
      addressCountry: 'RO',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@mcpspend.com',
      contactType: 'customer support',
    },
    sameAs: [
      'https://github.com/andreisirbu91-lab/MCPSpend',
      'https://www.npmjs.com/package/@mcpspend/proxy',
      'https://smithery.ai/servers/andreisirbu91-lab/mcpspend',
      'https://glama.ai/mcp/servers/andreisirbu91-lab/MCPSpend',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MCPSpend',
    url: 'https://mcpspend.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://mcpspend.com/blog?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MCPSpend',
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'AI cost observability',
    operatingSystem: 'macOS, Windows, Linux',
    description:
      'Real-time cost observability for MCP tool calls. Transparent proxy that wraps every MCP server, attributes spend per tool, per project, per end-customer.',
    url: 'https://mcpspend.com',
    softwareVersion: '0.7.1',
    license: 'https://opensource.org/licenses/MIT',
    offers: [
      { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD', description: 'Up to 25,000 tool calls per month' },
      { '@type': 'Offer', name: 'Pro', price: '29', priceCurrency: 'USD', description: 'Up to 500,000 tool calls per month' },
      { '@type': 'Offer', name: 'Team', price: '99', priceCurrency: 'USD', description: 'Up to 2,500,000 tool calls per month' },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '12',
      bestRating: '5',
    },
    publisher: { '@type': 'Organization', name: 'NEW RZS SRL' },
  },
]

export function SchemaJsonLd() {
  return (
    <script
      type="application/ld+json"
      // The combined array is valid JSON-LD; Google picks each block.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
    />
  )
}
