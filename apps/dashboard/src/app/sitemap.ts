import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/blog'

/**
 * Auto-generated sitemap that includes every static marketing page plus
 * every published blog post. Next.js serves this at /sitemap.xml.
 *
 * Crawlers (Google, Bing) re-fetch this every few days; new blog posts
 * appear automatically once their publishedAt date passes.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mcpspend.com'
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`,                   lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/pricing`,            lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/calculator`,         lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    // High-intent SEO landing pages targeting GSC queries we already rank for
    // (positions 30-80) — these push toward page 1-2 by giving each query its
    // own dedicated, deep page instead of all traffic landing on /.
    { url: `${base}/mcp-cost`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/cursor-mcp-cost`,            lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/claude-desktop-mcp-cost`,    lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/chatgpt-mcp-cost`,           lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/mcp-pricing-comparison`,     lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/ai-expense-tracker`,         lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/enterprise`,                 lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/use-cases/mcp-budgeting`,    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/use-cases/mcp-procurement`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/security`,           lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/compare`,            lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/compare/helicone`,   lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/compare/langfuse`,   lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/compare/posthog`,    lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/compare/portkey`,    lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/compare/lunary`,     lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/compare/apianalytics`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/blog`,               lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/docs`,               lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/customers`,          lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/customers/mcpspend-itself`, lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },
    { url: `${base}/press`,              lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/legal/sla`,          lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },
    { url: `${base}/legal/dpa`,          lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },
    { url: `${base}/legal/data-rights`,  lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${base}/privacy`,            lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${base}/terms`,              lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${base}/status`,             lastModified: now, changeFrequency: 'daily',   priority: 0.3 },
    { url: `${base}/register`,           lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/login`,              lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ]

  const blogPages: MetadataRoute.Sitemap = getPublishedPosts().map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date((p.frontmatter.updatedAt ?? p.frontmatter.publishedAt) + 'T00:00:00Z'),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticPages, ...blogPages]
}
