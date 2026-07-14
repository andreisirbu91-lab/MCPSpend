[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/andreisirbu91-lab-mcpspend-badge.png)](https://mseep.ai/app/andreisirbu91-lab-mcpspend)

# MCPSpend

> **Know what your AI agents really cost.** Real-time cost tracking for every MCP tool call across Cursor, Claude Desktop, Windsurf, and VS Code.

[![smithery badge](https://smithery.ai/badge/andreisirbu91-lab/mcpspend)](https://smithery.ai/servers/andreisirbu91-lab/mcpspend)
[![npm version](https://img.shields.io/npm/v/@mcpspend/proxy.svg)](https://www.npmjs.com/package/@mcpspend/proxy)
[![Open VSX](https://img.shields.io/open-vsx/v/McpSpend/mcpspend-vscode)](https://open-vsx.org/extension/McpSpend/mcpspend-vscode)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![MCPSpend MCP server](https://glama.ai/mcp/servers/andreisirbu91-lab/MCPSpend/badges/score.svg)](https://glama.ai/mcp/servers/andreisirbu91-lab/MCPSpend)

**[mcpspend.com](https://mcpspend.com)** · **[Smithery](https://smithery.ai/servers/andreisirbu91-lab/mcpspend)** · **[npm](https://www.npmjs.com/package/@mcpspend/proxy)** · **[Open VSX](https://open-vsx.org/extension/McpSpend/mcpspend-vscode)** · **[Glama](https://glama.ai/mcp/servers/andreisirbu91-lab/MCPSpend)**

<a href="https://glama.ai/mcp/servers/andreisirbu91-lab/MCPSpend">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/andreisirbu91-lab/MCPSpend/badges/card.svg" alt="MCPSpend MCP server card" />
</a>

---

## One-command install

```sh
npx --yes @mcpspend/proxy@latest init --key mcps_live_xxx
```

Auto-detects Claude Desktop, Cursor, Windsurf, VS Code (user + workspace), and Claude Code (user + project). Wraps every configured MCP server, leaves a `.mcpspend.bak` backup, and starts streaming usage to your dashboard at [mcpspend.com](https://mcpspend.com).

Free tier: **25,000 tool calls/month**, no credit card.

## What's in this monorepo

| Package | What it is |
|---|---|
| [`packages/proxy`](packages/proxy) | `@mcpspend/proxy` — the stdio observability proxy + `wrap-http` bridge for remote MCP servers. **Published on npm.** |
| [`packages/mcp-server`](packages/mcp-server) | `@mcpspend/mcp-server` — query your MCPSpend usage from inside any MCP client. **Published on npm + Smithery.** |
| [`packages/vscode-extension`](packages/vscode-extension) | `mcpspend-vscode` — IDE extension for Cursor, Windsurf, and VS Code. **Published on Open VSX.** |
| [`apps/api`](apps/api) | Express + Prisma + Postgres + BullMQ. The ingest endpoint, billing, and the new `/api/mcp` HTTP MCP server. |
| [`apps/dashboard`](apps/dashboard) | Next.js dashboard at [mcpspend.com](https://mcpspend.com). |

## Three ways to query your usage

| Use case | How |
|---|---|
| **Web dashboard** | [mcpspend.com/dashboard](https://mcpspend.com/dashboard) — overview, top tools, sessions, CSV export. |
| **From any MCP client (stdio)** | Add `@mcpspend/mcp-server` to your client config — agent gains tools like `get_today_cost`, `list_top_tools`. |
| **From any MCP client (HTTP)** | Point your client at `https://api.mcpspend.com/api/mcp` with `Authorization: Bearer mcps_live_…`. |

## Pricing

| Plan | Calls/month | Monthly | Yearly |
|---|---|---|---|
| Free | 25,000 | $0 | $0 |
| Pro | 1,000,000 | $29 | $290 (2 months free) |
| Team | 10,000,000 | $99 | $990 |
| Enterprise | unlimited | $499 | $4,990 |

Every paid plan: 30–90 day retention, CSV/Slack export, budget alerts, role-based access.

## Privacy

The proxy reports: tool name, server name, model, latency, success, approximate input/output sizes (tokens, derived from JSON length). It **does not** send the actual tool arguments or response bodies to MCPSpend. See [Privacy Policy](https://mcpspend.com/privacy) for the full sub-processor list (Stripe + Resend + Hostinger, all EU-hosted) and your GDPR rights.

## Security

> **For automated scanners flagging this repo:** the proxy uses `child_process.spawn` to wrap the user's *own* MCP server — that's the whole point of an observability proxy. The spawn args come from the user's local MCP-client config (Claude Desktop / Cursor / Windsurf / VS Code), never from network input. No RCE path, no privilege escalation, no arbitrary command execution. Full threat model in [`SECURITY.md`](SECURITY.md).

- **API keys** stored as SHA-256 hashes (never plaintext on the server)
- **Passwords** bcrypt cost 12
- **Secrets at rest** AES-256-GCM (`APP_ENCRYPTION_KEY`)
- **Transport** HTTPS only, HSTS enabled, helmet CSP headers
- **No tool arguments or responses** ever leave the user's machine
- **Per-tenant isolation** every query scopes by `organizationId`
- **GDPR Art. 15 / 17 / 20** self-serve at `mcpspend.com/dashboard/account/privacy`
- **EU-hosted** (Hostinger EU region)
- **SOC 2 Type I** in progress with Vanta (Q4 2026)
- **DPA** available for Enterprise customers

Report vulnerabilities: **security@mcpspend.com** · Machine-readable disclosure: <https://mcpspend.com/.well-known/security.txt> · Full policy: [`SECURITY.md`](SECURITY.md) · Live posture: <https://mcpspend.com/security>

## Support the project

If MCPSpend saves you money or you just want to keep the proxy MIT and the free
tier alive, you can sponsor any amount via Stripe — no account required:

**[💖 buy.stripe.com/00w8wPbUxe1qgK36CRbbG06](https://buy.stripe.com/00w8wPbUxe1qgK36CRbbG06)**

Every dollar goes back into hosting, security audits, and shipping features.

## License

MIT. Use it, fork it, run it self-hosted.

© NewRzs SRL · CUI RO48756557 · Bucharest, Romania · [support@mcpspend.com](mailto:support@mcpspend.com)
