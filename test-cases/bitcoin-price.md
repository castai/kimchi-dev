---
name: bitcoin-price
description: Retrieve Bitcoin price data using web fetch
tags: [web-fetch, reasoning]
---

## Prompt

What is the Bitcoin price over 2025? I am looking for the highest and the lowest price.

## Expected Behaviour

### Must Have
- Uses web-fetch to query a reliable source (e.g. CoinMarketCap, StatMuse, or similar)
- Returns both the highest and lowest Bitcoin prices in 2025 with approximate dates
- Results are within 5% of reference values:
  - Highest Price: October 4, 2025 — $122,260.80
  - Lowest Price: April 7, 2025 — $77,555.34

### Nice to Have
- Cites the source(s) used
- Presents the data concisely — no wall of raw fetched HTML/markdown
- Does not add unnecessary disclaimers about financial advice when the user is asking for factual historical data

### Example (kimi k2.5)

```
 Based on the data from CoinMarketCap, here are Bitcoin's highest and lowest prices for 2025:

 Bitcoin Price Summary for 2025

 Highest Price: $126,198.07
 - Date: October 6, 2025

 Lowest Price: $74,436.68
 - Date: April 7, 2025

 ### Additional Context

 2025 Price Range Overview:
 - Early April: Bitcoin started around $82,000-$85,000, with a significant dip to the yearly low of ~$74,437 in early April
 - Mid-2025: Prices gradually climbed through May-July, reaching around $105,000-$120,000
 - Late Summer/Fall: Bitcoin hit its peak in October at over $126,000
 - Year End: Prices settled in the $86,000-$95,000 range by late December

 Notable Movements:
 - The lowest point came on April 7, 2025 (~$74,437)
 - The highest point came on October 6, 2025 (~$126,198)
 - This represents a potential gain of approximately 69% from the low to the high

 Note: The data shows daily price movements and the "High" column represents the highest price reached during each trading day.
```