# Frontend Design Guidelines (Auto-Generated)

> This file is generated from `app/globals.css` and class usage in `app/` + `components/`. Do not edit manually.

- Generated at: `2026-09-01T04:42:41.312Z`
- Regenerate: `npm run design:guidelines`

## Purpose

- Use this as the source-of-truth context when prompting AI coding agents to implement or refactor UI in this repo.
- Keep all new UI token-driven. Avoid hardcoded colors, typography, and spacing.

## AI Agent Hand-off Prompt

- Add this instruction in your prompt: `Follow DESIGN_GUIDELINES.md exactly. Use existing tokens and text classes. Do not introduce raw hex colors or non-standard spacing utilities unless requested.`

## Colors

### Light Mode: Base Scales
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

### Dark Mode: Base Scales
- `--neutral-50`: `#1f1f1e`
- `--neutral-100`: `#2b2b28`
- `--neutral-200`: `#373734`
- `--neutral-300`: `#484845`
- `--neutral-400`: `#61615c`
- `--neutral-500`: `#7f7f79`
- `--neutral-600`: `#a6a69e`
- `--neutral-700`: `#d2d2c8`
- `--neutral-800`: `#e8e8e2`
- `--neutral-900`: `#f6f6f1`
- `--neutral-950`: `#ffffff`
- `--violet-50`: `#232027`
- `--violet-100`: `#2c2736`
- `--violet-200`: `#3a344d`
- `--violet-300`: `#514a69`
- `--violet-400`: `#746c94`
- `--violet-500`: `#958cbd`
- `--violet-600`: `#b7aee2`
- `--violet-700`: `#d4ccf7`
- `--violet-800`: `#eae6fc`
- `--violet-900`: `#f5f3fc`
- `--violet-950`: `#fcfbff`

### Light Mode: Semantic Tokens
- `--background`: `#f8f8f6`
- `--foreground`: `var(--neutral-950)`
- `--button-ghost-fg`: `var(--neutral-700)`
- `--button-ghost-hover`: `var(--neutral-200)`
- `--button-primary-bg`: `var(--violet-600)`
- `--button-primary-hover`: `var(--violet-700)`
- `--button-primary-fg`: `var(--neutral-50)`
- `--button-primary-disabled-bg`: `var(--violet-300)`
- `--button-primary-disabled-fg`: `var(--violet-100)`
- `--chatbox-bg`: `#ffffff`
- `--chatbox-border`: `var(--neutral-300)`
- `--chat-outline`: `rgb(23 23 23 / 0.075)`
- `--chat-outline-accent`: `rgb(96 88 170 / 0.2)`
- `--surface-elevated`: `#ffffff`
- `--surface-elevated-hover`: `var(--neutral-100)`
- `--shadow-card`: `0 1px 2px rgba(18, 18, 18, 0.055)`
- `--shadow-panel`: `0 8px 24px rgba(18, 18, 18, 0.12)`
- `--shadow-popup`: `0 12px 28px rgba(40, 38, 64, 0.18)`
- `--shadow-subtle`: `0 1px 2px rgba(18, 18, 18, 0.07)`
- `--shadow-chatbox`: `0 1px 1px rgba(18, 18, 18, 0.02),
      0 2px 5px rgba(18, 18, 18, 0.028),
      0 6px 18px rgba(18, 18, 18, 0.034)`

### Dark Mode: Semantic Tokens
- `--background`: `#1f1f1e`
- `--foreground`: `#f5f5f4`
- `--button-ghost-fg`: `#deded8`
- `--button-ghost-hover`: `#333330`
- `--button-primary-bg`: `var(--violet-500)`
- `--button-primary-hover`: `var(--violet-600)`
- `--button-primary-fg`: `#1f1f1e`
- `--button-primary-disabled-bg`: `#454065`
- `--button-primary-disabled-fg`: `#dddaf3`
- `--chatbox-bg`: `var(--neutral-200)`
- `--chatbox-border`: `var(--neutral-300)`
- `--chat-outline`: `rgb(255 255 255 / 0.08)`
- `--chat-outline-accent`: `rgb(212 204 247 / 0.15)`
- `--surface-elevated`: `var(--neutral-100)`
- `--surface-elevated-hover`: `var(--neutral-200)`
- `--shadow-card`: `0 1px 3px rgba(0, 0, 0, 0.38),
      0 1px 2px rgba(0, 0, 0, 0.32)`
- `--shadow-panel`: `0 14px 36px rgba(0, 0, 0, 0.5)`
- `--shadow-popup`: `0 22px 50px rgba(0, 0, 0, 0.58)`
- `--shadow-subtle`: `0 1px 4px rgba(0, 0, 0, 0.36)`
- `--shadow-chatbox`: `0 1px 2px rgba(0, 0, 0, 0.16),
      0 4px 10px rgba(0, 0, 0, 0.14),
      0 10px 22px rgba(0, 0, 0, 0.12)`

## Typography

### `text-body-lg`
- `font-family`: `var(--font-inter), system-ui, sans-serif`
- `font-size`: `16px`
- `font-weight`: `400`
- `line-height`: `24px`
- `letter-spacing`: `0.5px`
- `color`: `var(--neutral-950)`

