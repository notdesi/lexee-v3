# Lexee (prototype foundation)

Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion.

## Requirements

- Node.js **20+**
- npm **10+**

## Run locally

```bash
npm ci
npm run dev
```

Then open `http://localhost:3000`.

## Project structure

- `app/`: Next.js App Router (`layout.tsx`, `page.tsx`, `globals.css`)
- `components/`: UI components (empty for now)
- `lib/`: shared utilities (includes `lib/responses.ts`)

## Notes

- Fonts are configured in `app/layout.tsx` using `next/font` (Inter + Tiempos Headline/Text).
- Design tokens:
  - Color CSS variables live in `app/globals.css`
  - Tailwind colors map to those variables in `tailwind.config.ts`
- Type scale utility classes are defined in `app/globals.css` under `@layer components`:
  - Inter: `text-body-lg`, `text-body-md`, `text-body-md-secondary`, `text-caption`
  - Tiempos Text (AI responses): `text-response-lg`, `text-response-md`
  - Tiempos Headline (brand/titles): `font-tiempos-headline`

