# Shared Design System and Platform Shell

Status: Phase 2 implementation candidate.

## Objective

Provide the smallest coherent reusable presentation system for the Youtoola shell and near-term utilities. The system favours fast completion, trust, accessibility, Server Components and low operating cost over visual novelty or framework abstraction.

## Tokens

| Role | Value | Intended use |
| --- | --- | --- |
| Brand navy | `#000A3F` | Headings and brand identity |
| Brand blue | `#306CFF` | Decorative accents only |
| Light brand blue | `#40A3FE` | Decorative gradient reference only |
| Interaction blue | `#064FD6` | Links, primary controls and interactive state |
| Interaction hover | `#003FAE` | Hover state |
| Focus | `#FFBF47` | High-visibility focus outline |
| Body text | `#10233F` | Primary text |
| Muted text | `#40536F` | Supporting text |
| Soft surface | `#F7F9FC` | Page background |
| Border | `#C8D2DF` | Dividers and control boundaries |

The font stack is `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. No external font request is allowed.

Measured contrast includes 18.83:1 for brand navy on white, 6.78:1 for interaction blue on white, 7.82:1 for muted text on white and 7.42:1 for muted text on the soft surface. The lighter brand colours are not small-text colours.

## Architecture

- `app/globals.css` owns the tokens and global component presentation.
- `components/site-shell.tsx` owns landmarks, skip link, brand header, main container, footer and breadcrumbs.
- `components/mobile-navigation.tsx` is the only shell Client Component because Escape handling and focus return require state.
- `components/ui.tsx` owns the small general-purpose primitive set.
- `components/forms.tsx` owns visible-label and error-association patterns.
- `components/tool-patterns.tsx` owns result, related-tool and inert commercial presentation.
- App Router pages and all other display components remain Server Components by default.

No CSS/UI framework, icon library, class-name helper, animation library, Storybook, external font or runtime service is used.

## Review route

`/design-system-review` demonstrates every approved component in Local and Preview. It is force-dynamic so the environment policy is evaluated at request time. Production applies a before-files rewrite to an intentionally absent internal path so the public route returns a real HTTP 404; the page-level environment guard remains a second defence. The route declares `noindex, nofollow`, remains outside the sitemap and inherits the canonical `https://www.youtoola.com` origin.

## Interaction contracts

- Visible labels and 16-pixel inputs are mandatory.
- Help and error IDs are injected into `aria-describedby`; errors also set `aria-invalid`.
- Multi-field submission errors focus a summary; successful results do not move focus.
- Result changes use a polite live region.
- Icon buttons require an accessible `label` property.
- Native fieldset, radio, checkbox, select, details and switch semantics are used before ARIA substitutes.
- Interactive controls provide at least a 44-by-44 CSS-pixel target.
- Commercial placeholders are inert, clearly labelled and appear only after the full result.

## Performance budget

The shell ships no third-party Production script and no external font. Client JavaScript is limited to interaction that cannot be represented with native HTML. CSS targets are 20 KB gzip for the design system and 30 KB gzip for each route. Images have explicit dimensions to prevent layout shift.

## Deferred components

Textarea, badge, modal/dialog, tabs, skeletons, toasts, date picker, combobox, autocomplete, data table, broad icons and custom animation remain deferred until a real utility requirement demonstrates need.
