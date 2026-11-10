# Performance and SEO checklist

## Applied in both samples

- Mobile viewport metadata and responsive, mobile-first CSS breakpoints.
- Unique page title and meta description in each default language; the language switch updates document title and description.
- Open Graph type, title, description, and locale metadata.
- hreflang alternates for English, Arabic, and x-default using the same page with lang query parameters; the page reads those parameters on load.
- Organization JSON-LD identifying each organization as fictional sample/demo content; no invented address, phone, awards, or client claims.
- Semantic header, main, section, article, form, and footer elements.
- Explicit visible labels for form inputs; status messages use aria-live.
- Google Fonts links request display=swap; local/system fallback fonts are declared.
- No third-party JavaScript libraries, analytics, video, or render-blocking application scripts; the small interaction script is placed at the end of body.
- Decorative graphic in Sample 2 is CSS-only; there are no content images requiring alt text.
- CSS uses logical properties for direction-aware spacing/alignment in the principal layout rules.

## Measurement status

- Lighthouse: **not measured**.
- Core Web Vitals / field performance: **not measured**.
- No claim is made about a numeric speed score or production ranking.

## Before production launch

- Replace the demo brand and copy with approved client content.
- Confirm final canonical URLs and update hreflang targets if English and Arabic are hosted on separate URLs.
- Confirm Open Graph preview with the final production URLs and a client-approved social image (with appropriate alt text where used).
- Test actual font loading, network waterfall, and Lighthouse on the deployed site.
- Add a privacy-policy link, consent wording, and any legally required cookie/analytics controls once the client's requirements are known.
- Validate the structured data and final HTML after replacing sample content.

**Note:** The current hreflang links are language-query variants of each demo page. If the production build uses distinct language paths or domains, those targets must be changed to the final absolute canonical URLs.