# Rare Goods Legality Categories

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software and its data are provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given regarding data accuracy, completeness, or fitness for any purpose. The authors and contributors are not liable for any damages arising from use of this software or its data. See the [LICENSE](../../LICENSE) file for full terms.

---

This document provides broad categories of legality for rare goods in Elite Dangerous. These categories can be used as a starting point when curating legality data, but should be verified against Inara.cz for accuracy.

## Alcohol/Liquor

**Rares in this category:**
- Lavian Brandy
- Centauri Mega Gin
- Eranin Pearl Whisky
- Kongga Ale

**Legality Rules:**
- Generally legal in most systems
- **Illegal in:**
  - Prison Colony systems (all superpowers)
  - Federal Theocracy systems (Federation + Theocracy)
  - Alliance Theocracy systems (Alliance + Theocracy)

**Data Structure:**
```typescript
illegalInGovs: ['Prison Colony'],
illegalInSuperpowerGovs: [
  { superpower: 'Federation', government: 'Theocracy' },
  { superpower: 'Alliance', government: 'Theocracy' },
],
```

## Narcotics

**Rares in this category:**
- Onionhead (all strains: base, Alpha, Beta)
- Lyrae Weed
- Tarach Spice

**Legality Rules:**
- **Illegal in:**
  - All Federal systems (all government types)
  - All Imperial systems (all government types)
  - Most Alliance systems (except those with Anarchy governments)

**Data Structure:**
```typescript
illegalInSuperpowers: ['Federation', 'Empire'],
illegalInSuperpowerGovs: [
  // All Alliance government types except Anarchy
  { superpower: 'Alliance', government: 'Communism' },
  { superpower: 'Alliance', government: 'Confederacy' },
  { superpower: 'Alliance', government: 'Cooperative' },
  { superpower: 'Alliance', government: 'Corporate' },
  { superpower: 'Alliance', government: 'Democracy' },
  { superpower: 'Alliance', government: 'Dictatorship' },
  { superpower: 'Alliance', government: 'Feudal' },
  { superpower: 'Alliance', government: 'Patronage' },
  { superpower: 'Alliance', government: 'Prison' },
  { superpower: 'Alliance', government: 'Prison Colony' },
  { superpower: 'Alliance', government: 'Theocracy' },
],
```

**Note:** Alliance Anarchy systems are legal for narcotics.

## Tobacco

**Rares in this category:**
- Kamitra Cigars
- Rusani Old Smokey

**Legality Rules:**
- Illegal in many systems, particularly those with specific factions or high security
- **Kamitra Cigars** (verified from Inara):
  - Illegal in: Prison Colony, Theocracy, Corporate (all superpowers)
  - Illegal in: Federal Democracy systems

**Data Structure (Kamitra Cigars):**
```typescript
illegalInGovs: ['Prison Colony', 'Theocracy', 'Corporate'],
illegalInSuperpowerGovs: [
  { superpower: 'Federation', government: 'Democracy' },
],
```

**Note:** Rusani Old Smokey may have different restrictions - verify on Inara.

## Weapons

**Rares in this category:**
- Gilya Signature Weapons
- Kamorin Historic Weapons
- Holva Duelling Blades

**Legality Rules:**
- Often illegal in peaceful or high-security systems
- **Note:** This is a vague category - verify each weapon rare individually on Inara for specific restrictions

## Most Others

**Rares in this category:**
- Soontill Relics
- The Hutton Mug
- Azure Milk
- Crom Silver Fesh
- Nanomedicines
- And most other rare goods not listed above

**Legality Rules:**
- Generally legal in all systems
- No restrictions (unless specifically noted on Inara)

**Data Structure:**
```typescript
illegalInSuperpowers: [],
illegalInGovs: [],
illegalInSuperpowerGovs: [],
```

## Usage Notes

1. **These categories are guidelines** - always verify against Inara.cz for the most accurate and up-to-date information
2. **Individual exceptions may exist** - some rares within a category may have unique restrictions
3. **Use the curation UI** (`/curate` page in development) to update legality data
4. **When in doubt**, check Inara.cz for the specific rare good

## Verification Process

1. Check if the rare fits into one of these categories
2. Apply the category rules as a starting point
3. Verify on Inara.cz: https://inara.cz/galaxy-commodity/
4. Update the data using the curation UI or directly in `src/data/rares.ts`
5. Test by scanning near systems with the restricted government types/superpowers
