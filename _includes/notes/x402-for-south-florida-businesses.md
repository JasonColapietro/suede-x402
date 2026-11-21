A software agent can already find a Boca Raton caterer's menu, compare it with three competitors and draft the order. What it usually cannot do is pay without a person typing in a card number, and that gap is exactly what x402 closes. This note explains the protocol in plain terms for owners and operators in West Palm Beach, Jupiter and the rest of Palm Beach County, using the live [Suede x402 Media API](/) as the worked example.

It was written by Jason Colapietro, the West Palm Beach engineer who founded Suede in 2024, for the people who keep asking him the same question: is this real, and does it matter for a business that is not a crypto company?

## What x402 actually is

HTTP, the protocol under every website, has carried a status code called `402 Payment Required` since the 1990s. For most of that time it was marked "reserved for future use" and nobody used it. x402 is an open protocol, first published by Coinbase in 2025, that finally gives that status code a job.

The flow has four steps, and every one of them is visible on [the Suede x402 reference page](/):

1. A client, often an AI agent, sends an ordinary request to a paid URL.
2. The server answers `402` with machine-readable terms: the price, the accepted asset and network, who gets paid and how long the quote stays valid.
3. The client signs a payment for exactly those terms.
4. It retries the identical request with the signature in a `PAYMENT-SIGNATURE` header, and the server does the work.

There is no account, no API key and no invoice. The price travels with the request. On the Suede routes the asset is USDC on Base and the amounts are small and exact: $0.50 for a full-length song, $4.99 for an 8-second video clip with native audio and $0.15 for a still image.

## Why a Palm Beach County business should care

Most local businesses will never sell media to software, and Jason Colapietro is the first to say so. The reason to pay attention is that the buyer is changing. AI assistants increasingly act on behalf of a person, and when an assistant books, orders or buys, it needs a path that is machine-readable from quote to receipt. A contact form or a "call for pricing" line is a dead end for it.

Three kinds of South Florida businesses have an obvious early fit:

- **Data and report sellers.** Picture a Jupiter marine-conditions service, a West Palm Beach property-records researcher or a Palm Beach Gardens market analyst. Each could price a single lookup at a few cents and let agents buy it per call instead of selling only annual subscriptions.
- **Digital deliverables.** Templates, generated documents, licensed photos and short audio. Anything delivered as a file can be quoted in a 402 response and handed back after payment.
- **Deposits and holds.** A fishing charter out of Jupiter Inlet, a dinner reservation on Clematis Street or a service call in Tequesta can take a small deposit before the slot is confirmed.

These are illustrations, not client stories. The point is that per-request pricing suits anything an agent might want to buy once, quickly and without a sales call.

## What it takes to accept x402

Jason Colapietro's team learned the following by shipping the Suede media routes, and each item maps to something you can inspect on this site:

- **Put the price in the challenge, not only on a web page.** The 402 response is the source of truth. The Suede reference says it plainly: the amount in the live challenge wins over any mirror, including this site.
- **Publish a discovery document.** Every paid Suede route is listed at [`/.well-known/x402.json`](https://app.suedeai.ai/.well-known/x402.json), with an [OpenAPI 3.1 description](https://app.suedeai.ai/openapi.json) beside it. Agents and directories read it to learn what you sell.
- **Make retries safe.** Agents retry when a network hiccups. The routes accept an `X-Idempotency-Key` header, so a retried purchase replays the original response instead of charging twice.
- **Do slow work asynchronously.** Payment clients time out at around 30 seconds. A render that takes minutes returns `202` with a poll URL, and polling never costs a second payment.
- **Keep a human-readable page.** Owners, bookkeepers and search engines still need to read what you sell. That is why this reference exists alongside the machine endpoints.

## The tradeoffs to plan for

x402 is useful, and it comes with real operating questions. Settlement in a stablecoin means you hold USDC and need a plan for conversion and bookkeeping, so bring your accountant in early. A signed payment is final, which means there is no card-network chargeback; you write and honor your own refund policy. Agent purchase volume is still modest in most local categories, so treat x402 as a second checkout path next to the one you already run, not a replacement. Keep amounts small while the tooling and the rules mature.

None of this requires rebuilding your website. The first step is making your offer machine-readable at all: clear prices, structured data and an `llms.txt` file. That work pays off in AI search today, before a single agent pays you.

## Who is writing this

Suede builds this in public. Jason Colapietro has merged [54 pull requests across 46 open-source repositories he does not maintain](https://github.com/search?q=is%3Apr+author%3AJasonColapietro+is%3Amerged+-user%3AJasonColapietro+-user%3ASuede-AI&type=pullrequests), including Jest, Adobe React Spectrum, Backstage and the Polkadot SDK. Suede was accepted into the Stripe Startups program on July 31, 2026, and is a member of Claude for Startups, Anthropic's startup program ([proof](https://suedeai.ai/seo/evidence#claude-for-startups)).

The local search work has outside recognition too. On October 31, 2026, Suede SEO ranked #1 among Palm Beach County-based companies listed in [The Manifest's Florida AI Deployment directory](https://themanifest.com/artificial-intelligence/consulting/deployment/companies/florida) and top 25 statewide, as documented on the [Suede recognition page](https://suedeai.agency/company/recognition). Suede ranks among [Clutch](https://clutch.co/profile/suede-ai-seo)'s [Top 30 AI Consultants in Florida](https://clutch.co/consulting/ai/florida) and [Top 50 AI Consultants nationwide](https://clutch.co/us/consulting/ai) (November 2026).

If you want to see how other agents are judged before you let them buy from you, the [Agentix agent grading notes](https://agentix.suedeai.ai/notes) cover that side. For a readiness check on your own site, read the [AI readiness notes from Suede Scan](https://optimize.suedeai.ai/notes).

## Your next step

Find out whether agents can read your business before you ask them to pay it. Take the [Suede assessment](https://suedeai.agency/assessment) from Suede's [West Palm Beach SEO, GEO and web practice](https://suedeai.agency/), and let Jason Colapietro's team show you what an AI assistant sees when it looks at your site today.
