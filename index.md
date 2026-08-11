---
layout: default
title: "Suede x402 Media API: Music, Video, and Image Generation"
description: "Three pay-per-call media APIs over x402: music for $0.50, video for $4.99, and image for $0.15. USDC on Base, no API key."
permalink: /
---

# Suede x402 Media API

Suede exposes three public, machine-payable media products. Each route quotes its current price in an HTTP `402 Payment Required` response and settles in USDC on Base.

## Current public inventory

Verified against the live discovery document and unpaid 402 challenges on August 9, 2026.

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

The server responds with HTTP 402. The body includes x402 v2 terms such as:

```json
{
  "x402Version": 2,
  "accepts": [
    {
      "scheme": "exact",
      "network": "base",
      "amount": "500000",
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "payTo": "0x10FF767043A1723E0BB5B9207bC37D3442cC9E4F",
      "maxTimeoutSeconds": 300
    },
    {
      "scheme": "exact",
      "network": "eip155:8453",
      "amount": "500000",
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "payTo": "0x10FF767043A1723E0BB5B9207bC37D3442cC9E4F",
      "maxTimeoutSeconds": 300
    }
  ]
}
```

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

### Image generation, $0.15

`POST https://app.suedeai.ai/agent/image`

Generates a still image from a prompt. The live quote is `150000` atomic USDC.

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
The amount in the current 402 challenge. This page mirrors the live values as of August 9, 2026.

**Where are the machine-readable schemas?**
Use the [well-known discovery document](https://app.suedeai.ai/.well-known/x402.json) or the [developer documentation](https://app.suedeai.ai/developers).

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebAPI",
  "name": "Suede x402 Media API",
  "description": "Three pay-per-call x402 media products: full-length music generation for $0.50, video generation for $4.99, and image generation for $0.15.",
  "documentation": "https://app.suedeai.ai/developers",
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
