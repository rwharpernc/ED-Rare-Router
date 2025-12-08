# Refactoring Summary: Static Route Planning Focus

## Overview

The application has been refactored to focus on **static route planning data** rather than dynamic BGS (Background Simulation) updates. Rare commodities are always found in the same places, so we don't need to worry about keeping data updated.

## Key Changes

### 1. Removed Dynamic Fields

**Removed:**
- `stationState` - Dynamic BGS state (Boom, Expansion, etc.) that changes frequently

**Rationale:** These fields require constant updates and aren't essential for route planning. The focus is on static location, price, legality, and distance data.

### 2. Simplified Data Model

The `RareGood` interface now focuses on:
- ✅ **Location**: `system`, `station`, `pad`
- ✅ **Price**: `cost` (static baseline)
- ✅ **Legality**: `illegalInSuperpowers`, `illegalInGovs`
- ✅ **Distance**: `distanceToStarLs`, `sellHintLy`
- ✅ **PowerPlay**: `pp.eligibleSystemTypes`, `pp.notes` (preserved - very important)

### 3. Updated Files

**Type Definitions:**
- `src/types/rares.ts` - Removed `stationState`, added documentation
- `src/types/api.ts` - Removed `stationState` from `ScanResult`, removed `AnalyzeResult` type

**API Endpoints:**
- `src/pages/api/rares-scan.ts` - Removed `stationState` assignment
- Removed `src/pages/api/rares-analyze.ts` - Analyze mode removed (route planning now manual)

**UI Components:**
- `src/components/ResultsList.tsx` - Removed `stationState` display

### 4. PowerPlay Functionality Preserved

✅ All PowerPlay functionality remains intact:
- `pp.eligibleSystemTypes` - Still included
- `pp.notes` - Still included (for engineer requirements, etc.)
- CP divisor calculations - Unchanged
- PP eligibility checks - Unchanged

## Data Philosophy

### Static Data (No Updates Needed)
- System and station names (never change)
- Pad sizes (never change)
- Distance to star (never changes)
- Legality restrictions (rarely change)
- Permit requirements (never change)
- PowerPlay eligibility (never changes)
- Baseline cost (static reference - actual prices vary with BGS)

### Dynamic Data (Not Tracked)
- Station/system states (Boom, Expansion, etc.) - Changes frequently
- Current allocation quantities - Varies with BGS conditions
- Current market prices - Varies with BGS conditions

## Benefits

1. **No Maintenance Burden**: Data doesn't need constant updates
2. **Faster Route Planning**: Focus on essential static information
3. **Reliable**: Static data is always accurate
4. **PowerPlay Ready**: All PP functionality preserved

## Next Steps

1. Review and update `rares.ts` data as needed
2. Manually verify pad sizes if needed
3. Update `sellHintLy` values if you have better data
4. Research and update illegal status arrays if needed

## Usage

The app is now optimized for:
- **Quick scanning** to find rares near your current location
- **Static reference data** that doesn't change
- **PowerPlay planning** with full CP calculations
- **Legality checking** for route safety
- **Manual route planning** - users build routes from scan results

No need to worry about keeping data updated - it's all static! Route planning is done manually by the user based on scan results.

