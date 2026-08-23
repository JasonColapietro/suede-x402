---
layout: default
title: "Suede x402 Media API: Music, Video, and Image Generation"
description: "Three pay-per-call media APIs over x402: music for $0.50, video for $4.99, and image for $0.15. USDC on Base, no API key."
permalink: /
---

# Suede x402 Media API

Suede exposes three public, machine-payable media products. Each route quotes its current price in an HTTP `402 Payment Required` response and settles in USDC on Base.

## Current public inventory

Verified against the live discovery document and unpaid 402 challenges on August 22, 2026.

| Endpoint | Product | Price | Atomic USDC |
|---|---|---:|---:|
| `POST /create-music` | Full-length song generation | **$0.50** | `500000` |
| `POST /agent/video` | Short-form video generation | **$4.99** | `4990000` |
| `POST /agent/image` | Still-image generation | **$0.15** | `150000` |

The live discovery document is the canonical public inventory:

- [`https://app.suedeai.ai/.well-known/x402.json`](https://app.suedeai.ai/.well-known/x402.json)
- [`https://app.suedeai.ai/.well-known/x402`](https://app.suedeai.ai/.well-known/x402)

Both aliases publish the same three resources. If a route is not in that document, it is not a current public Suede media offering.

All three are asynchronous for paid callers: the paid response hands back a poll URL rather than the finished asset. See [Asynchronous execution and polling](#asynchronous-execution-and-polling).

## Read a quote without paying

This request asks for the current terms. It does not attach a payment and does not spend funds:

```bash
curl -sS -X POST https://app.suedeai.ai/create-music \
  -H "content-type: application/json" \
  -d '{"prompt":"slow-burn desert rock, baritone vocal, tremolo guitar"}'
```

The server responds with HTTP 402. The body carries an `error` naming the missing header, a top-level `resource` descriptor, and one `accepts` entry per accepted network:

```json
{
  "x402Version": 2,
  "error": "PAYMENT-SIGNATURE header is required",
  "resource": {
    "url": "https://app.suedeai.ai/create-music",
    "description": "Generate a song from a prompt with optional custom lyrics and style inputs. Returns JSON describing the generated track when the request succeeds. PAYMENT-SIGNATURE-authenticated requests default to asynchronous execution. Asynchronous responses return 202 Accepted with a songId and pollUrl. Poll GET /api/songs/{songId} without another payment until model_version leaves 'pending' ('failed' is terminal); audio_url is a placeholder image until then and the finished MP3 after.",
    "mimeType": "application/json",
    "serviceName": "Suede AI",
    "tags": [
      "music",
      "song-generation",
      "text-to-music",
      "audio",
      "creative-ai"
    ]
  },
  "accepts": [
    {
      "scheme": "exact",
      "network": "base",
      "maxAmountRequired": "500000",
      "amount": "500000",
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "payTo": "0x10FF767043A1723E0BB5B9207bC37D3442cC9E4F",
      "maxTimeoutSeconds": 300,
      "docs": "https://app.suedeai.ai/developers",
      "extra": {
        "name": "USD Coin",
        "version": "2",
        "decimals": 6,
        "priceUsd": "$0.50"
      },
      "resource": "https://app.suedeai.ai/create-music",
      "description": "Generate a song from a prompt with optional custom lyrics and style inputs. Returns JSON describing the generated track when the request succeeds. PAYMENT-SIGNATURE-authenticated requests default to asynchronous execution. Asynchronous responses return 202 Accepted with a songId and pollUrl. Poll GET /api/songs/{songId} without another payment until model_version leaves 'pending' ('failed' is terminal); audio_url is a placeholder image until then and the finished MP3 after.",
      "mimeType": "application/json",
      "outputSchema": {
        "input": {
          "type": "http",
          "method": "POST",
          "discoverable": true,
          "bodyType": "json",
          "body": {
            "prompt": "<prompt>",
            "style": "<style>",
            "custom_mode": false,
            "lyrics": "<lyrics>",
            "make_instrumental": false,
            "vocal_gender": "m",
            "tags": "<tags>"
          }
        },
        "output": {
          "shareUrl": "https://app.suedeai.ai/share/example-track"
        }
      }
    }
  ]
}
```

Each `accepts` entry carries both `amount` and `maxAmountRequired`, holding the same atomic value. `extra.priceUsd` is a display string; the atomic value is what you sign. The live body also carries a second `accepts` entry for `eip155:8453`, identical to the one above apart from `network`, and an `extensions` object (`skyfire`, `bazaar`) with directory metadata. Both are elided from the sample.

`outputSchema.output` describes the **synchronous** result shape. On `/create-music` it shows `shareUrl`, which is what a blocking call returns; a paid call is asynchronous by default and answers with the `202` envelope described below. On `/agent/video` and `/agent/image` the live `outputSchema.output` already shows the asynchronous `jobId`/`pollUrl` envelope.

Always sign the quote returned by the route you are calling. Do not hardcode a receiver, price, or network from a directory mirror.

## Complete the x402 flow

1. Send the intended request without payment.
2. Read the exact terms from the 402 response.
3. Sign an x402 v2 payment payload for one accepted requirement.
4. Retry the identical request with `PAYMENT-SIGNATURE`.
5. Read the settlement receipt, then collect the asset. A paid call is asynchronous by default, so the body normally carries a `pollUrl` rather than the finished asset.

Legacy `X-PAYMENT` callers remain supported during migration, but `PAYMENT-SIGNATURE` is the canonical header for new integrations.

## Retry safely with an idempotency key

A render is charged when the job is created, so a client that times out and retries a paid `POST` without protection pays twice for one asset. All three paid routes accept an optional `X-Idempotency-Key` request header to prevent that.

| Property | Live value |
|---|---|
| Header | `X-Idempotency-Key` |
| Accepted on | `POST /create-music`, `POST /agent/video`, `POST /agent/image` |
| Required | No |
| Type | String, `maxLength` 200 |
| Effect | The same key with the same body, inside the cache TTL, returns the original response without re-charging the payer |

```bash
curl -sS -X POST https://app.suedeai.ai/agent/image \
  -H "content-type: application/json" \
  -H "PAYMENT-SIGNATURE: <signed x402 payload>" \
  -H "X-Idempotency-Key: 6f2a0f4c-98f7-4a1f-9f1f-2f7e0c1b53a9" \
  -d '{"prompt":"a lone neon sign in fog"}'
```

The OpenAPI description declares the header identically on all three paid `POST` routes, and on none of the poll routes — a poll is already unpriced and already repeatable.

**The length of the cache window is not published.** The live description names a TTL but gives no duration, so treat the replay window as unspecified rather than assuming a number. Keep the key attached for as long as you intend to retry that purchase.

Generate one key per intended purchase, reuse it across every retry of that purchase, and change it only when you want a second render. Both the key and the body have to match for the replay to apply, so give a changed prompt a new key.

## Asynchronous execution and polling

A paid call does not block until the asset is ready. Renders take minutes and x402 and Skyfire clients time out at around 30 seconds, so **any request carrying a `PAYMENT-SIGNATURE` header runs asynchronously by default**. This is the normal paid response on all three routes, not an opt-in. The response names a poll URL, and collecting the finished asset from it costs nothing extra.

### Choosing the mode

The execution mode is resolved in this order, first match winning:

1. `?async=true` or `?async=false` in the query string. Explicit, and always wins.
2. A `PAYMENT-SIGNATURE` header is present. Asynchronous.
3. Otherwise, synchronous.

The `async` query parameter is the only override the live contract publishes. It is declared on all three paid routes as a string enum of `"true"` and `"false"`; there is no request-body equivalent. Pass `?async=false` to force the blocking call, which is only workable if your client can hold a connection open for the whole render. Pass `?async=true` to queue an unpaid API-key call that would otherwise block.

### Poll routes

| Paid route | Async status | Poll route | Finished when |
|---|---|---|---|
| `POST /create-music` | `202` | `GET /api/songs/{songId}` | `model_version` leaves `pending` |
| `POST /agent/video` | `200` | `GET /agent/video/{jobId}` | `status` is `completed` and `videoUrl` is set |
| `POST /agent/image` | `200` | `GET /agent/image/{jobId}` | `status` is `completed` and `imageUrl` is set |

All three poll routes are unauthenticated and carry no price. The render was charged when the job was created, so **polling never costs a second payment**.

The two response shapes are not interchangeable. Music returns a `202` and a song row; video and image return a `200` and a job envelope.

### Music: 202 and a song row

`POST /create-music` answers HTTP `202 Accepted`:

```json
{
  "status": "processing",
  "shareUrl": "https://app.suedeai.ai/share/example-track",
  "songId": "0f5c9e2a-1d33-4c77-9a10-2b8e6d4f1c05",
  "pollUrl": "https://app.suedeai.ai/api/songs/0f5c9e2a-1d33-4c77-9a10-2b8e6d4f1c05"
}
```

`songId` is the last path segment of `pollUrl`. It can be `null` if the job is queued before its placeholder row exists, so read `pollUrl` rather than assembling the URL yourself.

`GET /api/songs/{songId}` returns the song row itself, not a job envelope. Read `model_version`:

- `pending` — queued or rendering. Keep polling.
- `failed` — terminal. Stop polling.
- A version label such as `v4.5` — done, and `audio_url` is the finished MP3.

`audio_url` is populated from the moment the row is created, holding the placeholder cover image — a reachable image URL, not audio. Its presence is not completion; `model_version` is the only completion signal. An unknown `songId` returns `404`.

### Video and image: 200 and a job envelope

`POST /agent/video` and `POST /agent/image` answer HTTP **`200`, not `202`**. Do not gate your client on a `202` for these two:

```json
{
  "jobId": "video-job-example",
  "status": "queued",
  "provider": "suede",
  "pollUrl": "https://app.suedeai.ai/agent/video/video-job-example"
}
```

The poll route returns the same shape, so one schema covers both the blocking and the polled path. `status` is `queued` or `processing` while the render runs, then the terminal `completed` or `failed`. Every field other than `jobId`, `status`, and `provider` is `null` until the render completes, at which point `videoUrl` or `imageUrl` is set. `pollUrl` is `null` on a poll response.

An unknown or expired `jobId` answers `200` with `status: "failed"` rather than `404`, so a poll cannot distinguish a bad identifier from a genuinely failed render. Keep the `pollUrl` you were given.

## Product details

### Music generation, $0.50

`POST https://app.suedeai.ai/create-music`

Accepts a text prompt plus optional style and lyric controls. The live quote is `500000` atomic USDC.

A paid call answers `202` with a `songId` and `pollUrl`. Poll `GET /api/songs/{songId}` until `model_version` leaves `pending`.

### Video generation, $4.99

`POST https://app.suedeai.ai/agent/video`

Generates a short-form video from a prompt. The current live quote is `4990000` atomic USDC, or **$4.99**.

A successful call returns an 8-second 720p clip with native audio. The audio is generated from the scene rather than layered on afterwards, so prompts should carry sound cues — instruments, voices, weather, movement — to get an audible result. A still, silent scene renders near-silent by design.

A paid call answers `200` with a `jobId` and `pollUrl`. Poll `GET /agent/video/{jobId}` until `status` is `completed` and `videoUrl` is set.

### Image generation, $0.15

`POST https://app.suedeai.ai/agent/image`

Generates a still image from a prompt. The live quote is `150000` atomic USDC.

A paid call answers `200` with a `jobId` and `pollUrl`. Poll `GET /agent/image/{jobId}` until `status` is `completed` and `imageUrl` is set.

## Machine-readable descriptions

Three documents describe this catalog to agents and directories:

| Document | What it carries |
|---|---|
| [`/.well-known/x402.json`](https://app.suedeai.ai/.well-known/x402.json) | Canonical inventory: `provider`, `seller`, `marketplace`, and the three `resources` |
| [`/.well-known/x402`](https://app.suedeai.ai/.well-known/x402) | Extensionless alias, byte-identical to the `.json` document |
| [`/openapi.json`](https://app.suedeai.ai/openapi.json) | OpenAPI 3.1 service description, referenced from the discovery document as `seller.openapi`. Publishes the three paid `POST` routes and the three unpriced `GET` poll routes |

The `seller` block is how a caller finds the rest of them. It publishes `origin`, `wellKnown`, `wellKnownJson`, `openapi`, and the `payTo` receiving address.

The OpenAPI description covers six operations: the three paid `POST` routes, plus `GET /api/songs/{songId}`, `GET /agent/video/{jobId}`, and `GET /agent/image/{jobId}`. Each poll route declares empty `security` — it takes no payment — and names its paid parent in `x-suede-poll-of`. `info.guidance` carries the same asynchronous contract in prose for agents that read only that field.

### The `marketplace` block

The discovery document carries a `marketplace` block for directories that list x402 services:

| Key | Live value |
|---|---|
| `providerName` | `Suede Labs` |
| `providerUrl` | `https://suedeai.ai` |
| `displayName` | `Suede AI` |
| `category` | `Creative AI` |
| `agenticMarketService` | `app.suedeai.ai` |
| `description` | Agent-paid music, video, and image generation with Base USDC settlement. |
| `keywords` | `agent commerce`, `music generation`, `video generation`, `image generation`, `x402`, `Base`, `USDC` |
| `homepage` | `https://suedeai.ai` |
| `docsUrl` | `https://app.suedeai.ai/developers` |
| `recommendedHeroPaths` | `/create-music`, `/agent/video`, `/agent/image` |
| `heroResources` | One entry per recommended hero path |

Each `heroResources` entry repeats `path`, absolute `url`, `method`, `priceUsd`, `providerName`, `providerUrl`, `category`, `title`, `description`, `keywords`, `useCase`, and `docsUrl`, and adds a `marketplacePriority`: `1` for `/create-music`, `2` for `/agent/video`, and `3` for `/agent/image`. A directory surfacing only part of the catalog should follow that order.

This block is listing metadata, not payment terms. Prices appear there as display strings such as `$4.99`; the atomic amount you sign still comes from the live 402 challenge.

## Scope and compatibility

- `/agent/generate` is retired. Use `/create-music`.
- Older `/v1/*` musician-tool profiles are not part of the current public three-product catalog.
- Internal or unlisted routes used by other Suede systems are not public product listings.
- Directory and documentation mirrors can lag. The live route challenge and well-known manifest win.
- No paid request is required to verify inventory, amount, asset, network, or receiver.
- Asynchronous execution is the default for paid callers on all three routes. A client that expects the finished asset in the paid response will misread every successful call.

## Frequently asked questions

**Do I need an API key or account?**
No. The 402 challenge carries the payment terms for a single request.

**Why did my paid call return a job id instead of the asset?**
That is the expected response. Renders take minutes and payment clients time out at around 30 seconds, so a `PAYMENT-SIGNATURE` request queues the job and returns a `pollUrl`. `GET` that URL until the job finishes.

**Does polling cost another payment?**
No. The render is charged when the job is created. All three poll routes are unpriced and unauthenticated.

**Can I get the old blocking behaviour back?**
Add `?async=false` to the paid request. Your client then has to hold the connection open for the full render, which is why it is not the default.

**How do I retry a paid call without paying twice?**
Send an `X-Idempotency-Key` header on the paid `POST` and reuse it for every retry of that purchase. The same key with the same body replays the original response instead of charging again. The length of the replay window is not published.

**Which asset and network are used?**
USDC on Base. The current USDC contract is `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`. Read the accepted network identifiers from the live challenge.

**Which price is authoritative?**
The amount in the current 402 challenge. This page mirrors the live values as of August 22, 2026.

**Where are the machine-readable schemas?**
Use the [well-known discovery document](https://app.suedeai.ai/.well-known/x402.json), the [OpenAPI 3.1 description](https://app.suedeai.ai/openapi.json), or the [developer documentation](https://app.suedeai.ai/developers). Each 402 challenge also carries an `outputSchema` for the route you called.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebAPI",
  "name": "Suede x402 Media API",
  "description": "Three pay-per-call x402 media products: full-length music generation for $0.50, video generation for $4.99, and image generation for $0.15.",
  "documentation": [
    "https://app.suedeai.ai/developers",
    "https://app.suedeai.ai/openapi.json"
  ],
  "provider": {
    "@type": "Organization",
    "name": "Suede Labs",
    "url": "https://suedeai.ai"
  },
  "offers": [
    {
      "@type": "Offer",
      "name": "Music generation",
      "price": "0.50",
      "priceCurrency": "USD",
      "url": "https://app.suedeai.ai/create-music"
    },
    {
      "@type": "Offer",
      "name": "Video generation",
      "description": "Text-to-video generation returning an 8-second 720p clip with native audio.",
      "price": "4.99",
      "priceCurrency": "USD",
      "url": "https://app.suedeai.ai/agent/video"
    },
    {
      "@type": "Offer",
      "name": "Image generation",
      "price": "0.15",
      "priceCurrency": "USD",
      "url": "https://app.suedeai.ai/agent/image"
    }
  ]
}
</script>
