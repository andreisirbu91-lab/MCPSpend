import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoLandingPage, H2, P, UL, OL } from '@/components/landing/SeoLandingPage'

export const metadata: Metadata = {
  title: 'MCP for procurement — what to evaluate before buying an MCP server',
  description:
    'Procurement checklist for teams adopting MCP servers in production: cost, security, compliance, vendor lock-in, supply chain.',
  alternates: { canonical: 'https://mcpspend.com/use-cases/mcp-procurement' },
}

export default function McpProcurementPage() {
  return (
    <SeoLandingPage
      title="MCP for procurement"
      intro={
        <>
          Procurement and security teams are starting to see MCP server purchase requests come through. Most
          MCP servers are pre-revenue open-source projects from individuals. Here&apos;s the evaluation framework
          we recommend, drawn from how we vet third-party MCPs ourselves.
        </>
      }
      breadcrumb={{ label: 'Use cases', href: '/' }}
      related={[
        { title: 'MCP for budgeting', href: '/use-cases/mcp-budgeting', blurb: 'Real-time spend controls.' },
        { title: 'Security threat model', href: '/security', blurb: 'Our public threat model.' },
        { title: 'Enterprise pricing', href: '/enterprise', blurb: 'SLA + DPA + dedicated infra.' },
      ]}
    >
      <h2 className={H2}>The 6-point evaluation framework</h2>

      <h3 className="text-xl font-semibold text-white mt-8 mb-3">1. Code execution surface</h3>
      <p className={P}>
        Stdio MCP servers run as subprocesses on the user&apos;s machine. They inherit the user&apos;s file system,
        network, and credentials. Question for the vendor: <em>what local resources does the server need
        access to, and why?</em> Pin to specific packages, never <code>@latest</code> from random publishers.
      </p>

      <h3 className="text-xl font-semibold text-white mt-8 mb-3">2. Data flow</h3>
      <p className={P}>
        For each tool the server exposes, ask:
      </p>
      <ul className={UL}>
        <li>What does it read?</li>
        <li>What does it send to the vendor&apos;s servers, if anything?</li>
        <li>What does it return to the agent (and therefore to your LLM provider)?</li>
      </ul>
      <p className={P}>
        Many MCP servers are pass-through wrappers — they don&apos;t have backends — but some do (telemetry,
        cost tracking, search). Verify the data flow documentation matches the actual network traffic.
      </p>

      <h3 className="text-xl font-semibold text-white mt-8 mb-3">3. Cost</h3>
      <p className={P}>
        MCP tool calls bill on the LLM provider invoice — input + output tokens. Heavy MCP servers (browser
        automation, codebase indexers) can easily 10× your token spend. Before you greenlight a server,
        measure 1 week of representative usage and project the annualized cost.
      </p>
      <p className={P}>
        Use the <Link href="/calculator" className="text-brand-400 hover:underline">MCPSpend calculator</Link>{' '}
        for an order-of-magnitude estimate, or install the proxy for measured data.
      </p>

      <h3 className="text-xl font-semibold text-white mt-8 mb-3">4. License + IP posture</h3>
      <ul className={UL}>
        <li>Is the server open source? What license? (MIT and Apache 2.0 are unencumbered for commercial use.)</li>
        <li>Are there CLA / DCO requirements?</li>
        <li>Is the vendor incorporated somewhere you can do business with (no sanctions, etc.)?</li>
      </ul>

      <h3 className="text-xl font-semibold text-white mt-8 mb-3">5. Supply chain</h3>
      <ul className={UL}>
        <li>npm/pypi provenance attestation? (Verifies the published tarball matches the GitHub source.)</li>
        <li>Lockfile committed? Pinned versions?</li>
        <li>Maintainer count + bus factor — is this a one-person project that could vanish?</li>
        <li>Recent CVEs in transitive dependencies?</li>
      </ul>

      <h3 className="text-xl font-semibold text-white mt-8 mb-3">6. Vendor responsiveness</h3>
      <p className={P}>
        For paid MCP services (like MCPSpend itself):
      </p>
      <ul className={UL}>
        <li>Public security disclosure channel (<code>SECURITY.md</code> + <code>/.well-known/security.txt</code>)</li>
        <li>SLA with a credit policy</li>
        <li>Signed DPA available</li>
        <li>Public status page</li>
        <li>Reasonable response time (SaaS norm: 4-8 business hours for sev-1)</li>
      </ul>

      <h2 className={H2}>Practical procurement workflow</h2>
      <ol className={OL}>
        <li><strong>Shortlist</strong> from the official MCP Registry or Glama / mcp.so / PulseMCP — these filter out obvious low-quality submissions.</li>
        <li><strong>Read the SECURITY.md</strong> if one exists. No SECURITY.md = ask for one before commit.</li>
        <li><strong>Pilot on a sandbox project</strong> for 2 weeks. Tag traffic with MCPSpend so you have measured cost numbers, not guesses.</li>
        <li><strong>Internal security review</strong> with your standard third-party SaaS checklist. MCP servers are a SaaS category — not a special case.</li>
        <li><strong>Roll out behind a feature flag</strong> so you can disable if a runaway loop appears.</li>
      </ol>

      <h2 className={H2}>MCPSpend&apos;s own procurement posture</h2>
      <p className={P}>
        For completeness, here&apos;s what we publish for buyers evaluating us:
      </p>
      <ul className={UL}>
        <li>MIT-licensed proxy on <a href="https://github.com/andreisirbu91-lab/MCPSpend" className="text-brand-400 hover:underline">GitHub</a></li>
        <li>npm provenance attestation on every release</li>
        <li>Public threat model at <Link href="/security" className="text-brand-400 hover:underline">/security</Link></li>
        <li>RFC 9116 <code>/.well-known/security.txt</code></li>
        <li>99.9% SLA at <Link href="/legal/sla" className="text-brand-400 hover:underline">/legal/sla</Link></li>
        <li>DPA template at <Link href="/legal/dpa" className="text-brand-400 hover:underline">/legal/dpa</Link></li>
        <li>GDPR Art. 15/17/20 self-serve at <Link href="/legal/data-rights" className="text-brand-400 hover:underline">/legal/data-rights</Link></li>
        <li>Public status page with 30-day uptime history at <Link href="/status" className="text-brand-400 hover:underline">/status</Link></li>
        <li>SOC 2 Type I in progress with Vanta, expected Q4 2026</li>
      </ul>
      <p className={P}>
        For Enterprise procurement specifically, see <Link href="/enterprise" className="text-brand-400 hover:underline">/enterprise</Link>.
      </p>
    </SeoLandingPage>
  )
}
