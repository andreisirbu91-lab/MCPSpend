import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  decideOwnership,
  pricesInEvent,
  pricesFromEnv,
  priceMap,
  subscriptionIdFromInvoice,
  PRICE_TO_PLAN,
} from './stripeOwnership'

// Real price IDs, read from the live Stripe account on 2026-08-31.
const MCPSPEND_PRO_MONTHLY = 'price_1TaE9bE5xpjM17G8GDRlyzeQ' // $29/mo
const MCPSPEND_ENT_YEARLY = 'price_1TaK9zE5xpjM17G8rImUutnx' // $4990/yr
const MCPSPEND_SUPPORT = 'price_1TaYOYE5xpjM17G8Gt8woAa0' // one-time
const FLOWDESKONE_ENTERPRISE = 'price_1TSGw2E5xpjM17G83YYZhS3M' // 249 RON/mo
const WORKLIO_PRO = 'price_1TLp0rE5xpjM17G80jzRzCt1' // 1499 RON/mo

const NO_ENV = {} as NodeJS.ProcessEnv

describe('the barrier between products sharing one Stripe account', () => {
  test('recognises an MCPSpend subscription by its price', () => {
    const sub = { items: { data: [{ price: { id: MCPSPEND_PRO_MONTHLY } }] } }
    const o = decideOwnership(sub, NO_ENV)
    assert.equal(o.kind, 'ours')
    if (o.kind === 'ours') assert.equal(o.plan?.plan, 'PRO')
  })

  test('rejects a FlowDeskOne subscription even though it has no `project` metadata', () => {
    // The exact shape the old guard accepted: `!obj.metadata?.project` was
    // read as "ours". FlowDeskOne writes user_id/company_id and no project key.
    const sub = {
      items: { data: [{ price: { id: FLOWDESKONE_ENTERPRISE } }] },
      metadata: { company_id: 'b129f5de-77fc-4fdb-8f01-a314338a79a1', user_id: 'u1' },
    }
    assert.equal(decideOwnership(sub, NO_ENV).kind, 'unproven')
  })

  test('rejects a Worklio subscription', () => {
    const sub = { items: { data: [{ price: { id: WORKLIO_PRO } }] } }
    assert.equal(decideOwnership(sub, NO_ENV).kind, 'unproven')
  })

  test('recognises the one-time Support price as ours, with no plan', () => {
    const invoice = { lines: { data: [{ price: { id: MCPSPEND_SUPPORT } }] } }
    const o = decideOwnership(invoice, NO_ENV)
    assert.equal(o.kind, 'ours')
    if (o.kind === 'ours') assert.equal(o.plan, null)
  })

  test('does not accept keys inherited through the prototype chain', () => {
    // `in` would have returned true for 'constructor' and 'toString'.
    for (const poison of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
      const sub = { items: { data: [{ price: { id: poison } }] } }
      assert.equal(decideOwnership(sub, NO_ENV).kind, 'unproven', poison)
    }
  })

  test('survives objects with no prices at all (checkout sessions)', () => {
    assert.equal(decideOwnership({}, NO_ENV).kind, 'unproven')
    assert.equal(decideOwnership(null, NO_ENV).kind, 'unproven')
    assert.deepEqual(pricesInEvent(undefined), [])
  })
})

describe('invoice prices in both API shapes', () => {
  test('old shape: lines[].price.id', () => {
    const invoice = { lines: { data: [{ price: { id: MCPSPEND_ENT_YEARLY } }] } }
    assert.deepEqual(pricesInEvent(invoice), [MCPSPEND_ENT_YEARLY])
  })

  test('clover shape: lines[].pricing.price_details.price', () => {
    // In 2026-01-28.clover `price` is null and the id moved here.
    const invoice = {
      lines: { data: [{ price: null, pricing: { price_details: { price: MCPSPEND_ENT_YEARLY } } }] },
    }
    assert.equal(decideOwnership(invoice, NO_ENV).kind, 'ours')
  })
})

describe('the subscription behind an invoice', () => {
  test('old shape: invoice.subscription', () => {
    assert.equal(subscriptionIdFromInvoice({ subscription: 'sub_old' }), 'sub_old')
  })

  test('clover shape: invoice.parent.subscription_details.subscription', () => {
    const invoice = { subscription: null, parent: { subscription_details: { subscription: 'sub_new' } } }
    assert.equal(subscriptionIdFromInvoice(invoice), 'sub_new')
  })

  test('null when the invoice is not tied to a subscription', () => {
    assert.equal(subscriptionIdFromInvoice({}), null)
    assert.equal(subscriptionIdFromInvoice({ subscription: null }), null)
  })
})

describe('prices supplied through the environment', () => {
  test('an unset variable never becomes a map key', () => {
    // The old code did `process.env.STRIPE_PRICE_PRO || 'price_pro'`, so an
    // unset variable inserted the literal 'price_pro' as a price ID.
    assert.deepEqual(pricesFromEnv({} as NodeJS.ProcessEnv), {})
    assert.deepEqual(pricesFromEnv({ STRIPE_PRICE_PRO: '' } as NodeJS.ProcessEnv), {})
    assert.deepEqual(pricesFromEnv({ STRIPE_PRICE_PRO: 'price_pro' } as NodeJS.ProcessEnv), {})
  })

  test('a real price ID from the environment is added to the map', () => {
    const env = { STRIPE_PRICE_TEAM: 'price_1ZzzzzE5xpjM17G8abcdefgh' } as NodeJS.ProcessEnv
    assert.equal(pricesFromEnv(env)['price_1ZzzzzE5xpjM17G8abcdefgh']?.plan, 'TEAM')
    // ...without displacing anything known-good in code.
    assert.equal(priceMap(env)[MCPSPEND_PRO_MONTHLY]?.plan, 'PRO')
  })

  test('the environment can never make a foreign price ours by omission', () => {
    assert.equal(decideOwnership({ items: { data: [{ price: { id: WORKLIO_PRO } }] } }, {} as NodeJS.ProcessEnv).kind, 'unproven')
  })
})

describe('the price map', () => {
  test('covers all six MCPSpend recurring prices', () => {
    assert.equal(Object.keys(PRICE_TO_PLAN).length, 6)
  })

  test('contains no other product from the shared account', () => {
    assert.equal(PRICE_TO_PLAN[FLOWDESKONE_ENTERPRISE], undefined)
    assert.equal(PRICE_TO_PLAN[WORKLIO_PRO], undefined)
  })

  test('every price maps to a plan with a positive limit', () => {
    for (const info of Object.values(PRICE_TO_PLAN)) {
      assert.ok(['PRO', 'TEAM', 'ENTERPRISE'].includes(info.plan))
      assert.ok(info.limit > 0)
    }
  })
})
