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
    "description": "Generate a song from a prompt with optional custom lyrics and style inputs. Returns JSON describing the generated track when the request succeeds.",
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
      "description": "Generate a song from a prompt with optional custom lyrics and style inputs. Returns JSON describing the generated track when the request succeeds.",
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

Always sign the quote returned by the route you are calling. Do not hardcode a receiver, price, or network from a directory mirror.

## Complete the x402 flow

1. Send the intended request without payment.
2. Read the exact terms from the 402 response.
3. Sign an x402 v2 payment payload for one accepted requirement.
4. Retry the identical request with `PAYMENT-SIGNATURE`.
5. Read the result and settlement receipt.

Legacy `X-PAYMENT` callers remain supported during migration, but `PAYMENT-SIGNATURE` is the canonical header for new integrations.

## Product details

### Music generation, $0.50

`POST https://app.suedeai.ai/create-music`

Accepts a text prompt plus optional style and lyric controls. The live quote is `500000` atomic USDC.

### Video generation, $4.99

`POST https://app.suedeai.ai/agent/video`

Generates a short-form video from a prompt. The current live quote is `4990000` atomic USDC, or **$4.99**.

A successful call returns an 8-second 720p clip with native audio. The audio is generated from the scene rather than layered on afterwards, so prompts should carry sound cues — instruments, voices, weather, movement — to get an audible result. A still, silent scene renders near-silent by design.

### Image generation, $0.15

`POST https://app.suedeai.ai/agent/image`

Generates a still image from a prompt. The live quote is `150000` atomic USDC.

## Machine-readable descriptions

Three documents describe this catalog to agents and directories:

| Document | What it carries |
|---|---|
| [`/.well-known/x402.json`](https://app.suedeai.ai/.well-known/x402.json) | Canonical inventory: `provider`, `seller`, `marketplace`, and the three `resources` |
| [`/.well-known/x402`](https://app.suedeai.ai/.well-known/x402) | Extensionless alias, byte-identical to the `.json` document |
| [`/openapi.json`](https://app.suedeai.ai/openapi.json) | OpenAPI 3.1 service description, referenced from the discovery document as `seller.openapi` |

The `seller` block is how a caller finds the rest of them. It publishes `origin`, `wellKnown`, `wellKnownJson`, `openapi`, and the `payTo` receiving address.

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

## Frequently asked questions

**Do I need an API key or account?**
No. The 402 challenge carries the payment terms for a single request.

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
