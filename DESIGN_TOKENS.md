# Design Tokens Reference

This document is the canonical token reference for the frontend-only prototype.

## Color Tokens

### Violet Scale

- `--violet-50`: `#f2f4fb`
- `--violet-100`: `#e7eaf8`
- `--violet-200`: `#d3d8f2`
- `--violet-300`: `#b8bfe9`
- `--violet-400`: `#9b9fde`
- `--violet-500`: `#8483d1`
- `--violet-600`: `#665ebd`
- `--violet-700`: `#6058aa`
- `--violet-800`: `#504a89`
- `--violet-900`: `#43406f`
- `--violet-950`: `#282640`

### Neutral Scale

- `--neutral-50`: `#ffffff`
- `--neutral-100`: `#fafafa`
- `--neutral-200`: `#ededed`
- `--neutral-300`: `#d3d3d3`
- `--neutral-400`: `#a3a3a3`
- `--neutral-500`: `#727272`
- `--neutral-600`: `#535353`
- `--neutral-700`: `#404040`
- `--neutral-800`: `#272727`
- `--neutral-900`: `#1a1a1a`
- `--neutral-950`: `#121212`

### Semantic Colors

- `--background`: `var(--neutral-100)`
- `--foreground`: `var(--neutral-950)`

## Typography Tokens

### UI Text (Inter)

- `text-body-lg`
  - `font-family`: `var(--font-inter), system-ui, sans-serif`
  - `font-size`: `16px`
  - `font-weight`: `400`
  - `line-height`: `24px`
  - `letter-spacing`: `0.5px`
  - `color`: `var(--neutral-950)`

- `text-body-md`
  - `font-family`: `var(--font-inter), system-ui, sans-serif`
  - `font-size`: `14px`
  - `font-weight`: `400`
  - `line-height`: `22px`
  - `letter-spacing`: `0px`
  - `color`: `var(--neutral-950)`

- `text-body-md-secondary`
  - `font-family`: `var(--font-inter), system-ui, sans-serif`
  - `font-size`: `14px`
  - `font-weight`: `400`
  - `line-height`: `22px`
  - `letter-spacing`: `0px`
  - `color`: `var(--neutral-700)`

- `text-caption`
  - `font-family`: `var(--font-inter), system-ui, sans-serif`
  - `font-size`: `12px`
  - `font-weight`: `500`
  - `line-height`: `16px`
  - `letter-spacing`: `0px`
  - `color`: `var(--neutral-500)`

### AI Response Text (Spectral)

- `text-response-lg`
  - `font-family`: `var(--font-spectral), Georgia, serif`
  - `font-size`: `18px`
  - `font-weight`: `500`
  - `line-height`: `22px`
  - `letter-spacing`: `-1px`
  - `color`: `var(--neutral-950)`

- `text-response-md`
  - `font-family`: `var(--font-spectral), Georgia, serif`
  - `font-size`: `16px`
  - `font-weight`: `400`
  - `line-height`: `22px`
  - `letter-spacing`: `0px`
  - `color`: `var(--neutral-950)`

## Tailwind Mappings

Defined in `tailwind.config.ts`:

- `colors.violet.50..950` map to `var(--violet-*)`
- `colors.neutral.50..950` map to `var(--neutral-*)`
- `fontFamily.inter` and `fontFamily.sans` use `--font-inter`
- `fontFamily.spectral` and `fontFamily.serif` use `--font-spectral`

## Usage Notes

- Use tokenized classes (`text-body-*`, `text-response-*`) for consistent typography.
- Prefer semantic tokens (`--background`, `--foreground`) for app-level surfaces/text.
- Keep `app/globals.css` and `tailwind.config.ts` aligned whenever tokens are updated.
