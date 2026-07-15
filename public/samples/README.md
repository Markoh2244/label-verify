# Sample Alcohol Labels

Use these with the TTB Label Verify prototype. Download a file, upload it in the dashboard, and enter the matching application data below.

Files live in `/public/samples/` and are available at `/samples/<filename>`.

| File | Expected result | Notes |
|------|-----------------|-------|
| `old-tom-distillery.svg` | **Pass** | Matches default "Load sample application" data |
| `stones-throw-rye.svg` | **Review** (fuzzy) | Brand casing may differ from application (“STONE'S THROW” vs “Stone's Throw”) |
| `old-tom-wrong-abv.svg` | **Fail** | Same Old Tom brand but **40%** ABV instead of 45% |
| `old-tom-bad-warning.svg` | **Fail** | Warning uses “Government Warning:” (title case) instead of all-caps |
| `valley-vineyards-cabernet.svg` | **Pass** | Wine label |
| `harbor-hop-ipa.svg` | **Pass** | Beer / IPA |
| `north-star-gin.svg` | **Pass** | Gin |
| `casa-del-sol-missing-warning.svg` | **Fail** | Missing government warning entirely |

---

## Application data (copy into the form)

### old-tom-distillery.svg / old-tom-wrong-abv.svg / old-tom-bad-warning.svg
Use **Load sample application**, or:

- Brand Name: `OLD TOM DISTILLERY`
- Class/Type: `Kentucky Straight Bourbon Whiskey`
- Alcohol Content: `45% Alc./Vol. (90 Proof)`
- Net Contents: `750 mL`
- Producer: `Old Tom Distillery Co.`
- Address: `Louisville, Kentucky 40202`
- Country: `USA`

### stones-throw-rye.svg
- Brand Name: `Stone's Throw` (or `STONE'S THROW` for exact match)
- Class/Type: `Straight Rye Whiskey`
- Alcohol Content: `46% Alc./Vol. (92 Proof)`
- Net Contents: `750 mL`
- Producer: `Stone's Throw Distilling Co.`
- Address: `Portland, Oregon 97214`
- Country: `USA`

### valley-vineyards-cabernet.svg
- Brand Name: `VALLEY VINEYARDS`
- Class/Type: `Cabernet Sauvignon`
- Alcohol Content: `13.5% Alc./Vol.`
- Net Contents: `750 mL`
- Producer: `Valley Vineyards Winery`
- Address: `St. Helena, California 94574`
- Country: `USA`

### harbor-hop-ipa.svg
- Brand Name: `HARBOR HOP`
- Class/Type: `India Pale Ale`
- Alcohol Content: `6.8% Alc./Vol.`
- Net Contents: `12 fl oz`
- Producer: `Harbor Hop Brewing Co.`
- Address: `Seattle, Washington 98101`
- Country: `USA`

### north-star-gin.svg
- Brand Name: `NORTH STAR`
- Class/Type: `London Dry Gin`
- Alcohol Content: `40% Alc./Vol. (80 Proof)`
- Net Contents: `750 mL`
- Producer: `North Star Spirits LLC`
- Address: `Chicago, Illinois 60601`
- Country: `USA`

### casa-del-sol-missing-warning.svg
- Brand Name: `CASA DEL SOL`
- Class/Type: `Tequila Blanco`
- Alcohol Content: `40% Alc./Vol. (80 Proof)`
- Net Contents: `750 mL`
- Producer: `Casa Del Sol Imports Inc.`
- Address: `Miami, Florida 33101`
- Country: `Mexico`
