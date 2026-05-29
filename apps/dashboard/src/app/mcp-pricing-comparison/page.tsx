import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoLandingPage, H2, P, TABLE, TH, TD } from '@/components/landing/SeoLandingPage'

export const metadata: Metadata = {
  title: 'MCP pricing comparison — MCPSpend vs Helicone, Langfuse, PostHog',
  description:
    'Side-by-side: which tools track MCP tool calls, which track only LLM calls, and how pricing compares for an agentic workload.',
  alternates: { canonical: 'https://mcpspend.com/mcp-pricing-comparison' },
}

export default function McpPricingComparisonPage() {
  return (
    <SeoLandingPage
      title="MCP pricing comparison"
      intro={
        <>
          If you&apos;re evaluating tools to observe MCP cost, the decision matrix is which layer they hook into.
          Most existing observability platforms instrument the LLM call — they miss MCP tool calls entirely.
          Here&apos;s the honest comparison.
        </>
      }
      breadcrumb={{ label: 'Compare', href: '/compare' }}
      related={[
        { title: 'Compare full breakdown', href: '/compare', blurb: 'Per-vendor analysis on /compare.' },
        { title: 'MCP cost — full guide', href: '/mcp-cost', blurb: 'Token math + per-server averages.' },
        { title: 'AI expense tracker', href: '/ai-expense-tracker', blurb: 'Per-customer cost attribution.' },
      ]}
    >
      <h2 className={H2}>What each tool actually observes</h2>
      <div className="overflow-x-auto">
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={TH}>Tool</th>
              <th className={TH}>Sees LLM calls</th>
              <th className={TH}>Sees MCP tool calls</th>
              <th className={TH}>Sees per-tool cost</th>
              <th className={TH}>Free tier</th>
              <th className={TH}>Paid entry</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className={TD}><strong>MCPSpend</strong></td><td className={TD}>✓ (via the tool envelope)</td><td className={TD}>✓ every call</td><td className={TD}>✓ native</td><td className={TD}>25K calls/mo</td><td className={TD}>$29 / mo Pro</td></tr>
            <tr><td className={TD}>Helicone</td><td className={TD}>✓ excellent</td><td className={TD}>✗</td><td className={TD}>only LLM-level</td><td className={TD}>10K requests/mo</td><td className={TD}>$25 / mo</td></tr>
            <tr><td className={TD}>Langfuse</td><td className={TD}>✓ traces</td><td className={TD}>only if you instrument every server</td><td className={TD}>only what you push</td><td className={TD}>50K events/mo</td><td className={TD}>$29 / mo</td></tr>
            <tr><td className={TD}>PostHog</td><td className={TD}>via wrappers</td><td className={TD}>only if you push events</td><td className={TD}>only what you wire</td><td className={TD}>1M events/mo</td><td className={TD}>$0 then volume</td></tr>
            <tr><td className={TD}>Portkey</td><td className={TD}>✓ gateway</td><td className={TD}>only if proxied through gateway</td><td className={TD}>LLM-level</td><td className={TD}>10K requests/mo</td><td className={TD}>$49 / mo</td></tr>
            <tr><td className={TD}>Lunary</td><td className={TD}>✓ traces</td><td className={TD}>partial</td><td className={TD}>LLM-level</td><td className={TD}>1K runs/mo</td><td className={TD}>$20 / mo</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className={H2}>The crux: where is your money going?</h2>
      <p className={P}>
        In an agentic workload, the LLM completion is roughly <strong>15-25%</strong> of total token cost. The
        other <strong>75-85%</strong> is MCP tool calls. If your observability tool only sees the LLM layer,
        you&apos;re looking at the small slice and missing the elephant.
      </p>
      <p className={P}>
        Helicone, Lunary, Langfuse, Portkey were all built before MCP existed. They&apos;re excellent at what
        they do — chat completion observability — but tool-call attribution isn&apos;t their model.
      </p>
      <p className={P}>
        PostHog can technically track anything, but you&apos;re building the MCP schema from scratch — there&apos;s
        no out-of-the-box concept of &quot;tool&quot;, &quot;server&quot;, &quot;cost per call&quot;. That&apos;s
        weeks of work and on-going maintenance.
      </p>

      <h2 className={H2}>When to pick which</h2>
      <p className={P}>
        <strong>Pick MCPSpend if</strong>: you run agentic workflows (Cursor Composer, Claude Desktop with MCP
        servers, Windsurf, background agents, OpenAI Agents SDK with MCP). You want a single dashboard showing
        which server / tool / project is burning your tokens, with budgets and alerts. Free 25K/month is
        usually enough.
      </p>
      <p className={P}>
        <strong>Pick Helicone if</strong>: your workload is mostly direct LLM chat completion (no MCP), and you
        want best-in-class LLM-layer dashboards, prompt caching analytics, and routing. Their MCP-layer is not
        a current focus.
      </p>
      <p className={P}>
        <strong>Pick Langfuse if</strong>: you ship LLM features at scale and need traces + evals + a place to
        run offline tests. You can push MCP events from your servers manually but it&apos;s extra work.
      </p>
      <p className={P}>
        <strong>Pick PostHog if</strong>: you already run PostHog for product analytics and want one less
        vendor. Accept that you&apos;ll wire the MCP schema yourself.
      </p>
      <p className={P}>
        <strong>Combine</strong>: MCPSpend + Helicone is a common pairing — MCPSpend on the MCP layer, Helicone
        on the LLM layer. You see both ends of the agent loop.
      </p>

      <h2 className={H2}>Detailed per-vendor comparisons</h2>
      <p className={P}>
        We maintain dedicated comparison pages with deeper breakdowns:
      </p>
      <ul className="grid sm:grid-cols-2 gap-2 mt-3">
        <li><Link href="/compare/helicone" className="text-brand-400 hover:underline">MCPSpend vs Helicone →</Link></li>
        <li><Link href="/compare/langfuse" className="text-brand-400 hover:underline">MCPSpend vs Langfuse →</Link></li>
        <li><Link href="/compare/posthog" className="text-brand-400 hover:underline">MCPSpend vs PostHog →</Link></li>
        <li><Link href="/compare/portkey" className="text-brand-400 hover:underline">MCPSpend vs Portkey →</Link></li>
        <li><Link href="/compare/lunary" className="text-brand-400 hover:underline">MCPSpend vs Lunary →</Link></li>
      </ul>
    </SeoLandingPage>
  )
}
