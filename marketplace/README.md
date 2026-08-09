# ZOPAIR Marketplace

A multi-product discovery layer for ZOPAIR products.

## Discovery

Categories, search, tags, featured products, newest products, and usage-based sorting are planned around measured data.

## Product states

- `prototype`: internal validation only
- `beta`: usable by testers
- `paid`: payment-enabled
- `retired`: no longer promoted

Only products that pass correctness, security, reliability and unit-economics gates may become `paid`.

## Trust

Popularity, reviews, testimonials and performance claims must come from real measured data. No fabricated social proof.

## Architecture

`catalog.yml` is the source-of-truth manifest for the first-party catalog. The eventual marketplace UI can consume this manifest and a revenue/analytics feed.
