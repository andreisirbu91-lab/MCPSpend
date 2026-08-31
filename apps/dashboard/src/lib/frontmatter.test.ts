import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { parseFrontmatter } from './frontmatter'

/**
 * These tests exist because production deploys were dead from 2026-07-14 to
 * 2026-08-31 and nobody noticed. `pnpm.overrides` forced js-yaml 4 into
 * `gray-matter`, which calls the removed `yaml.safeLoad`, so `next build` threw
 * "Failed to collect page data for /blog/[slug]" on every deploy.
 *
 * Nothing tested the blog loader, so the only thing that ever exercised it was
 * the production build itself — and its failure was invisible behind a deploy
 * step that had been broken since June for an unrelated reason.
 */

describe('front-matter parsing', () => {
  test('reads the YAML block and returns the body without it', () => {
    const raw = '---\ntitle: Salut\ntags:\n  - mcp\n  - cost\n---\n\nCorpul articolului.\n'
    const { data, content } = parseFrontmatter<{ title: string; tags: string[] }>(raw)
    assert.equal(data.title, 'Salut')
    assert.deepEqual(data.tags, ['mcp', 'cost'])
    assert.equal(content, '\nCorpul articolului.\n')
  })

  test('a `---` rule inside the body does not swallow the article', () => {
    // The lazy quantifier matters: a greedy one would run to the LAST `---`.
    const raw = '---\ntitle: X\n---\n\nIntro\n\n---\n\nDupa linie\n'
    const { data, content } = parseFrontmatter<{ title: string }>(raw)
    assert.equal(data.title, 'X')
    assert.ok(content.includes('Dupa linie'))
    assert.ok(content.includes('---'))
  })

  test('handles CRLF line endings', () => {
    const raw = '---\r\ntitle: Windows\r\n---\r\n\r\nCorp\r\n'
    const { data } = parseFrontmatter<{ title: string }>(raw)
    assert.equal(data.title, 'Windows')
  })

  test('a file with no front-matter is a body with no metadata, not an error', () => {
    const raw = '# Doar markdown\n\nfara metadate\n'
    const { data, content } = parseFrontmatter(raw)
    assert.deepEqual(data, {})
    assert.equal(content, raw)
  })

  test('a YAML block that is not a mapping yields no fields', () => {
    // Spreading a scalar or an array into frontmatter would produce nonsense.
    assert.deepEqual(parseFrontmatter('---\njust a string\n---\nbody\n').data, {})
    assert.deepEqual(parseFrontmatter('---\n- a\n- b\n---\nbody\n').data, {})
  })

  test('malformed YAML throws instead of publishing an empty article', () => {
    assert.throws(() => parseFrontmatter('---\ntitle: "unterminated\n---\nbody\n'))
  })

  test('dates stay usable as ISO strings', () => {
    // js-yaml turns an unquoted YYYY-MM-DD into a Date; the blog treats
    // `publishedAt` as a string, so posts must quote it. This pins the
    // behaviour so a change in either direction is noticed.
    const quoted = parseFrontmatter<{ publishedAt: string }>('---\npublishedAt: "2026-05-24"\n---\n')
    assert.equal(quoted.data.publishedAt, '2026-05-24')
  })
})

describe('every real blog post still parses', () => {
  const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')
  const files = fs.existsSync(BLOG_DIR)
    ? fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))
    : []

  test('the content directory is where we think it is', () => {
    assert.ok(files.length > 0, `no .md files found under ${BLOG_DIR}`)
  })

  for (const file of files) {
    test(file, () => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
      const { data, content } = parseFrontmatter<{ title?: string; publishedAt?: string }>(raw)
      // Exactly what the build needs: a title, a date, and a body.
      assert.ok(data.title, 'missing title')
      assert.ok(data.publishedAt, 'missing publishedAt')
      assert.equal(typeof data.publishedAt, 'string', 'publishedAt must be quoted in the YAML')
      assert.ok(content.trim().length > 0, 'empty body')
    })
  }
})
