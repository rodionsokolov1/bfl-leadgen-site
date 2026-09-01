# Homepage V1 design system

Status: approved. The `/` route is the visual reference for subsequent pages.

## Foundations

- Main font: `Arial, Helvetica, "Segoe UI", sans-serif` (`--font-main`).
- Handwritten accent font: `"Segoe Print", "Bradley Hand", cursive` (`--font-note`).
- Content width: `1720px` (`--container`).
- Horizontal page gutter: `clamp(18px, 4vw, 64px)` (`--page-gutter`).
- Responsive breakpoints: `1250px`, `900px`, `560px`.
- Minimum supported viewport width: `320px`.

## Color tokens

- Paper: `#fbf8ef` (`--paper`).
- Light paper: `#fffdf8` (`--paper-light`).
- Ink: `#10130f` (`--ink`).
- Muted text: `#545952` (`--muted`).
- Green: `#728f43`; homepage section green accent: `#2f9e5a`.
- Blue: `#1e66d5`; intro accent: `#2f88c9`.
- Red hero accent: `#d24b4b`.
- Orange: `#f24e18`.
- Soft accents: green `#e9edde`, blue `#e9f0fb`, orange `#fce9df`.

## Typography currently used on `/`

- Hero H1: `clamp(56px, 4.6vw, 82px)`; up to 900px `clamp(42px, 7vw, 58px)`; up to 560px `clamp(34px, 8.8vw, 40px)`.
- Intro H2: `clamp(38px, 3.6vw, 66px)`; up to 560px `26px`.
- Audience H2/H3-level headings: `clamp(28px, 2.2vw, 40px)`; up to 560px `20px`.
- Intro prompt heading: `clamp(33px, 3.1vw, 58px)`; up to 560px `22px`.
- Hero supporting text: `clamp(21px, 1.8vw, 34px)` and `clamp(22px, 1.75vw, 33px)`; mobile `19px` and `20px`.
- Section body text: `clamp(22px, 1.55vw, 30px)`; mobile `18px`.
- Intro quote/body: `clamp(21px, 1.75vw, 32px)`; mobile `17px`.
- Badge/eyebrow: `clamp(20px, 1.55vw, 29px)`; mobile `14px`.
- Small text: generally `12px`–`18px`, depending on context.

## Reusable patterns

- Container: `.frame` in `components/home/home.module.css`.
- Shared page surface and overflow behavior: `.section` plus global paper background.
- Header identity and social links: `Hero` and `SocialIcon`.
- Footer identity, legal details and social links: `SiteFooter` and `SocialIcon`.
- Primary outline CTA: `.actionButton`; hover fills with the section accent and switches text/arrow to white.
- Badge: `.eyebrow`, colored by the containing section.
- Marker emphasis: highlighted text block plus hand-drawn underline/pseudo-element.
- Cards use soft paper/white transparency, subtle borders and shadows, and irregular radii in the `18px`–`34px` range.
- Motion respects `prefers-reduced-motion`.

## Spacing and composition rules

- Large sections use generous vertical padding (approximately `85px`–`150px` on desktop and `50px`–`105px` on mobile).
- Major content groups use gaps around `30px`–`78px`; CTA top spacing is `40px` mobile and `54px` desktop.
- Desktop layouts use two-column grids; at `900px` they stack in content-first order with illustrations following.
- Do not introduce global typography or layout changes that alter the approved `/` route.

## Reuse policy

Reuse the existing global tokens and shared patterns for new routes. Keep homepage-only sections in `components/home/`; extract a component into `components/ui/` or `components/layout/` only when a second real consumer exists and the extraction is visually neutral.
