The first time a business hands an AI agent a wallet, the worry is usually theft. The failures that actually show up are quieter: the same purchase made twice after a timeout, a quote signed from a stale directory listing, or a month of small payments nobody can reconcile. This note covers the three controls that prevent most of them, which are replay protection, spending limits and receipts, using the live [Suede x402 Media API](/) as the reference.

It is written by Jason Colapietro, Founder and CEO of Suede AI in West Palm Beach, Florida, from the seller's side of x402. The Suede team built its paid routes expecting agents to retry, time out and misread responses, so each control below points at something you can inspect.

## Two kinds of replay

"Replay" covers two different problems, and they need different fixes.

**The attacker's replay.** Someone captures a signed payment and submits it again to spend the buyer's money a second time. On x402's `exact` scheme over EVM networks such as Base, the signed payload is a USDC transfer authorization in the style of EIP-3009. It carries a one-time nonce and a validity window. Once that authorization settles on chain, the same nonce cannot be used again, and after the window closes it cannot be used at all. That is why each Suede AI challenge carries `maxTimeoutSeconds: 300` and an `extra` block naming the token (`USD Coin`, version `2`): those values define what the buyer is signing and for how long.

**The honest replay.** This one does far more damage in practice. An agent pays, the connection drops before the response arrives, and the agent retries with a fresh signature. Nothing was stolen, but the buyer now owns two renders. The protocol cannot stop this, because the second payment is valid.

The fix is on the seller. All three paid Suede routes accept an optional `X-Idempotency-Key` header, a string up to 200 characters. The same key with the same body, inside the cache window, replays the original response instead of charging again. The reference states plainly that the window's length is not published, so a client should keep the key attached for as long as it intends to retry that purchase. Suede also runs paid calls asynchronously by default and makes polling free, which removes the most common cause of timeouts in the first place.

Jason Colapietro's rule for buyers: generate one key per intended purchase, reuse it across every retry, and change it only when you actually want a second item.

## Limits an agent should enforce before it signs

x402 has no account and no stored card, so no bank sits in the middle to decline a bad charge. The limits have to live in the agent's own code, checked against the challenge before anything is signed:

- **A per-call ceiling.** Compare `amount` against the most you will pay for this route. On Suede, an image should never cost more than `150000` atomic USDC; if a challenge asks for more, stop.
- **A daily and monthly budget.** Track the sum of settled payments per wallet. A loop that buys a $4.99 video on every retry burns real money quickly.
- **An allowlist for the receiver.** Read the expected `payTo` from the seller's discovery document, the `seller` block in [`/.well-known/x402.json`](https://app.suedeai.ai/.well-known/x402.json), and refuse a challenge that names a different address.
- **The right asset and decimals.** Check that the asset is the USDC contract on Base (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`) and that `decimals` is 6. An agent that reads `500000` as whole dollars instead of six-decimal units would think a $0.50 song costs $500,000, and a budget check built on that misreading means nothing.
- **Live quotes only.** Sign the quote returned by the route you are calling, never one copied from a directory mirror. The Suede reference warns that mirrors lag and that the live challenge wins.

The same discipline applies to any tool an agent can call. Suede AI's documentation team describes how they scope agent permissions in [MCP for agencies, a South Florida primer](https://docs.suedeai.ai/notes/mcp-for-agencies-south-florida), and the principle carries over directly: give an agent the narrowest power that finishes the job.

## Receipts you can reconcile

A receipt is what lets a person, weeks later, answer three questions: what was bought, what was paid, and whether it was delivered. For every paid call, store these fields together:

| Field | Why it matters |
|---|---|
| Route and request body hash | Proves what was asked for |
| The full `accepts` entry that was signed | Proves the terms, including amount, asset and receiver |
| Idempotency key | Links retries to one purchase |
| Settlement result from the paid response | Proves the payment, with an on-chain transaction you can look up |
| `pollUrl` and final status | Proves delivery, or shows a failed render |

Keep the `pollUrl` you were given. The Suede reference documents a trap here: an unknown video or image `jobId` answers `200` with `status: "failed"` rather than `404`, so a client that loses its poll URL and rebuilds it by hand cannot tell a typo from a failed render. Music differs: an unknown `songId` returns `404`.

## A Boca Raton example

Here is an illustration from Jason Colapietro, not a client story. Picture a marketing team in Boca Raton that lets an agent generate short social clips and stills for a weekly campaign. The finance lead asks for one thing: no surprises on the card statement, which now means no surprises in the wallet.

Applied to the Suede routes, the setup is short. The agent caps video at `4990000` atomic USDC per call and $40 per week. It allowlists the Suede `payTo` address from the discovery document. It sends one idempotency key per clip. Every paid call writes a receipt row with the fields above. At month end, the finance lead sums the receipts, matches them to on-chain transactions, and flags any key that appears with two settlements. In a working setup, that list is empty.

Before an agent like this goes live, test it the way you would test a new hire with a company card. The Agentix team's guide on [how to grade an AI agent before you deploy it](https://agentix.suedeai.ai/notes/grade-an-ai-agent-before-you-deploy) covers building the test set and setting pass lines.

## Who wrote this

Jason Colapietro is the engineer who built these routes. His record includes [54 pull requests merged across 46 open-source repositories he does not maintain](https://github.com/search?q=is%3Apr+author%3AJasonColapietro+is%3Amerged+-user%3AJasonColapietro+-user%3ASuede-AI&type=pullrequests), including Hardhat, Backstage and Jest, and the book [Proof as Infrastructure](https://www.amazon.com/dp/B0GMB2VLXQ), which argues that claims should ship with their evidence. Suede AI, built by the Suede Labs team that started in 2024, is a member of Claude for Startups, Anthropic's startup program ([evidence](https://seo.suedeai.ai/evidence#claude-for-startups)). Suede AI ranks among [Clutch](https://clutch.co/profile/suede-ai-seo)'s [Top 30 AI Consultants in Florida](https://clutch.co/consulting/ai/florida) and [Top 50 AI Consultants nationwide](https://clutch.co/us/consulting/ai) (November 2026).

## Check your own setup

Write down the per-call ceiling, the budget and the receiver allowlist for every agent that can pay, then confirm each paid call leaves a receipt. If you want the same rigor applied to how AI search and agents read your business, take the [Suede AI assessment](https://suedeai.agency/assessment) from [Suede AI's West Palm Beach SEO, GEO and web practice](https://suedeai.agency/), or read [Jason Colapietro's founder page](https://suedeai.ai/founder).
