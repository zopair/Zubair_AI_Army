# WordPress + Elementor handover plan

**Execution status: NOT executed on a live WordPress site.** No WordPress administrator access, hosting access, Elementor license details, or production domain were provided. This is an implementation plan only.

## 1. Page structure and Elementor rebuild

### Sample 1 — Insurance advisory

1. **Header:** Site Logo / Site Title widget for the fictional wordmark; compact language switcher; keep the navigation minimal.
2. **Hero:** Full-width dark navy container, two-column desktop composition, eyebrow text, H1, supporting paragraph, and primary CTA anchor to the form.
3. **Advisory introduction:** Two-column heading and paragraph; collapse to one column on mobile.
4. **Three benefits:** Three Icon Box or nested Container cards with numbered labels, headings, and short descriptions.
5. **Opt-in panel:** Two-column panel with guide description and Elementor Form widget; fields Name and Email; consent/privacy note.
6. **Footer:** Demo disclaimer and legal/privacy links supplied by the client.

### Sample 2 — Arabic-first consulting/training

1. **Header:** Arabic-first Riwaq wordmark, short descriptor, language switcher.
2. **Hero:** Warm cream background; Arabic-first headline and copy beside the decorative brand motif; CTA to the introduction form.
3. **Process:** Three numbered step cards in a responsive grid.
4. **Conversion band:** Deep green two-column section with invitation copy and a compact form.
5. **Footer:** Fictional brand disclaimer and client-supplied legal links.

## 2. RTL and language configuration

- Set the WordPress site language to the client's primary language only if that matches the site's editorial and admin requirements; Arabic-first sites should use Arabic as the site language.
- Confirm WordPress core RTL stylesheet loading and Elementor's RTL rendering on the selected theme.
- Use a multilingual plugin or a clearly defined separate-page strategy for the English and Arabic variants; ensure each language has a stable URL and reciprocal language switcher.
- Set each page's language attribute correctly and verify document direction is dir=rtl for Arabic and dir=ltr for English.
- Use CSS logical properties (margin-inline, padding-inline, inset-inline, text-align:start/end) rather than hard-coded left/right offsets.
- Load IBM Plex Sans Arabic or the client's approved Arabic font with suitable fallbacks; use an approved Latin font for English. Set generous Arabic line-height and test mixed Arabic/Latin strings, numerals, email addresses, and punctuation.

## 3. Global design tokens

| Token | Sample 1 | Sample 2 |
|---|---|---|
| Primary | Navy #14283F | Deep green #17342E |
| Background | White #FFFFFF / cool gray #F6F8FA | Warm cream #F1EADF / paper #FBF8F2 |
| Accent | Muted gold #B58B52 | Coral #D66E54 / gold #BD9860 |
| Body | Inter, system sans | IBM Plex Sans Arabic, Tahoma fallback |
| Headings | Georgia / serif | IBM Plex Sans Arabic |

Define colors and typography under Elementor Site Settings → Global Colors and Global Fonts. Keep the two sample palettes separate if both pages are delivered within one WordPress installation.

## 4. Responsive breakpoints

- Desktop: 1025px and above; retain two-column hero/form compositions and three-card benefit/process grids.
- Tablet: 768–1024px; reduce column gaps and heading sizes; collapse any layout that becomes cramped.
- Mobile: 767px and below; stack all columns, make CTAs and form controls full-width where appropriate, preserve comfortable touch targets, and avoid fixed-width elements.
- QA at 360px, 390px, 768px, 1024px, and a wide desktop viewport; inspect both RTL and LTR.

## 5. ActiveCampaign form connection

- Use Elementor Form widget with Name and Email fields, accessible labels, required rules, and clear validation messages.
- Preferred implementation: Elementor form action/webhook or a vetted ActiveCampaign integration that keeps credentials server-side. If using a native embedded form, insert the client's generated ActiveCampaign Full Embed code in an HTML widget and style it to match; do not place API keys in browser JavaScript.
- Map Name and Email to the correct ActiveCampaign contact fields and the client's intended list/form.
- Configure the agreed post-submit message/redirect, consent language, and form-submit automation that emails the approved guide.
- Test successful and invalid submissions, duplicate contacts, consent handling, mobile keyboard behavior, automation enrollment, and email delivery with client-approved test records.

## 6. Caching and performance

- Use one reputable page cache compatible with the host; avoid overlapping cache/minification plugins.
- Enable server-level Brotli or GZIP, HTTP/2 or HTTP/3 where supported, browser caching, and a CDN only where appropriate to the client's hosting.
- Compress and correctly size imagery; use WebP/AVIF where supported, responsive image sizes, explicit dimensions, and lazy-load below-the-fold images.
- Preload only truly critical fonts; subset font files if practical; use font-display: swap.
- Minify CSS/JS only after visual regression checks, and exclude scripts that break Elementor or ActiveCampaign forms.
- Remove unused widgets, add-ons, and plugins; keep WordPress, theme, Elementor, and plugins updated.
- Run Lighthouse on the deployed production-like page and record actual results rather than estimates.

## 7. Delivery checklist

- [ ] Client approves final copy, translations, brand assets, consent, and privacy language.
- [ ] Build both language variants and verify RTL/LTR on desktop and mobile.
- [ ] Connect and test the client's ActiveCampaign form and automation.
- [ ] Configure SEO titles, descriptions, social previews, hreflang/canonical URLs, and organization data.
- [ ] Verify responsive layout, keyboard access, labels, focus states, and form errors.
- [ ] Export editable Elementor page templates (JSON) and any required global kit/settings.
- [ ] Deliver a backup/export and a concise update guide.
- [ ] Transfer ownership and access to the client's nominated WordPress/hosting administrators; remove temporary access.
- [ ] Obtain client sign-off after final QA.

**No live WordPress or Elementor changes have been made.**