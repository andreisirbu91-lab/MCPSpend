import Link from 'next/link'

// Internal-linking block surfaced from the homepage so Google crawls every
// SEO landing page within one click of the root. Each topic targets a specific
// GSC query we already rank for (page 30-80) and want to push to page 1-2.
const TOPICS: Array<{ title: string; href: string; blurb: string }> = [
  { title: 'MCP cost — the complete guide', href: '/mcp-cost', blurb: 'What an MCP tool call actually costs and how to control it.' },
  { title: 'Cursor MCP cost tracking', href: '/cursor-mcp-cost', blurb: 'Why Cursor users see Anthropic bills jump 3-5× without warning — and what to do.' },
  { title: 'Claude Desktop cost tracking', href: '/claude-desktop-mcp-cost', blurb: 'Per-server, per-tool spend visibility for Claude Desktop power users.' },
  { title: 'ChatGPT MCP cost tracking', href: '/chatgpt-mcp-cost', blurb: 'Tracking MCP tool spend when your agent uses OpenAI models.' },
  { title: 'MCP pricing comparison', href: '/mcp-pricing-comparison', blurb: 'MCPSpend vs. Helicone, Langfuse, PostHog — what each one tracks (and misses).' },
  { title: 'AI expense tracker for MCP', href: '/ai-expense-tracker', blurb: 'Per-customer, per-project AI cost attribution at the tool-call layer.' },
  { title: 'MCP for budgeting', href: '/use-cases/mcp-budgeting', blurb: 'Set monthly budgets per agent, get alerts before you overrun.' },
  { title: 'MCP for procurement', href: '/use-cases/mcp-procurement', blurb: 'What procurement teams need to know before signing AI agent contracts.' },
  { title: 'Enterprise MCP pricing', href: '/enterprise', blurb: 'Volume pricing, SLA, DPA, audit log retention for larger teams.' },
]

export function TopicLinks() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tight">Explore by topic</h2>
        <p className="mt-3 text-gray-400 text-sm max-w-2xl mx-auto">
          Specific cost-tracking guides per IDE, model provider, and team use case.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOPICS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-brand-500/30 transition-colors p-5"
          >
            <h3 className="text-white font-semibold group-hover:text-brand-300 transition-colors">{t.title}</h3>
            <p className="text-sm text-gray-400 mt-1.5">{t.blurb}</p>
            <span className="text-xs text-brand-400 mt-3 inline-block">Read →</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
