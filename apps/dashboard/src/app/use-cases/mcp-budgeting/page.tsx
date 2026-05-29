import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoLandingPage, H2, P, UL, OL, CODE } from '@/components/landing/SeoLandingPage'

export const metadata: Metadata = {
  title: 'MCP for budgeting — monthly AI agent spend caps and alerts',
  description:
    'Set per-project, per-agent, per-customer budgets. Get alerts at 50/80/100%. Hard caps prevent runaway costs.',
  alternates: { canonical: 'https://mcpspend.com/use-cases/mcp-budgeting' },
}

export default function McpBudgetingPage() {
  return (
    <SeoLandingPage
      title="MCP for budgeting"
      intro={
        <>
          You can budget for AWS compute and S3 storage — your finance team has those numbers down to the
          cent. AI agent spend is the opposite: opaque, variable, and prone to runaway loops. Here&apos;s how to
          budget for it.
        </>
      }
      breadcrumb={{ label: 'Use cases', href: '/' }}
      related={[
        { title: 'MCP for procurement', href: '/use-cases/mcp-procurement', blurb: 'Vendor evaluation criteria.' },
        { title: 'AI expense tracker', href: '/ai-expense-tracker', blurb: 'Attribution mechanics.' },
        { title: 'Enterprise pricing', href: '/enterprise', blurb: 'Volume tiers + SLA.' },
      ]}
    >
      <h2 className={H2}>The runaway-loop problem</h2>
      <p className={P}>
        Every team that puts an agent in production sees the same incident sooner or later: a workflow that
        was supposed to scrape 20 pages scraped 2,000 because a pagination condition was wrong. Or a code
        review agent that walked into a recursive imports graph. The next Anthropic invoice is 10× normal.
      </p>
      <p className={P}>
        Provider-side billing alerts (Anthropic, OpenAI) fire after the fact, on the aggregate, with hours of
        lag. By the time you see the alert, the damage is done.
      </p>

      <h2 className={H2}>What real-time budgets look like</h2>
      <p className={P}>
        MCPSpend evaluates spend continuously and triggers webhooks at configurable thresholds. Set up:
      </p>
      <ul className={UL}>
        <li><strong>Per-project budget</strong>: $500 / month for project <code className={CODE}>customer_acme</code></li>
        <li><strong>Per-agent budget</strong>: $50 / day for agent <code className={CODE}>nightly_scraper</code></li>
        <li><strong>Per-tool budget</strong>: $100 / week on <code className={CODE}>playwright/browser_navigate</code></li>
      </ul>
      <p className={P}>
        Threshold events fire webhooks at 50%, 80%, 100% by default — into PagerDuty, Slack, Datadog, or any
        URL you configure. Every webhook is HMAC-SHA256 signed with{' '}
        <code className={CODE}>X-MCPSpend-Signature</code> so you can verify authenticity.
      </p>

      <h2 className={H2}>Hard caps (kill switch)</h2>
      <p className={P}>
        For projects where overrun is unacceptable — for example, a Free-tier customer of yours — you can set
        a hard cap. When the project hits 100% of its budget, MCPSpend rejects subsequent tool-call attempts
        with a 429 at the proxy layer. The agent gets an error response from the tool; you get a clear log of
        the cap being enforced.
      </p>
      <p className={P}>
        Hard caps are off by default — most teams use webhooks first and escalate to kill-switch only after a
        runaway incident teaches them the lesson.
      </p>

      <h2 className={H2}>How to set it up</h2>
      <ol className={OL}>
        <li>Install the proxy: <code className={CODE}>npx --yes @mcpspend/proxy@latest init --key mcps_live_xxx</code></li>
        <li>Tag your traffic with project + agent identifiers (env vars)</li>
        <li>In the dashboard at <code className={CODE}>/dashboard/budgets</code>, create a budget per project or per agent</li>
        <li>Wire a webhook subscription at <code className={CODE}>/dashboard/webhooks</code> to your incident channel</li>
        <li>Test with <strong>Send test</strong> on the webhook page — confirms signature verification works on your side</li>
      </ol>

      <h2 className={H2}>Forecast — see overrun before it happens</h2>
      <p className={P}>
        We compute a daily forecast for each project: month-to-date spend × projection-to-end-of-month based
        on a recency-weighted moving average plus day-of-week seasonality. Surfaced in the dashboard with a
        confidence band so you can see &quot;ACME&apos;s on track for $612 by month-end&quot; before the bill arrives.
      </p>
      <p className={P}>
        Forecasts come with anomaly flags — if the next 7-day projection is &gt; 3× the 14-day baseline, we
        mark it as anomalous and you can subscribe to that event.
      </p>

      <h2 className={H2}>Start budgeting</h2>
      <p className={P}>
        Budgets and webhooks are available on every plan, including Free.{' '}
        <Link href="/register" className="text-brand-400 hover:underline">Create an account →</Link>
      </p>
    </SeoLandingPage>
  )
}
