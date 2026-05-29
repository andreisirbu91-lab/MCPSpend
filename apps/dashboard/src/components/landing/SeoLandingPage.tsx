import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'

/**
 * Reusable SEO landing-page shell. Same wrapper across topic pages so each
 * one renders with a consistent CTA, breadcrumb, and "explore related" block
 * — both for user UX and for Google's E-E-A-T signals (consistent author,
 * consistent navigation, consistent CTA pattern).
 *
 * Pages built on this shell:
 *   /mcp-cost
 *   /cursor-mcp-cost
 *   /claude-desktop-mcp-cost
 *   /chatgpt-mcp-cost
 *   /mcp-pricing-comparison
 *   /ai-expense-tracker
 *   /enterprise
 *   /use-cases/mcp-budgeting
 *   /use-cases/mcp-procurement
 */
export interface SeoLandingProps {
  /** H1, also used in JSON-LD as the page's "headline". */
  title: string
  /** Lead paragraph under H1. Should match the GSC query intent verbatim. */
  intro: React.ReactNode
  /** Body sections — typed children so each page composes its own H2 blocks. */
  children: React.ReactNode
  /** Breadcrumb label and href for the section preceding this page. */
  breadcrumb?: { label: string; href: string }
  /** Three related pages shown at the bottom for internal-linking depth. */
  related?: Array<{ title: string; href: string; blurb: string }>
}

// Helper classes pages can import to keep their JSX tight. Each constant maps
// to one semantic block so we only own the styling in one place.
export const H2 = 'text-2xl sm:text-3xl font-bold text-white tracking-tight mt-12 mb-4'
export const H3 = 'text-xl font-semibold text-white tracking-tight mt-8 mb-3'
export const P  = 'text-gray-300 leading-relaxed'
export const UL = 'list-disc pl-6 space-y-2 text-gray-300 marker:text-gray-600'
export const OL = 'list-decimal pl-6 space-y-2 text-gray-300 marker:text-gray-600'
export const TABLE = 'w-full text-sm border-collapse my-4'
export const TH = 'border border-white/10 bg-white/5 px-3 py-2 text-left text-white font-semibold'
export const TD = 'border border-white/10 px-3 py-2 text-gray-300 align-top'
export const CODE = 'text-brand-300 bg-white/5 px-1.5 py-0.5 rounded text-[0.9em] font-mono'
export const PRE = 'bg-gray-950 border border-white/5 rounded-lg p-4 overflow-x-auto text-sm font-mono'

export function SeoLandingPage({ title, intro, children, breadcrumb, related }: SeoLandingProps) {
  return (
    <>
      <Nav />
      <main className="max-w-4xl mx-auto px-6 py-14 text-gray-200">
        {/* Breadcrumb — small SEO signal + helps crawlers map hierarchy */}
        {breadcrumb && (
          <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href={breadcrumb.href} className="hover:text-white">{breadcrumb.label}</Link>
          </nav>
        )}

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">{title}</h1>
        <div className="mt-5 text-lg text-gray-300 leading-relaxed">{intro}</div>

        {/* Article body — pages compose H2/H3/p/ul/table directly using
            the helper classes exported below. Avoids the @tailwindcss/typography
            plugin so the bundle stays lean. */}
        <article className="mt-10 space-y-6 text-gray-300 leading-relaxed">
          {children}
        </article>

        {/* Primary CTA — repeated below the fold for users who skim */}
        <div className="mt-14 rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 to-gray-900 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">Track your own MCP spend — free</h2>
          <p className="mt-2 text-gray-300 max-w-xl mx-auto">
            One command wraps every MCP client on your machine. 25,000 tool calls/month on the free tier. No card.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/register" className="bg-white text-gray-950 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-200 transition-colors">
              Start free →
            </Link>
            <Link href="/calculator" className="text-sm text-brand-400 hover:text-brand-300 px-4 py-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
              Try the calculator
            </Link>
          </div>
        </div>

        {related && related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold text-white mb-5">Related guides</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.href} href={r.href} className="group rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-brand-500/30 transition-colors p-4">
                  <h3 className="text-white font-semibold text-sm group-hover:text-brand-300 transition-colors">{r.title}</h3>
                  <p className="text-xs text-gray-400 mt-1.5">{r.blurb}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
