// The barrier between the products that share one Stripe account.
//
// The NEW RZS Stripe account sells four products: MCPSpend, FlowDeskOne,
// Worklio and Reper. Stripe broadcasts every event to EVERY endpoint on the
// account — an endpoint subscribes to event TYPES, never to a product — so this
// webhook receives, with a perfectly valid signature, the subscriptions of
// three other applications.
//
// Metadata cannot tell us apart. The old guard was
// `!obj.metadata?.project || obj.metadata.project === 'mcpspend'`, i.e. "no
// project key means it's ours". FlowDeskOne writes `metadata[user_id]` and
// `metadata[company_id]` and no `project` key at all, so every FlowDeskOne
// subscription looked like ours. On 2026-08-24 that same class of bug produced
// 500s on Reper's endpoint, and Stripe DISABLED Worklio's endpoint outright.
//
// The PRICE is the only thing that demonstrably belongs to one product.
//
// Pure module, no I/O — see stripeOwnership.test.ts.

export type Plan = 'PRO' | 'TEAM' | 'ENTERPRISE'

export interface PlanInfo {
  plan: Plan
  /** Monthly call limit. Same for a plan regardless of billing cadence. */
  limit: number
}

const PRO_LIMIT = 1_000_000
const TEAM_LIMIT = 10_000_000
const ENTERPRISE_LIMIT = 999_999_999

/**
 * Every MCPSpend recurring price, read from the live account on 2026-08-31.
 *
 * Retired prices must stay here: if we drop one, the cancellation of an old
 * subscriber would look like a foreign event and we would never learn they
 * left — they would keep their paid limits forever.
 */
export const PRICE_TO_PLAN: Record<string, PlanInfo> = {
  // MCPSpend Pro — prod_UZMthBYIbqJmgJ
  price_1TaE9bE5xpjM17G8GDRlyzeQ: { plan: 'PRO', limit: PRO_LIMIT }, // $29/mo
  price_1TaK9yE5xpjM17G8YHXnH9Ad: { plan: 'PRO', limit: PRO_LIMIT }, // $290/yr
  // MCPSpend Team — prod_UZMtjwLefeqXjE
  price_1TaE9cE5xpjM17G8u1uzx67Y: { plan: 'TEAM', limit: TEAM_LIMIT }, // $99/mo
  price_1TaK9yE5xpjM17G8Ovbx8gZn: { plan: 'TEAM', limit: TEAM_LIMIT }, // $990/yr
  // MCPSpend Enterprise — prod_UZMt6OnhC6IMcJ
  price_1TaE9dE5xpjM17G85hC8typ7: { plan: 'ENTERPRISE', limit: ENTERPRISE_LIMIT }, // $499/mo
  price_1TaK9zE5xpjM17G8rImUutnx: { plan: 'ENTERPRISE', limit: ENTERPRISE_LIMIT }, // $4990/yr
}

/**
 * Prices that are ours but carry no plan: the one-time "Support MCPSpend"
 * charge (prod_UZhorqBuPYVuXv). Recognising them keeps us from logging a
 * false "foreign event" alarm on our own checkouts.
 */
export const OTHER_OWN_PRICES = new Set(['price_1TaYOYE5xpjM17G8Gt8woAa0'])

/**
 * Price IDs supplied through the environment, if any.
 *
 * The previous code built its price map straight from `process.env` with
 * literal fallbacks (`process.env.STRIPE_PRICE_PRO || 'price_pro'`). When a
 * variable is unset the map gains a key of `'price_pro'` — a string no real
 * price will ever match, so the plan silently resolves to "unknown" and the
 * subscription is ignored. Here the environment can only ADD to the map that
 * is known-good in code; it can never be the sole source of truth.
 */
export function pricesFromEnv(env: NodeJS.ProcessEnv = process.env): Record<string, PlanInfo> {
  const pairs: Array<[string | undefined, PlanInfo]> = [
    [env.STRIPE_PRICE_PRO, { plan: 'PRO', limit: PRO_LIMIT }],
    [env.STRIPE_PRICE_PRO_YEARLY, { plan: 'PRO', limit: PRO_LIMIT }],
    [env.STRIPE_PRICE_TEAM, { plan: 'TEAM', limit: TEAM_LIMIT }],
    [env.STRIPE_PRICE_TEAM_YEARLY, { plan: 'TEAM', limit: TEAM_LIMIT }],
    [env.STRIPE_PRICE_ENT, { plan: 'ENTERPRISE', limit: ENTERPRISE_LIMIT }],
    [env.STRIPE_PRICE_ENT_YEARLY, { plan: 'ENTERPRISE', limit: ENTERPRISE_LIMIT }],
  ]
  const out: Record<string, PlanInfo> = {}
  for (const [id, info] of pairs) {
    // Only real Stripe price IDs. Guards against the placeholder fallbacks and
    // against an empty variable becoming a wildcard key.
    if (typeof id === 'string' && /^price_[A-Za-z0-9]{10,}$/.test(id)) out[id] = info
  }
  return out
}

/** The full price map: known-good in code, plus anything valid from the env. */
export function priceMap(env: NodeJS.ProcessEnv = process.env): Record<string, PlanInfo> {
  return { ...PRICE_TO_PLAN, ...pricesFromEnv(env) }
}

/**
 * Every price ID in an event object, whatever its shape.
 *
 * Subscriptions carry them on `items`, invoices on `lines`. For invoices we
 * read both forms: in API version `2026-01-28.clover` the price moved to
 * `pricing.price_details.price` and the old `price` field is now null.
 */
export function pricesInEvent(obj: unknown): string[] {
  const o = obj as Record<string, any> | null | undefined
  const fromSubscription: unknown[] = (o?.items?.data ?? []).map((it: any) => it?.price?.id)
  const fromInvoice: unknown[] = (o?.lines?.data ?? []).map(
    (l: any) => l?.pricing?.price_details?.price ?? l?.price?.id,
  )
  return [...fromSubscription, ...fromInvoice].filter(
    (p): p is string => typeof p === 'string' && p.length > 0,
  )
}

export type Ownership =
  | { kind: 'ours'; priceId: string; plan: PlanInfo | null }
  /** Cannot be PROVEN ours from the payload. The caller may still ask the DB. */
  | { kind: 'unproven'; prices: string[] }

/**
 * Is this event about an MCPSpend product?
 *
 * Checkout sessions carry no prices — for those the caller must fetch the
 * subscription from Stripe and run it through this same barrier.
 */
export function decideOwnership(obj: unknown, env: NodeJS.ProcessEnv = process.env): Ownership {
  const prices = pricesInEvent(obj)
  const map = priceMap(env)
  // `hasOwnProperty`, not `in`: `in` would accept 'constructor' or 'toString'
  // as a valid price through the prototype chain.
  const priceId = prices.find(
    (p) => Object.prototype.hasOwnProperty.call(map, p) || OTHER_OWN_PRICES.has(p),
  )
  if (!priceId) return { kind: 'unproven', prices }
  return { kind: 'ours', priceId, plan: map[priceId] ?? null }
}

/**
 * The subscription behind an invoice. `invoice.subscription` became null in
 * `2026-01-28.clover` and moved into `parent.subscription_details`.
 */
export function subscriptionIdFromInvoice(invoice: unknown): string | null {
  const inv = invoice as Record<string, any> | null | undefined
  const id = inv?.parent?.subscription_details?.subscription ?? inv?.subscription
  if (typeof id === 'string') return id
  return typeof id?.id === 'string' ? id.id : null
}
