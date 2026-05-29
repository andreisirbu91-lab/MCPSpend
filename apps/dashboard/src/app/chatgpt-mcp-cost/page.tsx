import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoLandingPage, H2, P, UL, CODE } from '@/components/landing/SeoLandingPage'

export const metadata: Metadata = {
  title: 'ChatGPT MCP cost tracking — measuring OpenAI agent spend on tool calls',
  description:
    'Tracking MCP tool-call cost when your agent uses GPT-4o, o3, or other OpenAI models. Per-tool attribution with provider-aware pricing.',
  alternates: { canonical: 'https://mcpspend.com/chatgpt-mcp-cost' },
}

export default function ChatGptMcpCostPage() {
  return (
    <SeoLandingPage
      title="ChatGPT MCP cost tracking"
      intro={
        <>
          OpenAI now supports MCP through Custom GPT actions, Agents SDK, and several third-party clients.
          Same problem as Claude users: agentic loops call MCP tools dozens of times per turn, and OpenAI
          bills you per token. Here&apos;s how to measure it.
        </>
      }
      related={[
        { title: 'MCP cost — full guide', href: '/mcp-cost', blurb: 'Token math + per-server averages.' },
        { title: 'Cursor MCP cost', href: '/cursor-mcp-cost', blurb: 'Same patterns, different IDE.' },
        { title: 'Pricing comparison', href: '/mcp-pricing-comparison', blurb: 'Tooling alternatives by use case.' },
      ]}
    >
      <h2 className={H2}>OpenAI pricing — relevant tiers</h2>
      <p className={P}>
        Per million tokens (public OpenAI rates as of 2026):
      </p>
      <ul className={UL}>
        <li><strong>GPT-4o</strong>: $2.50 input / $10 output</li>
        <li><strong>GPT-4o mini</strong>: $0.15 input / $0.60 output</li>
        <li><strong>o3</strong>: $15 input / $60 output (reasoning + tool use)</li>
        <li><strong>o3-mini</strong>: $1.10 input / $4.40 output</li>
      </ul>
      <p className={P}>
        A 15K-token tool response under GPT-4o costs <strong>$0.15</strong>. Under o3 it&apos;s{' '}
        <strong>$0.90</strong>. The model choice matters as much as the tool choice.
      </p>

      <h2 className={H2}>Which clients support MCP + OpenAI</h2>
      <p className={P}>
        Today, the practical entry points for OpenAI + MCP are:
      </p>
      <ul className={UL}>
        <li><strong>OpenAI Agents SDK</strong> — the official Python/Node SDK supports MCP servers as tools</li>
        <li><strong>Custom GPTs</strong> — Actions can call MCP-style endpoints; limited to HTTP transport</li>
        <li><strong>Continue.dev</strong> — IDE assistant that supports MCP with any provider</li>
        <li><strong>Cline</strong> — VS Code extension that works with OpenAI keys</li>
        <li><strong>Goose</strong> (Block) — agent framework that wraps MCP for any provider</li>
      </ul>

      <h2 className={H2}>Where MCPSpend fits</h2>
      <p className={P}>
        We&apos;re a transport-layer proxy. We don&apos;t know — and don&apos;t care — which LLM provider you use. We
        measure every MCP tool call regardless, and use provider-published rates to compute cost. As of v0.7.1
        the cost engine knows: <code className={CODE}>claude-opus-4-7</code>, <code className={CODE}>claude-sonnet-4-6</code>,{' '}
        <code className={CODE}>claude-haiku-4-5</code>, <code className={CODE}>gpt-4o</code>,{' '}
        <code className={CODE}>gpt-4o-mini</code>, <code className={CODE}>o3</code>, <code className={CODE}>o3-mini</code>,{' '}
        Gemini 2.0 Pro/Flash, Grok 2, DeepSeek Chat/Reasoner, Mistral Large/Small, Llama 3.1 405B/70B/8B,{' '}
        Llama 3.3 70B — and falls back to a Sonnet-equivalent baseline for anything else.
      </p>
      <p className={P}>
        Full live list is at{' '}
        <a href="/api/public/pricing-models" className="text-brand-400 hover:underline">/api/public/pricing-models</a>{' '}
        — public, no auth, refreshed monthly.
      </p>

      <h2 className={H2}>Install</h2>
      <pre className="bg-gray-950 border border-white/5 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-200">
        npx --yes @mcpspend/proxy@latest init --key mcps_live_xxx
      </pre>
      <p className={P}>
        Auto-detects Cline, Continue.dev, Goose, Cursor, Windsurf, VS Code, Claude Desktop, and Claude Code.
        Wraps every MCP server it finds. The OpenAI Agents SDK isn&apos;t auto-detected (no canonical config path)
        — you wrap individual servers manually:
      </p>
      <pre className="bg-gray-950 border border-white/5 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-200">
{`from openai import OpenAI
from agents.mcp import StdioServer

server = StdioServer(
    command="npx",
    args=["-y", "@mcpspend/proxy@latest", "wrap",
          "--key", "mcps_live_xxx",
          "--", "npx", "-y", "@modelcontextprotocol/server-filesystem", "/data"],
)`}
      </pre>
      <p className={P}>
        Same pattern as a stdio wrap for any other client — your MCP server runs inside our subprocess.
      </p>

      <h2 className={H2}>Get a key</h2>
      <p className={P}>
        Free tier: 25,000 tool calls/month — covers a single heavy ChatGPT agent setup. No card.{' '}
        <Link href="/register" className="text-brand-400 hover:underline">Sign up →</Link>
      </p>
    </SeoLandingPage>
  )
}