### `text-body-md`
- `font-family`: `var(--font-inter), system-ui, sans-serif`
- `font-size`: `14px`
- `font-weight`: `400`
- `line-height`: `22px`
- `letter-spacing`: `0px`
- `color`: `var(--neutral-950)`

### `text-body-md-secondary`
- `font-family`: `var(--font-inter), system-ui, sans-serif`
- `font-size`: `14px`
- `font-weight`: `400`
- `line-height`: `22px`
- `letter-spacing`: `0px`
- `color`: `var(--neutral-700)`

### `text-caption`
- `font-family`: `var(--font-inter), system-ui, sans-serif`
- `font-size`: `12px`
- `font-weight`: `500`
- `line-height`: `16px`
- `letter-spacing`: `0px`
- `color`: `var(--neutral-500)`
- Dark override:
  - `color`: `var(--neutral-600)`

### `text-response-lg`
- `font-family`: `var(--font-tiempos-text), Georgia, serif`
- `font-size`: `18px`
- `font-weight`: `500`
- `line-height`: `26px`
- `letter-spacing`: `-0.01em`
- `color`: `var(--neutral-950)`

### `text-response-md`
- `font-family`: `var(--font-tiempos-text), Georgia, serif`
- `font-size`: `16px`
- `font-weight`: `400`
- `line-height`: `24px`
- `letter-spacing`: `0px`
- `color`: `var(--neutral-950)`

## Spacing

- The list below is extracted from existing class usage and represents the current spacing vocabulary for this codebase.
- Prefer these utilities first before introducing new spacing values.

- `gap-0` (used 1x)
- `gap-0.5` (used 16x)
- `gap-1` (used 21x)
- `gap-1.5` (used 14x)
- `gap-2` (used 42x)
- `gap-2.5` (used 1x)
- `gap-3` (used 34x)
- `gap-4` (used 14x)
- `gap-5` (used 1x)
- `gap-6` (used 7x)
- `gap-10` (used 3x)
- `gap-12` (used 1x)
- `mb-1.5` (used 1x)
- `mb-2` (used 4x)
- `mb-2.5` (used 1x)
- `mb-4` (used 5x)
- `mb-5` (used 1x)
- `mr-0.5` (used 2x)
- `mr-1` (used 1x)
- `mt-0` (used 1x)
- `mt-0.5` (used 13x)
- `mt-1` (used 19x)
- `mt-1.5` (used 18x)
- `mt-2` (used 23x)
- `mt-2.5` (used 4x)
- `mt-3` (used 27x)
- `mt-4` (used 10x)
- `mt-5` (used 8x)
- `mt-6` (used 3x)
- `mt-8` (used 9x)
- `mt-10` (used 6x)
- `mt-12` (used 2x)
- `mx-2` (used 1x)
- `my-1.5` (used 8x)
- `my-2` (used 1x)
- `my-5` (used 7x)
- `p-1` (used 2x)
- `p-1.5` (used 7x)
- `p-2` (used 9x)
- `p-3` (used 1x)
- `p-4` (used 10x)
- `p-5` (used 1x)
- `pb-1` (used 5x)
- `pb-1.5` (used 1x)
- `pb-2` (used 9x)
- `pb-3` (used 3x)
- `pb-4` (used 5x)
- `pb-5` (used 2x)
- `pb-6` (used 1x)
- `pb-8` (used 5x)
- `pb-10` (used 1x)
- `pb-16` (used 6x)
- `pl-0` (used 1x)
- `pl-2` (used 1x)
- `pl-4` (used 7x)
- `pl-6` (used 6x)
- `pr-0` (used 10x)
- `pr-2` (used 6x)
- `pr-3` (used 3x)
- `pr-4` (used 30x)
- `pr-6` (used 7x)
- `pr-8` (used 1x)
- `pt-1` (used 1x)
- `pt-2` (used 20x)
- `pt-3` (used 3x)
- `pt-4` (used 6x)
- `pt-5` (used 1x)
- `pt-6` (used 2x)
- `pt-8` (used 3x)
- `pt-10` (used 1x)
- `pt-16` (used 2x)
- `px-0` (used 3x)
- `px-1` (used 1x)
- `px-1.5` (used 1x)
- `px-2` (used 48x)
- `px-2.5` (used 18x)
- `px-3` (used 27x)
- `px-3.5` (used 4x)
- `px-4` (used 29x)
- `px-5` (used 7x)
- `px-6` (used 3x)
- `px-8` (used 13x)
- `py-0.5` (used 3x)
- `py-1` (used 15x)
- `py-1.5` (used 15x)
- `py-2` (used 36x)
- `py-2.5` (used 8x)
- `py-3` (used 21x)
- `py-3.5` (used 26x)
- `py-4` (used 12x)
- `py-5` (used 1x)
- `py-6` (used 1x)
- `py-8` (used 11x)
- `py-12` (used 1x)
- `space-y-1` (used 8x)
- `space-y-3` (used 8x)

## Implementation Rules For Frontend Contributors

- Always style with CSS variables or existing semantic utility classes.
- Keep mode support automatic via tokens under `:root` and `[data-theme="dark"]`.
- If tokens change, regenerate this guide before opening a PR.
