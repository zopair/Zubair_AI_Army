# Rakez Performance Command Center — Concept Prototype

A responsive, Arabic-first executive dashboard concept for the Senior Performance Marketing Lead role at Rakez Real Estate.

## What it demonstrates
- Portfolio-level spend, leads, qualified leads, CPQL and cost per deposit.
- Project and channel filtering with recalculated KPIs.
- Project-level operating table with explicit Scale / Optimize / Pause decision heuristics.
- Daily decision queue explaining the operational next step.
- Budget reallocation scenario simulator with adjustable assumptions.
- Responsive RTL interface; no paid services, external APIs, or third-party runtime dependencies.

## Run locally
Open `index.html` in any modern browser. No build step or server is required.

## Data integrity
**All records, project names, amounts, conversion counts, and trends are synthetic demonstration data. They are not Rakez data, client results, or claims about actual campaign performance.** The prototype is intended to demonstrate dashboard architecture and decision logic only.

## Metric definitions
- **CPQL** = Ad spend / Qualified leads.
- **Cost per deposit** = Ad spend / Recorded deposits.
- **Lead qualification rate** = Qualified leads / Total leads.
- The simulator estimates a scenario from a user-selected budget shift and efficiency assumption; it is not a forecast and does not modify live campaigns.

## Decision logic
Illustrative thresholds only:
- Scale candidate: CPQL below SAR 360 and qualification rate above 28%.
- Optimize/Pause candidate: CPQL above SAR 520 or qualification rate below 19%.
- Otherwise: Optimize.
Thresholds should be replaced by Rakez's approved targets, attribution rules, sales feedback, and project economics before production use.

## Suggested production integration
Snapchat Ads, TikTok Ads, Meta Ads, Google Ads, GA4/GTM, CRM and deposit/revenue events through documented APIs or approved exports. Production deployment must reconcile platform spend, CRM lead identity, sales qualification, deposits, refunds/cancellations and attribution windows before decision automation.
