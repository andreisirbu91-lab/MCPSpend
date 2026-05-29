import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoLandingPage, H2, P, UL, OL, CODE } from '@/components/landing/SeoLandingPage'

export const metadata: Metadata = {
  title: 'Claude Desktop MCP cost tracking — per-server spend visibility',
  description:
    'Claude Desktop with multiple MCP servers hides which one is burning tokens. Per-server cost attribution in 60 seconds.',
  alternates: { canonical: 'https://mcpspend.com/claude-desktop-mcp-cost' },
}

export default function ClaudeDesktopMcpCostPage() {
  return (
    <SeoLandingPage
      title="Claude Desktop MCP cost tracking"
      intro={
        <>
          You added Playwright, Filesystem, GitHub, and a few more MCP servers to Claude Desktop. Now your
          Anthropic bill is 4× what it was. This page tells you which server is actually responsible.
        </>
      }
      related={[
        { title: 'MCP cost — full guide', href: '/mcp-cost', blurb: 'Token math + per-server averages.' },
        { title: 'Cursor MCP cost', href: '/cursor-mcp-cost', blurb: 'Same patterns, different IDE.' },
        { title: 'Pricing comparison', href: '/mcp-pricing-comparison', blurb: 'Vs. Helicone, Langfuse, PostHog.' },
      ]}
    >
      <h2 className={H2}>Claude Desktop config — where to look</h2>
      <p className={P}>
        Claude Desktop loads MCP servers from <code className={CODE}>claude_desktop_config.json</code>:
      </p>
      <ul className={UL}>
        <li><strong>macOS</strong>: <code className={CODE}>~/Library/Application Support/Claude/claude_desktop_config.json</code></li>
        <li><strong>Windows</strong>: <code className={CODE}>%APPDATA%\Claude\claude_desktop_config.json</code></li>
        <li><strong>Linux</strong>: <code className={CODE}>~/.config/Claude/claude_desktop_config.json</code></li>
      </ul>
      <p className={P}>
        Open it. Most users have 4-8 MCP servers configured. Each one runs as a subprocess every time Claude
        Desktop launches and stays alive until you quit the app.
      </p>

      <h2 className={H2}>The hidden cost: idle MCP servers still charge you</h2>
      <p className={P}>
        Several MCP servers (filesystem, codebase indexers, github) eagerly fetch context on startup or
        background-poll for changes. You don&apos;t see this in the chat UI — but every fetched token is billed
        on your next conversation turn because the agent decides whether to read the result.
      </p>
      <p className={P}>
        Worst offenders we&apos;ve seen in real Claude Desktop configs:
      </p>
      <ul className={UL}>
        <li><strong>playwright</strong> — keeps a browser context alive; every navigation pulls a full DOM snapshot</li>
        <li><strong>codebase indexers</strong> (sourcegraph, codeium) — large initial context dump per session</li>
        <li><strong>github MCPs</strong> — list_issues / get_pr returns 50+ items by default</li>
      </ul>

      <h2 className={H2}>Optimization order</h2>
      <ol className={OL}>
        <li><strong>Audit your config.</strong> Open <code className={CODE}>claude_desktop_config.json</code> and ask: do I actually use each entry weekly? Remove what you don&apos;t.</li>
        <li><strong>Move browser tools to a separate profile.</strong> If you have multiple Claude Desktop profiles, keep Playwright on a &quot;browser&quot; profile and a leaner config for everyday chat.</li>
        <li><strong>Cap GitHub query sizes.</strong> Most GitHub MCPs accept <code className={CODE}>--per-page</code> or <code className={CODE}>--max-results</code>. Set it to 10 instead of the default 50-100.</li>
        <li><strong>Set a $50/month budget alert.</strong> Heavy Claude Desktop users without browser tools land at $30-50/month; with browser tools, $100-300/month.</li>
      </ol>

      <h2 className={H2}>Track your Claude Desktop spend</h2>
      <p className={P}>
        The MCPSpend proxy auto-detects Claude Desktop&apos;s config path and wraps every entry. One command:
      </p>
      <pre className="bg-gray-950 border border-white/5 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-200">
        npx --yes @mcpspend/proxy@latest init --key mcps_live_xxx
      </pre>
      <p className={P}>
        It writes a <code className={CODE}>.mcpspend.bak</code> backup of your original config. Quit and restart
        Claude Desktop; calls start streaming to the{' '}
        <Link href="/register" className="text-brand-400 hover:underline">dashboard</Link> in under 30 seconds.
      </p>
      <p className={P}>
        Free tier: 25,000 calls / month. No card. MIT-licensed proxy on npm so you can audit what we send.
      </p>
    </SeoLandingPage>
  )
}
