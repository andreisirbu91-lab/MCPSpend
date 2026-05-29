import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoLandingPage, H2, H3, P, UL, TABLE, TH, TD, CODE } from '@/components/landing/SeoLandingPage'

export const metadata: Metadata = {
  title: 'MCP cost — what a tool call actually costs (2026 guide)',
  description:
    'How MCP tool calls accumulate cost: token-by-token breakdown, per-server averages from real telemetry, and what to optimize first. Free calculator + tracker.',
  alternates: { canonical: 'https://mcpspend.com/mcp-cost' },
  openGraph: {
    title: 'MCP cost — what a tool call actually costs',
    description: 'Per-tool token averages from real MCPSpend telemetry. Find your most expensive servers.',
    url: 'https://mcpspend.com/mcp-cost',
  },
}

export default function MCPCostPage() {
  return (
    <SeoLandingPage
      title="MCP cost: what a tool call actually costs"
      intro={
        <>
          A single user prompt to an agentic IDE like Cursor or Windsurf can trigger 30-80 MCP tool calls in the
          background. Each one pulls tokens — and tokens are billed. This guide breaks down where the money goes,
          based on telemetry from real MCPSpend users.
        </>
      }
      related={[
        { title: 'Cursor MCP cost', href: '/cursor-mcp-cost', blurb: 'IDE-specific patterns and how to cap spend.' },
        { title: 'Pricing comparison', href: '/mcp-pricing-comparison', blurb: 'How MCPSpend differs from Helicone, Langfuse, PostHog.' },
        { title: 'Try the calculator', href: '/calculator', blurb: 'Estimate your monthly bill in 30 seconds.' },
      ]}
    >
      <h2 className={H2}>The cost equation</h2>
      <p className={P}>
        Every MCP tool call has two cost dimensions: the <strong>input tokens</strong> the model sends to the
        server (the tool arguments + context) and the <strong>output tokens</strong> the server returns. Both
        are billed by the LLM provider. The formula:
      </p>
      <pre className="bg-gray-950 border border-white/5 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-200">
{`cost_usd = (input_tokens / 1_000_000) * input_rate
         + (output_tokens / 1_000_000) * output_rate`}
      </pre>
      <p className={P}>
        With Claude Sonnet 4.6 — the most common model in agentic workflows — rates are{' '}
        <code className={CODE}>$3 / M input</code> and <code className={CODE}>$15 / M output</code>. A single{' '}
        Playwright <code className={CODE}>browser_snapshot</code> call that returns a 15K-token DOM payload
        therefore costs about{' '}
        <strong>{(15000 / 1_000_000 * 15).toFixed(3)} USD</strong> just for the output, and a couple more cents
        for the round-trip context.
      </p>

      <h2 className={H2}>Per-server averages (real telemetry)</h2>
      <p className={P}>
        These averages come from anonymized aggregated data across MCPSpend users. Heavy users see more,
        lighter users less — but the <em>relative</em> ranking is stable across every account we&apos;ve looked at.
      </p>
      <div className="overflow-x-auto">
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={TH}>Server</th>
              <th className={TH}>Avg input tokens / call</th>
              <th className={TH}>Avg output tokens / call</th>
              <th className={TH}>Typical % of monthly spend</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className={TD}>playwright (browser tools)</td><td className={TD}>2,000</td><td className={TD}>12,000</td><td className={TD}>40-60%</td></tr>
            <tr><td className={TD}>fetch / read-url</td><td className={TD}>300</td><td className={TD}>8,000</td><td className={TD}>15-25%</td></tr>
            <tr><td className={TD}>filesystem (read_file)</td><td className={TD}>300</td><td className={TD}>4,000</td><td className={TD}>10-15%</td></tr>
            <tr><td className={TD}>github (diff/issues)</td><td className={TD}>500</td><td className={TD}>6,000</td><td className={TD}>5-10%</td></tr>
            <tr><td className={TD}>brave-search / web-search</td><td className={TD}>300</td><td className={TD}>3,000</td><td className={TD}>5-10%</td></tr>
            <tr><td className={TD}>postgres / database</td><td className={TD}>400</td><td className={TD}>2,500</td><td className={TD}>3-8%</td></tr>
            <tr><td className={TD}>slack / linear / notion</td><td className={TD}>500</td><td className={TD}>1,500</td><td className={TD}>2-5%</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className={H2}>Why browser tools dominate</h2>
      <p className={P}>
        Playwright and Windsurf&apos;s <code className={CODE}>cascade-browser</code> return full DOM snapshots
        of every page the agent visits. Modern web pages are dense — a single React-rendered SaaS dashboard can
        push 20-30K tokens into the context window per snapshot.
      </p>
      <p className={P}>
        Multiply by the 5-10 page navigations a typical research task involves, and one task can run{' '}
        <strong>$0.50-$2.00</strong> just on browser tools. Most users have no idea this is happening because
        provider invoices show only the aggregate.
      </p>

      <h2 className={H2}>What to optimize, in order</h2>
      <ol className={`${UL.replace('disc', 'decimal')}`}>
        <li>
          <strong>Cap Playwright DOM payloads.</strong> Most Playwright MCP servers accept a{' '}
          <code className={CODE}>--max-bytes</code> flag (or equivalent). 8KB is usually enough for navigation
          decisions; the agent rarely needs the whole DOM.
        </li>
        <li>
          <strong>Disable browser MCPs for non-browsing tasks.</strong> If the agent isn&apos;t actively scraping or
          interacting with a webpage, the browser server shouldn&apos;t be loaded. Toggle it on per-task.
        </li>
        <li>
          <strong>Cache <code className={CODE}>fetch</code> responses.</strong> Reading the same URL twice in a
          conversation is wasteful. A simple in-memory LRU layer on top of fetch cuts repeat costs by 30-40%.
        </li>
        <li>
          <strong>Switch to Haiku for routine work.</strong> Claude Haiku 4.5 is{' '}
          <code className={CODE}>$0.80 / $4 per M</code> — that&apos;s ~4× cheaper than Sonnet. For
          file-reading, search, and routing tasks, Haiku is more than enough.
        </li>
        <li>
          <strong>Set per-agent budgets.</strong> Background agents (CI jobs, scheduled scrapers) can run away —
          a budget alert at 80% saves you from a surprise bill.
        </li>
      </ol>

      <h2 className={H2}>How MCPSpend measures this</h2>
      <p className={P}>
        We&apos;re a transparent stdio proxy. Your MCP client (Claude Desktop, Cursor, Windsurf, VS Code,
        Claude Code) launches us as a subprocess; we launch your real MCP server as <em>our</em> subprocess,
        and pipe stdin/stdout between them unchanged. Every JSON-RPC frame is observed as it flows. Each
        tool-call request is timestamped; the matching response gives us the latency and the byte counts. Cost
        is computed using public provider rates.
      </p>
      <p className={P}>
        We never read tool <em>arguments</em> or tool <em>responses</em> — only the envelope (server name, tool
        name, timing, byte counts). Source is MIT-licensed at{' '}
        <a href="https://github.com/andreisirbu91-lab/MCPSpend" className="text-brand-400 hover:underline">github.com/andreisirbu91-lab/MCPSpend</a>{' '}
        and you can audit the ingest payload yourself.
      </p>

      <h2 className={H2}>Estimate your bill in 30 seconds</h2>
      <p className={P}>
        The <Link href="/calculator" className="text-brand-400 hover:underline">free calculator</Link> takes your
        active agent hours and the MCP servers you use, then projects monthly spend using these real averages.
        No signup, no email.
      </p>
      <p className={P}>
        Or install the proxy for exact numbers from your actual traffic:
      </p>
      <pre className="bg-gray-950 border border-white/5 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-200">
        npx --yes @mcpspend/proxy@latest init --key mcps_live_xxx
      </pre>
      <p className={P}>
        25,000 tool calls per month on the free tier. No card.{' '}
        <Link href="/register" className="text-brand-400 hover:underline">Generate your key →</Link>
      </p>
    </SeoLandingPage>
  )
}
