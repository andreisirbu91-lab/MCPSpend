/**
 * Tiny file-system-backed blog loader.
 *
 * Articles live as Markdown files under `content/blog/*.md` with YAML
 * frontmatter. Loading is synchronous (we run at build/request time on the
 * server, never in the browser), and there's no DB / CMS — adding a post is:
 *
 *   1. Drop a new `.md` file in apps/dashboard/content/blog/
 *   2. `git commit && git push`
 *   3. Coolify rebuilds the Next.js bundle and the post is live
 *
 * For weekly publishing without manual labour, set `publishedAt` to a future
 * date — `getPublishedPosts()` filters those out so the article only appears
 * once that date arrives (and the next dashboard rebuild ships it).
 */

import fs from 'node:fs'
import path from 'node:path'
import { parseFrontmatter } from './frontmatter'
import { marked } from 'marked'

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export interface PostFrontmatter {
  /** Human-readable title, used as <h1> and <title>. */
  title: string
  /** One-sentence card excerpt + meta description (≤160 chars ideal). */
  excerpt: string
  /** ISO date `YYYY-MM-DD`. Posts dated in the future are hidden until that day. */
  publishedAt: string
  /** Optional ISO date of last update — shows as "Updated …" in the byline. */
  updatedAt?: string
  /** Author name (default: "Andrei Sirbu"). */
  author?: string
  /** Topic tags — surfaced as chips + drive related-post matching. */
  tags?: string[]
  /** Estimated read time in minutes (auto-computed if omitted). */
  readingMinutes?: number
  /** Optional canonical URL when cross-posted (Medium / dev.to / etc.). */
  canonical?: string
  /** Set `draft: true` to hide regardless of date. */
  draft?: boolean
}

export interface Post {
  slug: string
  frontmatter: PostFrontmatter
  /** Raw markdown body without frontmatter. */
  markdown: string
  /** Pre-rendered HTML body — safe to inject via dangerouslySetInnerHTML
      because we control every source file in the repo. */
  html: string
}

/** Estimated reading time at 200 wpm. Used when `readingMinutes` is omitted. */
function estimateReadingMinutes(markdown: string): number {
  const words = markdown.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

function readPostFile(filename: string): Post {
  const slug = filename.replace(/\.md$/, '')
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8')
  const { data: frontmatter, content } = parseFrontmatter<PostFrontmatter>(raw)
  if (!frontmatter.readingMinutes) {
    frontmatter.readingMinutes = estimateReadingMinutes(content)
  }
  if (!frontmatter.author) frontmatter.author = 'Andrei Sirbu'
  return {
    slug,
    frontmatter,
    markdown: content,
    html: marked.parse(content, { async: false }) as string,
  }
}

/** Returns every post on disk regardless of draft/date — admin views can use this. */
export function getAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map(readPostFile)
    .sort((a, b) => b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt))
}

/** Posts that are public RIGHT NOW: non-draft AND publishedAt <= today (UTC). */
export function getPublishedPosts(): Post[] {
  const todayUtc = new Date().toISOString().slice(0, 10)
  return getAllPosts().filter(
    (p) => !p.frontmatter.draft && p.frontmatter.publishedAt <= todayUtc,
  )
}

export function getPostBySlug(slug: string): Post | null {
  try {
    return readPostFile(`${slug}.md`)
  } catch {
    return null
  }
}

/** Up to 3 related posts by tag overlap (excluding the current one). */
export function getRelatedPosts(slug: string, limit = 3): Post[] {
  const current = getPostBySlug(slug)
  if (!current) return []
  const currentTags = new Set(current.frontmatter.tags ?? [])
  return getPublishedPosts()
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      post: p,
      overlap: (p.frontmatter.tags ?? []).filter((t) => currentTags.has(t)).length,
    }))
    .sort((a, b) => b.overlap - a.overlap || b.post.frontmatter.publishedAt.localeCompare(a.post.frontmatter.publishedAt))
    .slice(0, limit)
    .map((x) => x.post)
}
