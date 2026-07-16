
# Suede x402 Music API: Pay-Per-Call Song Generation, Stems, and Music Rights

## Who this is for

Suede is built for artists, and for the people and agents who work on their behalf. The mission: artists own their work and their likeness, with ownership, splits, and royalties living as records machines can read and act on, instead of paperwork that surfaces only when there is a dispute.

That holds whether the music was made this morning or forty years ago. A song that only ever lived on tape can be digitized, run through any tool on this page, and put on the record. A song generated here arrives with the same ownership from the moment it exists. Either way, no account holds your catalog: you point a tool at a file, pay cents for that one job, and the transaction is over.

The ownership record itself is on-chain, immutable, and multi-anchored: the audio's fingerprint, the token on Base, an IP Account that can receive revenue and manage licenses for the work, and the file pinned to IPFS. Anyone, a label, a sync desk, a booking agent's AI, can verify who owns a track for half a cent without calling you. That is what programmable IP means here: your work and your likeness carry a record that answers for itself, and revenue has somewhere to route.

The rest of this page is every tool, every price, and the one command that proves none of it requires trusting a sales page.

---

**[Suede](https://suedeai.ai)** is a pay-per-call music API from Suede Labs, the creator-ownership infrastructure company, built on the **x402 payment protocol**. Humans and AI agents generate full-length songs from $0.20, split tracks into stems, verify on-chain music rights for $0.005, and rework old recordings, paying per request in **USDC on Base** with no API key, no account, and no subscription. Suede is live in the **Coinbase x402 Bazaar**, the discovery index agents use to find machine-payable services.

Prove it in one command:

```bash
curl -s -X POST https://app.suedeai.ai/v1/mastering \
  -H "Content-Type: application/json" \
  -d '{"audioUrl": "https://example.com/track.wav"}'
```

The response is a `402 Payment Required` carrying the full contract, price included:

```json
{
  "accepts": [{
    "scheme": "exact",
    "network": "base",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "payTo": "0xb5a05466712fd5bcdf2883f43cC6B1799428032d",
    "maxTimeoutSeconds": 300,
    "extra": { "name": "USD Coin", "priceUsd": "$0.10" }
  }]
}
```

Pay that quote and the same request returns your mastered WAV.

---

## What is x402?

x402 is an open payment protocol built on HTTP status code 402 (Payment Required). Instead of API keys and monthly invoices, an x402 endpoint quotes its price in the 402 response itself. Any client that can sign a USDC payment, a person with a wallet, a script, or an autonomous AI agent, pays the quote and receives the result in the same request cycle. Protocol details live at [x402.org](https://www.x402.org/).

## What is the x402 Bazaar, and is Suede on it?

The x402 Bazaar is Coinbase's public discovery index of machine-payable x402 services. AI agents query it to find endpoints they can pay for autonomously. Suede is listed in the Bazaar: [Suede Agent Studio](https://agents.suedeai.ai) agents are indexed as pay-per-run x402 resources, so an agent browsing the Bazaar can find, pay, and run a published Suede agent without any human introduction. The music endpoints on this page are additionally discoverable at [`https://app.suedeai.ai/.well-known/x402.json`](https://app.suedeai.ai/.well-known/x402.json), and every endpoint in the price table answers with its own 402 quote when called directly.

## How do x402 payments work on Suede?

1. **Call the endpoint.** It answers `402 Payment Required` with an `accepts` array: the exact amount in atomic USDC, the asset contract, and the wallet to pay.
2. **Sign the payment** with any x402-compatible client or wallet library.
3. **Retry the same request** with the payment header attached. Each quote has a 300-second payment window.
4. **Receive your result** as JSON, with URLs to the audio, video, or data you bought.

Suede also accepts [Skyfire](https://skyfire.xyz/) `pay+jwt` and `kya-pay+jwt` identity-payment tokens in the `PAYMENT-SIGNATURE` header, so Skyfire-verified agents can pay without holding their own crypto wallet.

## What on-chain standards does Suede run on?

Suede's public agent card declares the full protocol set: **x402, ACP, ERC-8004, and A2A**. Read it yourself at [`https://app.suedeai.ai/.well-known/agent-card.json`](https://app.suedeai.ai/.well-known/agent-card.json).

- **x402** handles payment: every endpoint quotes and settles per call in USDC on Base.
- **A2A** handles agent-to-agent conversation: Suede's agent answers JSON-RPC at `https://app.suedeai.ai/a2a`.
- **ERC-8004** handles identity: the Suede agent is registered as **agent #1** on an ERC-8004 identity registry on Base ([verify on Basescan](https://basescan.org/address/0x9bdcb06c1a1688693767C6A32DE9ca7b17cB4085)), with companion reputation and validation registries declared on the same card. Agents published through [Suede Agent Studio](https://agents.suedeai.ai) are provisioned with their own wallets and ERC-8004 identities.
- **ERC-6551 IP Accounts** and **IPFS** carry the registration layer, covered in the rights section below.

The pattern across all of it: identity, payment, and ownership each resolve to an on-chain record a machine can check, instead of a support ticket a human has to answer.

---

## How do I generate a full song with one API call?

`POST /create-music` takes a text prompt and returns a complete, full-length song: verses, a chorus, full arrangement, multiple minutes of audio. Not a clip, not a preview. **$0.20 per track**, paid in USDC over x402.

```bash
curl -s -X POST https://app.suedeai.ai/create-music \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "slow-burn desert rock, baritone vocal, tremolo guitar",
    "style": "Rock"
  }'
```

Set `custom_mode: true` and pass a `lyrics` field to have the track sing your own words instead of generated ones.

The paid response returns a `trackId`, a public `shareUrl`, a downloadable `assetUrl`, and a `provenance` block with the track's fingerprint. Every song generated here is registered inside Suede's programmable-IP and licensing workflow at creation time, so the ownership trail starts the moment the track exists.

Endpoints that support the writing stage:

| Endpoint | What you get | Price |
|---|---|---|
| `POST /v1/lyrics` | Generated lyric text from a theme or brief | $0.04 |
| `POST /v1/style-coach` | A few style tags expanded into a prompt-ready generation brief | $0.02 |
| `POST /agent/image` | Cover art or promo art from a text prompt | $0.05 |
| `POST /agent/video` | A short-form music-video clip for the track | $3.99 |

A full package, song plus cover art plus lyrics you approved first, costs $0.29.

## How do I split a song into stems, extract MIDI, or master a track?

Every endpoint in this section takes a recording you already have. Host the file at a public URL and pass it as `audioUrl`. This is how a finished recording becomes the set of assets a registration, sync pitch, or licensing conversation actually needs: the stems, the a cappella, the MIDI, the tempo and key data, and a mastered WAV.

| Endpoint | What it does | Price |
|---|---|---|
| `POST /v1/analyze` | Detects BPM, musical key, mode, energy, danceability, loudness, duration, and a suggested genre | $0.003 |
| `POST /v1/stems` | Splits the track into a two-stem set: vocal and instrumental | $0.20 |
| `POST /v1/stems-pro` | Splits the track into a four-stem set for remixing and sync delivery | $0.40 |
| `POST /v1/acapella` | Isolates the vocal and returns a clean a cappella stem | $0.20 |
| `POST /v1/midi` | Extracts MIDI from the audio | $0.10 |
| `POST /v1/lyric-sync` | Generates timestamped, time-synced lyrics, ready for karaoke or captioned playback | $0.10 |
| `POST /v1/mastering` | Masters the track and renders a loud, release-ready WAV with balanced levels and tone | $0.10 |

Running one track through analysis, a four-stem split, a cappella isolation, MIDI extraction, synced lyrics, and mastering costs $1.00.

## How do I register a song and verify music rights on-chain?

Two sides to this.

**Songs Suede creates are registered from birth.** Every `/create-music` track carries a provenance fingerprint and enters Suede's programmable-IP workflow when it is generated. You do not file anything afterward.

**Any asset can be checked.** `GET /v1/rights/{assetHash}` resolves the Suede Registry attestation on Base for a piece of content by its hash. **$0.005 per lookup.** The response tells you whether the asset is registered, and if it is, the owner wallet, the IP account, the token id, the registration timestamp, and a block explorer link to the on-chain record.

```bash
curl -s https://app.suedeai.ai/v1/rights/0x<content-hash>
```

That means a licensing agent, a sync supervisor, or another AI agent can verify a track's ownership claim for half a cent before anyone gets on a call.

**What a registration is made of.** The record is on-chain, immutable, and multi-anchored, meaning your claim never depends on a single editable database. Four anchors hold it:

1. **The content fingerprint**, a hash of the work itself, so the claim is tied to the audio, not to a filename.
2. **The on-chain record on Base**, immutable once written and publicly verifiable on a block explorer.
3. **An ERC-6551 IP Account**, a specialized NFT account that can own other assets, receive revenue, and manage licenses for the work.
4. **The file on IPFS**, decentralized storage, so the content stays reachable without depending on any one server.

To register music you already own, start at the [Suede IP Registry](https://ip.suedeai.ai). The stems, analysis, and mastering endpoints above prepare the assets; the registry puts the work on the record.

## How do I rework old or analog recordings for new ideas?

Old demos, tape transfers, live bounces, voice-memo sketches: digitize the recording to an audio file, host it at a URL, and these endpoints rearrange it.

| Endpoint | What it does | Price |
|---|---|---|
| `POST /v1/cover` | Remakes the song in a new style or genre while keeping it recognizable | $0.40 |
| `POST /v1/extend` | Extends the song past its ending with a natural continuation in the same key and style | $0.40 |
| `POST /v1/continue` | Continues the recording from any timestamp you choose, preserving key and style | $0.40 |
| `POST /v1/vox` | Swaps the lead vocal to a target Suede voice while keeping the original instrumental, melody, and timing | $0.40 |

A working session on one old recording:

1. `POST /v1/analyze` reads the tempo, key, and energy of the original. ($0.003)
2. `POST /v1/stems` separates the vocal from the band. ($0.20)
3. `POST /v1/cover` remakes it as synthwave, or bluegrass, or whatever direction you want to hear it in. ($0.40)
4. `POST /v1/continue` picks up from the bridge you never finished and writes past it. ($0.40)

Total: about a dollar to hear a twenty-year-old demo reworked four ways. The outputs are sketches to write against, not replacements for your record.

Feed only recordings you own or control the rights to.

---

## Full x402 price list

All prices read from the live 402 responses on July 7, 2026. The 402 quote you receive at call time is always the authoritative price.

| Endpoint | Method | Job | Price |
|---|---|---|---|
| `/create-music` | POST | Full-length song from a prompt, registered with provenance | $0.20 |
| `/agent/video` | POST | Short-form music-video clip | $3.99 |
| `/agent/image` | POST | Cover art or promo still | $0.05 |
| `/v1/lyrics` | POST | Lyric generation | $0.04 |
| `/v1/style-coach` | POST | Style tags expanded into a generation brief | $0.02 |
| `/v1/analyze` | POST | BPM, key, mode, energy, loudness, genre | $0.003 |
| `/v1/stems` | POST | Two-stem split (vocal and instrumental) | $0.20 |
| `/v1/stems-pro` | POST | Four-stem split | $0.40 |
| `/v1/acapella` | POST | Vocal isolation, clean a cappella | $0.20 |
| `/v1/midi` | POST | MIDI extraction from audio | $0.10 |
| `/v1/lyric-sync` | POST | Timestamped, synced lyrics | $0.10 |
| `/v1/mastering` | POST | Release-ready WAV master | $0.10 |
| `/v1/cover` | POST | Remake a song in a new style | $0.40 |
| `/v1/extend` | POST | Continue a song past its ending | $0.40 |
| `/v1/continue` | POST | Continue from any timestamp | $0.40 |
| `/v1/vox` | POST | Voice swap on the lead vocal | $0.40 |
| `/v1/rights/{assetHash}` | GET | On-chain rights and provenance lookup | $0.005 |

**Payment details:** USDC on Base (asset contract `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`), paid to `0xb5a05466712fd5bcdf2883f43cC6B1799428032d`, 300-second payment window per quote. Full developer documentation at [app.suedeai.ai/developers](https://app.suedeai.ai/developers).

---

## What this API does not do

- The Suede Registry is an on-chain attestation on Base. A rights lookup verifies that record. It is not a government copyright filing, and nothing here is legal advice.
- Uploading a recording does not clear samples or third-party rights inside it. Clearance stays your responsibility.
- Prices on this page were verified against the live endpoints on the date above and can change. Trust the 402 response, not this table, at the moment you pay.

---

## Frequently asked questions

**What is the Suede x402 Music API?**
A set of pay-per-call music endpoints from Suede that generate songs, split stems, master audio, rework existing recordings, and verify on-chain music rights. Every endpoint prices itself through the x402 protocol and settles in USDC on Base. Prices run from $0.003 for audio analysis to $3.99 for a music video.

**Do I need an API key or an account?**
No. The 402 response is the entire contract. If you can pay the quote in USDC on Base, the endpoint serves you.

**Can an AI agent use this without a human in the loop?**
Yes. That is what x402 is for. An agent finds Suede through the Coinbase x402 Bazaar or the discovery document, reads the 402 quote, pays from its own wallet, and receives the asset. Skyfire-tokened agents can pay through the `PAYMENT-SIGNATURE` header instead.

**How much does it cost to generate a song?**
$0.20 for a complete, full-length track through `POST /create-music`: verses, chorus, full arrangement, delivered with a share URL, a download URL, and a provenance fingerprint.

**How do I split a song into stems with an API?**
`POST /v1/stems` returns a two-stem split (vocal and instrumental) for $0.20. `POST /v1/stems-pro` returns a four-stem split for $0.40. Both take a public `audioUrl` and pay per call over x402, no account needed.

**How do I verify who owns a piece of music?**
`GET /v1/rights/{assetHash}` with the content hash. For $0.005 you get back whether a Suede Registry record exists on Base, the owner wallet, and a block explorer link to verify the record yourself.

**Who owns a track generated through /create-music?**
You do. Tracks are generated as fully owned works, registered with a provenance fingerprint inside Suede's programmable-IP and licensing workflow at creation. Licensing specifics live in the [developer docs](https://app.suedeai.ai/developers).

**My music only exists on tape or in old session folders. Can I use these endpoints?**
Yes, after one step: digitize the recording to a standard audio file and host it at a URL the endpoint can fetch. From there, analysis, stems, covers, and continuations all work the same as on a modern file.

**What on-chain standards does Suede support?**
x402 for per-call payments, A2A for agent-to-agent communication, ACP for agent commerce, ERC-8004 for on-chain agent identity (Suede is agent #1 on its identity registry on Base), ERC-6551 IP Accounts for registered works, and IPFS for decentralized file storage. All of it is declared on the public agent card at `app.suedeai.ai/.well-known/agent-card.json`.

**Is the price I see here guaranteed?**
The authoritative price is the one in the 402 response when you call. This page reflects live quotes as of July 7, 2026.

---

## Start here

Run the curl at the top of this page. The 402 that comes back is the API contract, price included. Pay it once and you have a mastered WAV; pay $0.20 more and you have a registered, fully owned song.

Read the [developer docs](https://app.suedeai.ai/developers). Browse pay-per-run agents at [Suede Agent Studio](https://agents.suedeai.ai). Check any track's rights record at `/v1/rights/{assetHash}`. Put your own catalog on the record at [ip.suedeai.ai](https://ip.suedeai.ai). The rest of what Suede Labs builds for creator ownership lives at [suedeai.ai](https://suedeai.ai).

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebAPI",
      "name": "Suede x402 Music API",
      "description": "Pay-per-call music API over the x402 protocol: full-length song generation, stem separation, audio mastering, MIDI extraction, on-chain music rights verification, and reworking of existing recordings. Settles in USDC on Base with no API key.",
      "documentation": "https://app.suedeai.ai/developers",
      "termsOfService": "https://app.suedeai.ai/developers",
      "provider": {
        "@type": "Organization",
        "name": "Suede Labs",
        "url": "https://suedeai.ai",
        "sameAs": ["https://app.suedeai.ai", "https://ip.suedeai.ai", "https://agents.suedeai.ai"]
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is the Suede x402 Music API?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A set of pay-per-call music endpoints from Suede that generate songs, split stems, master audio, rework existing recordings, and verify on-chain music rights. Every endpoint prices itself through the x402 protocol and settles in USDC on Base. Prices run from $0.003 for audio analysis to $3.99 for a music video."
          }
        },
        {
          "@type": "Question",
          "name": "How much does it cost to generate a song?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "$0.20 for a complete, full-length track through POST /create-music: verses, chorus, full arrangement, delivered with a share URL, a download URL, and a provenance fingerprint."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need an API key or an account?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. The 402 response is the entire contract. If you can pay the quote in USDC on Base, the endpoint serves you."
          }
        },
        {
          "@type": "Question",
          "name": "Can an AI agent use this without a human in the loop?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. An agent finds Suede through the Coinbase x402 Bazaar or the discovery document at app.suedeai.ai/.well-known/x402.json, reads the 402 quote, pays from its own wallet, and receives the asset. Skyfire tokens are accepted in the PAYMENT-SIGNATURE header."
          }
        },
        {
          "@type": "Question",
          "name": "How do I split a song into stems with an API?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "POST /v1/stems returns a two-stem split (vocal and instrumental) for $0.20. POST /v1/stems-pro returns a four-stem split for $0.40. Both take a public audioUrl and pay per call over x402."
          }
        },
        {
          "@type": "Question",
          "name": "How do I verify who owns a piece of music?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "GET /v1/rights/{assetHash} with the content hash. For $0.005 you get back whether a Suede Registry record exists on Base, the owner wallet, and a block explorer link to verify the record yourself."
          }
        },
        {
          "@type": "Question",
          "name": "What on-chain standards does Suede support?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "x402 for per-call payments, A2A for agent-to-agent communication, ACP for agent commerce, ERC-8004 for on-chain agent identity (Suede is agent #1 on its identity registry on Base), ERC-6551 IP Accounts for registered works, and IPFS for decentralized file storage. All declared on the public agent card at app.suedeai.ai/.well-known/agent-card.json."
          }
        }
      ]
    }
  ]
}
</script>
