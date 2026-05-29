import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoLandingPage, H2, P, UL, OL, TABLE, TH, TD, CODE } from '@/components/landing/SeoLandingPage'

export const metadata: Metadata = {
  title: 'Cursor MCP cost tracking — why your Anthropic bill jumped 3-5×',
  description:
    'Cursor Composer calls 30-80 MCP tools per task in the background. Here is the real cost breakdown plus a per-IDE optimization checklist.',
  alternates: { canonical: 'https://mcpspend.com/cursor-mcp-cost' },
}

export default function CursorMcpCostPage() {
  return (
    <SeoLandingPage
      title="Cursor MCP cost tracking"
      intro={
        <>
          Cursor&apos;s Composer agent quietly calls MCP tools 30-80 times per task. Each call pulls tokens —
          and every token shows up on your Anthropic invoice. Here&apos;s where the money goes and what to do.
        </>
      }
      related={[
        { title: 'MCP cost — full guide', href: '/mcp-cost', blurb: 'Token math + per-server averages.' },
        { title: 'Claude Desktop MCP cost', href: '/claude-desktop-mcp-cost', blurb: 'Same patterns, different IDE.' },
        { title: 'Pricing comparison', href: '/mcp-pricing-comparison', blurb: 'MCPSpend vs. Helicone vs. PostHog.' },
      ]}
    >
      <h2 className={H2}>The hidden multiplier</h2>
      <p className={P}>
        You ask Cursor: <em>&quot;Fix the bug in the auth flow.&quot;</em> What happens next, behind the scenes:
      </p>
      <ul className={UL}>
        <li><code className={CODE}>filesystem/list_dir</code> on <code className={CODE}>src/auth</code> — 1 call</li>
        <li><code className={CODE}>filesystem/read_file</code> for each candidate file — 8-15 calls</li>
        <li><code className={CODE}>github/get_recent_commits</code> to find when it last worked — 1 call</li>
        <li><code className={CODE}>github/get_pr_diff</code> on relevant PRs — 3-5 calls</li>
        <li><code className={CODE}>brave-search</code> for error messages — 2-4 calls</li>
        <li><code className={CODE}>fetch</code> on Stack Overflow links — 4-8 calls</li>
        <li>Composer chat completions interleaved with all of the above — 4-8 round trips</li>
      </ul>
      <p className={P}>
        Total: <strong>20-40 tool calls</strong> for one user prompt. Each call is billed for the input context
        it brings <em>and</em> the output payload it returns. The chat completion you see in the UI is only
        15-25% of the actual cost.
      </p>

      <h2 className={H2}>Real Cursor user breakdown</h2>
      <p className={P}>
        Average split across heavy Cursor users in the MCPSpend dataset:
      </p>
      <div className="overflow-x-auto">
        <table className={TABLE}>
          <thead>
            <tr>
              <th className={TH}>MCP server</th>
              <th className={TH}>% of monthly cost</th>
              <th className={TH}>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className={TD}>playwright (when enabled)</td><td className={TD}>30-50%</td><td className={TD}>Largest single driver when used at all</td></tr>
            <tr><td className={TD}>filesystem</td><td className={TD}>15-25%</td><td className={TD}>High call frequency, moderate per-call cost</td></tr>
            <tr><td className={TD}>fetch / read-url</td><td className={TD}>10-20%</td><td className={TD}>Full-page reads can balloon</td></tr>
            <tr><td className={TD}>github</td><td className={TD}>8-15%</td><td className={TD}>Diff sizes are unpredictable</td></tr>
            <tr><td className={TD}>brave-search / web-search</td><td className={TD}>5-10%</td><td className={TD}>Cheap per call but called often</td></tr>
            <tr><td className={TD}>postgres / database tools</td><td className={TD}>3-8%</td><td className={TD}>Schema introspection + queries</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className={H2}>Where Cursor&apos;s config lives</h2>
      <p className={P}>
        Cursor stores MCP server configs in two places:
      </p>
      <ul className={UL}>
        <li><strong>Workspace-scoped</strong>: <code className={CODE}>.vscode/mcp.json</code> in your project root (Cursor is a VS Code fork — reads the same path)</li>
        <li><strong>User-scoped</strong>: <code className={CODE}>~/Library/Application Support/Cursor/User/mcp.json</code> on Mac, <code className={CODE}>%APPDATA%\Cursor\User\mcp.json</code> on Windows</li>
      </ul>

      <h2 className={H2}>Optimization checklist (in order of ROI)</h2>
      <ol className={OL}>
        <li><strong>Disable Playwright when not browsing.</strong> Toggle in Composer settings or set <code className={CODE}>&quot;enabled&quot;: false</code> in mcp.json for the entry. Re-enable for browser-heavy tasks.</li>
        <li><strong>Cap file-read sizes.</strong> Most filesystem MCP servers accept <code className={CODE}>--max-bytes</code>. 50KB is usually enough.</li>
        <li><strong>Use Cursor Background agents on Haiku, not Sonnet.</strong> Set <code className={CODE}>cursor.background.model</code> to <code className={CODE}>claude-haiku-4-5</code> for routine background work — 4× cheaper.</li>
        <li><strong>Pin <code className={CODE}>brave-search</code> to specific tasks.</strong> If your work doesn&apos;t need web search, remove it from the config — it adds calls even when you don&apos;t expect.</li>
        <li><strong>Add a per-workspace budget alert.</strong> $20/week per workspace is a sensible default. Get a Slack/email ping at 80%.</li>
      </ol>

      <h2 className={H2}>Track your own Cursor spend in 60 seconds</h2>
      <p className={P}>
        Install the proxy — it auto-detects Cursor at both config paths and wraps every entry transparently:
      </p>
      <pre className="bg-gray-950 border border-white/5 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-200">
        npx --yes @mcpspend/proxy@latest init --key mcps_live_xxx
      </pre>
      <p className={P}>
        Restart Cursor → trigger any Composer action → calls appear in the{' '}
        <Link href="/register" className="text-brand-400 hover:underline">MCPSpend dashboard</Link> in &lt; 30 seconds.
      </p>
      <p className={P}>
        Free tier covers 25,000 calls per month — enough for a single heavy Cursor user. No card required.
      </p>
    </SeoLandingPage>
  )
}
