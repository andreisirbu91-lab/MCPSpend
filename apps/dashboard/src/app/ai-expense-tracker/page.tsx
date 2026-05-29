import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoLandingPage, H2, P, UL, OL, CODE } from '@/components/landing/SeoLandingPage'

export const metadata: Metadata = {
  title: 'AI expense tracker for MCP — per-customer, per-project cost attribution',
  description:
    'Track AI agent spend at the tool-call layer. Attribute cost per customer, per project, per agent session. Built for teams shipping AI to production.',
  alternates: { canonical: 'https://mcpspend.com/ai-expense-tracker' },
}

export default function AiExpenseTrackerPage() {
  return (
    <SeoLandingPage
      title="AI expense tracker for MCP"
      intro={
        <>
          If your product calls AI agents on behalf of customers, you need to know which customer cost you how
          much. MCPSpend is an AI expense tracker built around the MCP tool-call as the unit of attribution.
        </>
      }
      related={[
        { title: 'MCP for budgeting', href: '/use-cases/mcp-budgeting', blurb: 'Set budgets per agent / project.' },
        { title: 'Enterprise pricing', href: '/enterprise', blurb: 'Volume tiers + SLA.' },
        { title: 'MCP cost — full guide', href: '/mcp-cost', blurb: 'How tool calls turn into dollars.' },
      ]}
    >
      <h2 className={H2}>Why per-tool-call attribution beats per-LLM-call</h2>
      <p className={P}>
        LLM observability tools (Helicone, Langfuse) track the chat completion. In an agentic workload, the
        chat completion is 15-25% of total cost. The other 75-85% is MCP tool calls — and they&apos;re what
        actually varies between customers.
      </p>
      <p className={P}>
        Customer A asks: <em>&quot;What&apos;s in this CSV?&quot;</em> — one filesystem call, one chat completion. ~$0.02 total.
      </p>
      <p className={P}>
        Customer B asks: <em>&quot;Audit our entire codebase for security issues.&quot;</em> — 80 filesystem reads,
        15 github calls, 5 web searches, 10 LLM round trips. ~$1.80 total.
      </p>
      <p className={P}>
        Same product, 90× cost difference. You can&apos;t see that on an Anthropic invoice. You can&apos;t see it
        with LLM-only observability. You need per-tool-call attribution.
      </p>

      <h2 className={H2}>How attribution works in MCPSpend</h2>
      <p className={P}>
        Every tool call carries three identifiers we can index on:
      </p>
      <ul className={UL}>
        <li><strong>Project ID</strong> — tag the proxy with <code className={CODE}>MCPSPEND_PROJECT_ID=customer_acme</code></li>
        <li><strong>Agent name</strong> — tag with <code className={CODE}>MCPSPEND_AGENT_NAME=onboarding_bot</code></li>
        <li><strong>Session ID</strong> — auto-generated per MCP client process start</li>
      </ul>
      <p className={P}>
        The dashboard then slices spend by any combination. Example: &quot;show me the top 10 customers by
        last-7-days agent cost, filtered to agents named onboarding_*&quot;.
      </p>

      <h2 className={H2}>Wiring it into a multi-tenant product</h2>
      <p className={P}>
        If you spawn agent sessions per customer request, pass tenant identifiers as env vars when launching
        the MCP proxy subprocess:
      </p>
      <pre className="bg-gray-950 border border-white/5 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-200">
{`MCPSPEND_API_KEY=mcps_live_xxx \\
MCPSPEND_PROJECT_ID="$CUSTOMER_ID" \\
MCPSPEND_AGENT_NAME="$AGENT_KIND" \\
npx -y @mcpspend/proxy wrap -- npx -y @modelcontextprotocol/server-filesystem /data`}
      </pre>
      <p className={P}>
        Spend now flows tagged in real-time. You can showback, alert, or bill from it.
      </p>

      <h2 className={H2}>What teams build with this</h2>
      <ol className={OL}>
        <li><strong>Customer-level showback.</strong> Internal Looker / Metabase dashboard fed from MCPSpend&apos;s public stats API. &quot;Customer ACME spent $312 on agent activity this month.&quot;</li>
        <li><strong>Per-feature unit economics.</strong> Tag agent sessions with the product feature that spawned them. &quot;Our AI summarizer feature costs $0.04/query — at $4/month it&apos;s profitable above 10 queries.&quot;</li>
        <li><strong>Anomaly detection.</strong> A Slack alert when a customer&apos;s agent cost is 3× their 14-day baseline. Almost always means a runaway loop or new heavy workflow.</li>
        <li><strong>Margin guardrails.</strong> Block agent sessions for customers who&apos;ve exceeded their plan&apos;s included AI budget for the month. Hard cap before negative-margin events.</li>
      </ol>

      <h2 className={H2}>What MCPSpend doesn&apos;t do</h2>
      <ul className={UL}>
        <li>We don&apos;t see your customer&apos;s data — only the tool envelope (which server, which tool, latency, byte counts).</li>
        <li>We don&apos;t bill your customers — that&apos;s your Stripe / billing stack. We give you the cost numbers.</li>
        <li>We&apos;re not a tracing tool. For full agent traces, pair with Langfuse or your own OpenTelemetry stack.</li>
      </ul>

      <h2 className={H2}>Start tracking</h2>
      <pre className="bg-gray-950 border border-white/5 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-200">
        npx --yes @mcpspend/proxy@latest init --key mcps_live_xxx
      </pre>
      <p className={P}>
        25,000 calls / month free. For teams crossing that, Pro at $29/mo covers 500K calls and Team at $99/mo
        covers 2.5M. <Link href="/pricing" className="text-brand-400 hover:underline">See pricing →</Link>
      </p>
      <p className={P}>
        Enterprise (custom volume, dedicated infra, signed DPA, audit log retention &gt; 12 months) — see{' '}
        <Link href="/enterprise" className="text-brand-400 hover:underline">/enterprise</Link>.
      </p>
    </SeoLandingPage>
  )
}
