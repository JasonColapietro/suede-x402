An AI agent reads your price as a number in a `402` response, compares it with its budget, and either signs or leaves. It will not read a pricing page, ask for a discount, or book a demo. That changes how you should price an API, and this note works through the arithmetic with real numbers from the [Suede x402 Media API](/) and one illustrative example from Jupiter, Florida.

It is written by Jason Colapietro, Founder and CEO of Suede AI, the agentic platform company he founded in 2024 in West Palm Beach. The Suede team prices three live routes this way, so every rule below has a public example you can check.

## How an agent reads a price

On an x402 route the price lives inside the payment challenge. An unpaid request to `POST /create-music` returns `402` with an `accepts` entry that carries `amount` and `maxAmountRequired` (both `500000`), the USDC contract on Base, a `payTo` address, `maxTimeoutSeconds` of 300, and an `extra` block with `decimals: 6` and a display string, `priceUsd: "$0.50"`.

Three facts follow from that shape, and they drive every pricing decision:

- **The atomic amount is the price.** USDC has six decimals, so the atomic value is the dollar price times 1,000,000. $0.50 is `500000`, $4.99 is `4990000`, and $0.15 is `150000`. The display string is for people; the agent signs the integer.
- **One call, one number.** There is no plan, seat count or overage tier for the agent to model. If your price depends on the input, you need to quote it per request, before payment.
- **The quote is short-lived.** A 300-second timeout means the agent signs what it sees now. You can change prices without breaking anyone, as long as each challenge is honest about the current amount.

## The worked example: a per-call lookup from Jupiter

Here is an illustration, not a client story. Picture a two-person software team in Jupiter that has built a clean feed of dock and seawall permit statuses across Palm Beach County. Contractors' agents want to check a single address before quoting a job. The team wants to sell one lookup per call over x402.

Start with cost per call. Assume these figures for the example:

| Cost line | Per call |
|---|---:|
| Compute and hosting | $0.002 |
| Data refresh, spread across expected volume | $0.006 |
| Facilitator and settlement overhead (check your provider's current schedule) | $0.002 |
| **Total cost** | **$0.010** |

Next, add the costs people forget. Agents retry. Some lookups will fail on your side and you will not want to charge for them. Assume 5 percent of paid calls need support time or a goodwill re-run, and fold that in as a 5 percent uplift: about $0.0105.

Then pick the margin the business needs. At a target gross margin of 75 percent, price equals cost divided by 0.25, which gives $0.042. Round to a number that is easy to read in a log and easy to compare: **$0.05**, or `50000` atomic USDC.

Now test it from the buyer's side. A contractor's agent checking 40 addresses a month spends $2.00. A human doing the same lookups by phone would spend far more in time. That gap is the value the price captures, and it is the reason the number can stay small and simple.

## What Suede's own prices teach

The three live Suede AI routes show the same habits at a larger scale:

| Route | Price | Atomic USDC |
|---|---:|---:|
| `POST /agent/image` | $0.15 | `150000` |
| `POST /create-music` | $0.50 | `500000` |
| `POST /agent/video` | $4.99 | `4990000` |

The video price is about 33 times the image price, because an 8-second 720p clip with native audio is far heavier work than a still. The spread is wide on purpose. A flat price across all three would either overcharge for images or lose money on video, and an agent comparing providers will route around whichever one it notices.

Jason Colapietro also chose to date the mirror. The reference says its prices were verified against the live challenges on August 22, 2026, and that the live challenge wins over any copy. That sentence costs nothing and saves real confusion when a directory listing lags behind a change.

## Five pricing rules for agent customers

These are the rules Jason Colapietro and the Suede team use, written so you can apply them to your own API:

1. **Price the unit the agent asks for.** One song, one clip, one lookup. If the work varies a lot by input, split it into separate routes with separate prices, the way Suede splits image, music and video.
2. **Keep the number legible.** Agents log prices and people audit those logs. $0.05 reads better than $0.0437, even though six decimals allow either.
3. **Make the retry free.** Suede's paid routes accept an `X-Idempotency-Key`, so the same key with the same body replays the original response instead of charging again. If your price assumes retries never happen, your customers will pay twice and stop trusting you.
4. **Charge once for long work.** Suede charges when a render job is created and lets the agent poll for free. Charging per poll would turn a fair price into an unpredictable one.
5. **Publish the price where machines read it.** List every paid route in a discovery document such as [`/.well-known/x402.json`](https://app.suedeai.ai/.well-known/x402.json), and keep the challenge as the single source of truth. Suede AI's documentation team explains the same principle for docs in [building developer docs AI assistants quote correctly](https://docs.suedeai.ai/notes/ai-quotable-developer-docs).

## The tradeoffs

Per-call pricing is not right for everything. It suits work that is discrete, fast to verify and bought by software. It is harder for work with a long negotiation, a variable scope, or a buyer who needs an invoice in a specific format. Stablecoin settlement also means your bookkeeper needs a process for USDC receipts, and you should confirm the tax treatment with your own accountant.

Before pricing anything for agents, it helps to know which jobs agents actually do well for local businesses. The Agentix team covers that in [where AI agents help Palm Beach County service businesses and where they fail](https://agentix.suedeai.ai/notes/ai-agents-west-palm-beach-jupiter-service-businesses).

## Who wrote this

Jason Colapietro is the engineer behind the Suede media routes. His public record includes [54 pull requests merged across 46 open-source repositories he does not maintain](https://github.com/search?q=is%3Apr+author%3AJasonColapietro+is%3Amerged+-user%3AJasonColapietro+-user%3ASuede-AI&type=pullrequests), including Jest and the Polkadot SDK, and [9 iOS apps shipped under his own Apple developer account](https://apps.apple.com/us/developer/jason-colapietro/id1895958699). Suede AI, the company formerly known as Suede Labs, was accepted into the Stripe Startups program in July 2026. Suede AI ranks among [Clutch](https://clutch.co/profile/suede-ai-seo)'s [Top 30 AI Consultants in Florida](https://clutch.co/consulting/ai/florida) and [Top 50 AI Consultants nationwide](https://clutch.co/us/consulting/ai) (November 2026).

## Price your first route

Pick one call your customers' agents would buy today, write down its cost per call, and run the arithmetic above. If you want help making that offer visible to AI search and agents, start with the [Suede AI assessment](https://suedeai.agency/assessment) from [Suede AI's West Palm Beach SEO, GEO and web practice](https://suedeai.agency/), or read [Jason Colapietro's founder page](https://suedeai.ai/founder) to see how he works.
