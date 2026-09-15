# QRForge — Free QR Code Generator

Create. Scan. Share. Free.

QRForge is a fully client-side, production-ready QR code generator. Every QR code is
encoded in your browser using the standard `qrcode` library — nothing fake, nothing
static, and nothing uploaded to a server. Generate a code, download it, and scan it
with a real phone.

## Features

- **8 QR types** — URL, plain text, phone, email (subject/body), SMS, Wi-Fi, vCard contact, location
- **Live preview** that updates as you type
- **Full customization** — foreground/background color, size, quiet-zone margin,
  error-correction level, rounded modules, and an optional center logo
- **Center logo** with automatic error-correction boost (High) and safe sizing warnings
- **Exports** — high-resolution PNG (1024px), scalable SVG, JPG, copy-to-clipboard, and a clean print layout
- **Scannability guardrails** — proper quiet zone, contrast check with warning, safe logo sizing
- **Local history** — recent QR codes stored in `localStorage` on your device
- **Quick examples** — Google, WhatsApp, Instagram, Website, Email, Wi-Fi, Contact, Location
- **Offline PWA** — installable, caches the app shell, works offline after first load
- **No account, no payment, no watermark**

## Tech stack

- **Frontend:** React 18 + Vite 6
- **Styling:** Tailwind CSS 4
- **QR generation:** [qrcode](https://www.npmjs.com/package/qrcode) (local, in-browser)
- **Icons:** Lucide React
- **State:** React hooks
- **Storage:** `localStorage` only
- **PWA:** vite-plugin-pwa (Workbox precaching + web app manifest)

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production build

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

## QR correctness test

QRForge ships a script that encodes real payloads, renders them to PNG, decodes them
with a real QR decoder (`jsqr`) and asserts the scanned text matches the input exactly.

```bash
npm run test:qr
```

This is the same `qrcode` engine the app uses, proving generated codes are standards-
compliant and scannable.

## Deploy to Vercel

Push this repository to GitHub and import it into Vercel (or use the CLI):

```bash
npm i -g vercel
vercel        # first run — link and deploy
vercel --prod
```

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **SPA routing:** included in `vercel.json` (all routes rewrite to `index.html`)

## How QR generation works

1. You choose a type and type your content.
2. `validators.js` validates the input (URL, email, phone, coords, Wi-Fi SSID).
3. `buildPayload` produces a standards payload — e.g. `WIFI:T:WPA;S:...;P:...;;`,
   `mailto:...?subject=...`, a `vCard 3.0` block, or a Google Maps link.
4. `qrcode` generates the QR matrix locally.
5. A canvas renders the matrix (colors, margin, rounded modules, logo overlay).
6. PNG/SVG/JPG exports come straight from that canvas/SVG — no image editing backend.

## Privacy architecture

- QR content is encoded entirely in the browser — nothing is uploaded to generate a QR.
- History lives in `localStorage` and can be cleared at any time.
- Uploaded logos are read as local data URLs and never leave the device.
- No account system exists at all.

## License

Free to use. QRForge — create beautiful, customizable QR codes instantly.