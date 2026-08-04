# Data Accuracy Notes

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software and its data are provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given regarding data accuracy, completeness, or fitness for any purpose. The authors and contributors are not liable for any damages arising from use of this software or its data. See the [LICENSE](../LICENSE) file for full terms.

## Legality Data Sources

Legality information for rare goods is curated by hand from **Inara.cz**.

### Why manual curation?

None of the usual data sources expose rare goods legality through a public API:

- **Inara.cz** doesn't provide one for commodity legality
- **EDSM** covers system coordinates and basic system info, not commodity legality
- **Spansh** focuses on route planning, not legality data

### How to Update Legality Data

1. Visit the Inara page for each rare good:
   - Go to https://inara.cz/galaxy-commodity/
   - Search for the rare good name
   - Click on the commodity entry

2. Find the "Legal in systems" section which shows restrictions

3. Update the data in `src/data/rares.ts` based on Inara's notes:

   **Field: `illegalInSuperpowers`**
   - Use when Inara says "illegal in [Superpower] space" or "illegal in all [Superpower] systems"
   - Example: `illegalInSuperpowers: ["Federation"]`

   **Field: `illegalInGovs`**
   - Use when Inara says "illegal in [Government] systems" without mentioning a superpower
   - Example: `illegalInGovs: ["Prison Colony", "Theocracy"]`

   **Field: `illegalInSuperpowerGovs`**
   - Use when Inara mentions a specific combination like "Federal Democracy" or "Imperial Theocracy"
   - Example: `illegalInSuperpowerGovs: [{ superpower: "Federation", government: "Democracy" }]`

### Examples

**Example 1: Kamitra Cigars**
- Inara note: "This rare good is legal in all systems except for Prison Colony, Theocracy and Corporate systems and Federal Democracy systems."
- Translation:
  ```typescript
  illegalInGovs: ['Prison Colony', 'Theocracy', 'Corporate'],
  illegalInSuperpowerGovs: [
    { superpower: 'Federation', government: 'Democracy' },
  ],
  ```

**Example 2: Centauri Mega Gin**
- Translation (matches the current `src/data/rares.ts` entry - illegal in Prison Colony systems, plus Federal and Alliance Theocracy specifically):
  ```typescript
  illegalInGovs: ['Prison Colony'],
  illegalInSuperpowerGovs: [
    { superpower: 'Federation', government: 'Theocracy' },
    { superpower: 'Alliance', government: 'Theocracy' },
  ],
  ```

### Verification

After updating data, verify by:
1. Running the application
2. Scanning for rares near a system with the restricted government/superpower
3. Checking that the legality badge and details match Inara's information

### Contributing

If you find inaccuracies:
1. Check Inara.cz for the current legality information
2. Update the data in `src/data/rares.ts`
3. Submit a pull request with the correction
