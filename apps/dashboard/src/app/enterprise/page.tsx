import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoLandingPage, H2, P, UL } from '@/components/landing/SeoLandingPage'

export const metadata: Metadata = {
  title: 'Enterprise MCP pricing — volume tiers, SLA, DPA, dedicated infrastructure',
  description:
    'MCPSpend for teams above 2.5M tool calls / month. Volume pricing, 99.9% SLA, signed DPA, extended audit retention. EU-hosted, GDPR-aware.',
  alternates: { canonical: 'https://mcpspend.com/enterprise' },
}

export default function EnterprisePage() {
  return (
    <SeoLandingPage
      title="Enterprise MCP pricing"
      intro={
        <>
          For teams shipping agentic AI to production, with volume above the Team plan&apos;s 2.5M tool calls /
          month, or with procurement requirements (DPA, SLA, audit log retention beyond 12 months).
        </>
      }
      related={[
        { title: 'Standard pricing', href: '/pricing', blurb: 'Free / Pro / Team self-serve.' },
        { title: 'SLA terms', href: '/legal/sla', blurb: '99.9% uptime + credit policy.' },
        { title: 'DPA template', href: '/legal/dpa', blurb: 'Ready to counter-sign.' },
      ]}
    >
      <h2 className={H2}>What you get above Team</h2>
      <ul className={UL}>
        <li><strong>Custom volume pricing.</strong> Per-million-call rate that scales down with commitment.</li>
        <li><strong>99.9% SLA</strong> with monthly credit policy — see <Link href="/legal/sla" className="text-brand-400 hover:underline">the full text</Link>.</li>
        <li><strong>Signed DPA</strong> using our <Link href="/legal/dpa" className="text-brand-400 hover:underline">standard template</Link> (or yours).</li>
        <li><strong>Extended audit log retention</strong> — 24 / 36 months instead of the default 90 days.</li>
        <li><strong>SSO via SAML or OIDC</strong> on the dashboard.</li>
        <li><strong>Self-host option</strong> — run the proxy + API + dashboard on your own infrastructure with our Docker images. Pay only the license fee.</li>
        <li><strong>Dedicated EU region</strong> (Frankfurt or Stockholm) instead of shared multi-tenant.</li>
        <li><strong>Quarterly business review</strong> with our team. Optimize cost based on your actual workload.</li>
      </ul>

      <h2 className={H2}>Volume signal</h2>
      <p className={P}>
        If you&apos;re running &gt; 1M tool calls / month already, you&apos;re a fit. The Team plan&apos;s 2.5M cap was
        set so most teams growing into production are still on self-serve until they cross genuine enterprise
        thresholds (procurement, compliance, dedicated infra).
      </p>
      <p className={P}>
        Typical Enterprise commit: $2,500 - $15,000 / month annual contract. We don&apos;t list a price publicly
        because the right number depends on tool-call volume, retention requirements, and whether you self-host.
      </p>

      <h2 className={H2}>Compliance posture</h2>
      <ul className={UL}>
        <li>EU-hosted on Hostinger / Coolify (Frankfurt). No data leaves EU.</li>
        <li>GDPR Art. 15/17/20 self-serve at <Link href="/legal/data-rights" className="text-brand-400 hover:underline">/legal/data-rights</Link></li>
        <li>SOC 2 Type I — in progress with Vanta, expected Q4 2026.</li>
        <li>Public threat model + security disclosure at <Link href="/security" className="text-brand-400 hover:underline">/security</Link></li>
        <li>RFC 9116 <code>/.well-known/security.txt</code> in place.</li>
      </ul>

      <h2 className={H2}>What we don&apos;t see</h2>
      <p className={P}>
        Same as every plan: we observe the MCP tool envelope only. Tool arguments and tool responses never
        leave your machine — they&apos;re not in our database, not in our logs, not in our backups. The proxy
        source is MIT-licensed and you can audit the ingest payload at{' '}
        <a href="https://github.com/andreisirbu91-lab/MCPSpend/blob/main/packages/proxy/src/ingest.ts" className="text-brand-400 hover:underline">packages/proxy/src/ingest.ts</a>.
      </p>

      <h2 className={H2}>Talk to us</h2>
      <p className={P}>
        Email <a href="mailto:enterprise@mcpspend.com" className="text-brand-400 hover:underline">enterprise@mcpspend.com</a>{' '}
        with: monthly tool-call volume (estimate is fine), retention requirements, whether you need self-host,
        and procurement timeline. We respond same business day in EU hours.
      </p>
      <p className={P}>
        For everything below enterprise volume, the self-serve <Link href="/pricing" className="text-brand-400 hover:underline">Team plan at $99/mo</Link>{' '}
        covers up to 2.5M tool calls and all the same features minus the volume discount.
      </p>
    </SeoLandingPage>
  )
}
