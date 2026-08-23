# Suede x402 Media API

Suede exposes three public, machine-payable media products. Each route quotes its current price in an HTTP `402 Payment Required` response and settles in USDC on Base.

## Current public inventory

Verified against the live discovery document and unpaid 402 challenges on August 22, 2026.

| Endpoint | Product | Price | Atomic USDC |
|---|---|---:|---:|
| `POST /create-music` | Full-length song generation | **$0.50** | `500000` |
| `POST /agent/video` | Short-form video generation | **$4.99** | `4990000` |
| `POST /agent/image` | Still-image generation | **$0.15** | `150000` |

`POST /agent/video` returns an 8-second 720p clip with native audio. The audio is generated from the scene, so prompts should carry sound cues — instruments, voices, weather, movement. A still, silent scene renders near-silent by design.

Canonical discovery:

- [`https://app.suedeai.ai/.well-known/x402.json`](https://app.suedeai.ai/.well-known/x402.json)
- [`https://app.suedeai.ai/.well-known/x402`](https://app.suedeai.ai/.well-known/x402)

Both aliases publish the same three resources. If a route is not in that document, it is not a current public Suede media offering. The document also carries a `marketplace` block for directory listings, and its `seller.openapi` points at the OpenAPI 3.1 description at [`https://app.suedeai.ai/openapi.json`](https://app.suedeai.ai/openapi.json), which publishes the three paid `POST` routes alongside the three unpriced `GET` poll routes.

## Read a quote without paying

```bash
curl -sS -X POST https://app.suedeai.ai/create-music \
  -H "content-type: application/json" \
  -d '{"prompt":"slow-burn desert rock, baritone vocal, tremolo guitar"}'
```

The server responds with x402 v2 terms: a top-level `resource` descriptor and one `accepts` entry per accepted network, each carrying the atomic amount as both `amount` and `maxAmountRequired`, the USDC asset, the current receiver, `maxTimeoutSeconds`, a `docs` link, and an `extra` object holding the token name, version, decimals, and a `priceUsd` display string. This unpaid request does not spend funds. The full annotated body is in [`index.md`](index.md).

## Complete the x402 flow

1. Send the intended request without payment.
2. Read the exact terms from the 402 response.
3. Sign an x402 v2 payment payload for one accepted requirement.
4. Retry the identical request with `PAYMENT-SIGNATURE`.
5. Read the settlement receipt, then collect the asset from the poll URL.

Legacy `X-PAYMENT` callers remain supported during migration, but `PAYMENT-SIGNATURE` is the canonical header for new integrations.

## Asynchronous by default

Renders take minutes and payment clients time out at around 30 seconds, so **any request carrying a `PAYMENT-SIGNATURE` header runs asynchronously by default** on all three routes. The paid response hands back a poll URL rather than the finished asset. Polling never costs a second payment.

| Paid route | Async status | Poll route | Finished when |
|---|---|---|---|
| `POST /create-music` | `202` | `GET /api/songs/{songId}` | `model_version` leaves `pending` |
| `POST /agent/video` | `200` | `GET /agent/video/{jobId}` | `status` is `completed` and `videoUrl` is set |
| `POST /agent/image` | `200` | `GET /agent/image/{jobId}` | `status` is `completed` and `imageUrl` is set |

Two traps worth naming:

- **Video and image answer `200`, not `202`.** Only music returns `202`. A client gated on `202` will treat every successful video or image call as an error.
- **A poll for an unknown `jobId` answers `200` with `status: "failed"`, not `404`** — so it cannot be told apart from a genuinely failed render. Music differs again: an unknown `songId` returns `404`.

Music's poll returns the song row rather than a job envelope, and its `audio_url` holds a placeholder image until the render lands, so `model_version` is the only completion signal.

Pass `?async=false` to force the blocking call. The full contract, including the mode-precedence order and both response bodies, is in [`index.md`](index.md).

## Scope

- `/agent/generate` is retired. Use `/create-music`.
- Older `/v1/*` musician-tool profiles are not part of the current public three-product catalog.
- Internal or unlisted routes used by other Suede systems are not public product listings.
- Directory and documentation mirrors can lag. The live route challenge and well-known manifest win.
- The current video price is **$4.99**.
- Paid calls are asynchronous by default on all three routes.

The rendered reference lives at [x402.suedeai.ai](https://x402.suedeai.ai). Full page content is in [`index.md`](index.md).
