/**
 * YAML front-matter parsing for the blog.
 *
 * WHY THIS EXISTS instead of `gray-matter`: on 2026-07-14 a Dependabot commit
 * added `"js-yaml": "^4.2.0"` to `pnpm.overrides` to close a security alert.
 * A pnpm override is not an upgrade — it FORCES that version into the tree of
 * every dependency, whatever the dependency asked for. `gray-matter@4.0.3`
 * asks for js-yaml 3 and calls `yaml.safeLoad`, which was removed in 4, so
 * every production build died with:
 *
 *     Error: Function yaml.safeLoad is removed in js-yaml 4.
 *     [Error: Failed to collect page data for /blog/[slug]]
 *
 * Pinning gray-matter back to js-yaml 3 would reopen the alert. Since the whole
 * of gray-matter we used was one call — `matter(raw)` for `{ data, content }` —
 * parsing it here on js-yaml 4 keeps the alert closed and drops a dependency.
 */

import { load } from 'js-yaml'

/**
 * Opening `---`, the YAML block, closing `---`, and the newline after it.
 *
 * `[\s\S]*?` rather than `.*?` because `.` does not match newlines, and lazy so
 * a `---` horizontal rule further down the article cannot swallow the body.
 * `\r?` throughout: a post edited on Windows arrives with CRLF endings.
 */
const FRONT_MATTER = /^﻿?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/

export interface ParsedFrontmatter<T> {
  data: T
  /** The article body, front-matter removed. */
  content: string
}

/**
 * Splits YAML front-matter from the Markdown body.
 *
 * A file with no front-matter is not an error — it is an article with no
 * metadata, and the caller fills in defaults. Malformed YAML *is* an error and
 * is left to propagate: a post whose metadata we cannot read must fail the
 * build loudly, not be published with an empty title.
 */
export function parseFrontmatter<T = Record<string, unknown>>(
  raw: string,
): ParsedFrontmatter<T> {
  const match = FRONT_MATTER.exec(raw)
  if (!match) return { data: {} as T, content: raw }

  const parsed = load(match[1])
  // A YAML block may legitimately parse to a scalar, an array or null; none of
  // those is front-matter, and spreading them would produce nonsense fields.
  const data =
    parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as T)
      : ({} as T)

  return { data, content: raw.slice(match[0].length) }
}
