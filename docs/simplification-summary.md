# Simplification Summary: Scan-Only Approach

## Overview

The application has been simplified to focus on **quick scanning** functionality. Route planning is now done manually by the user based on scan results, making the tool faster and simpler to use.

## Key Changes

### 1. Removed Analyze Mode

**Removed:**
- Analyze mode endpoint (`/api/rares-analyze`)
- Target system input
- Route planning calculations (current → origin → target)
- Profit range calculations
- `AnalyzeResult` type
- `AnalyzeRequest` type

**Rationale:** Route planning is better done manually by the user. The scan provides all necessary information (distances, legality, PowerPlay eligibility) for users to build their own routes.

### 2. Simplified UI

**Before:**
- Mode toggle (Scan vs Analyze)
- Current system input
- Target system input (when in analyze mode)
- Two different buttons (Scan vs Plan Route)

**After:**
- Current system input only
- Single "Scan Nearby Rares" button
- Cleaner, simpler interface

### 3. Updated Components

**RaresPlannerIsland:**
- Removed mode state
- Removed target system state
- Removed analyze handler
- Simplified to scan-only

**ResultsList:**
- Removed analyze result handling
- Simplified to only display scan results
- Removed target distance and profit range displays

### 4. PowerPlay Functionality Preserved

✅ All PowerPlay functionality remains intact:
- PP system type selection (for current system)
- Power selection
- Finance ethos checkbox
- CP divisor calculations
- PP eligibility checks

## Benefits

1. **Simpler UX**: One clear purpose - scan for nearby rares
2. **Faster**: No complex route calculations
3. **More Flexible**: Users can plan routes manually based on their needs
4. **Less Code**: Reduced complexity and maintenance burden

## Usage Flow

1. User enters current system
2. User selects pledged power (optional - for Finance Ethos detection)
3. User clicks "Scan Nearby Rares"
4. Results show all rares with:
   - Distance from current to origin
   - Legality at current system
   - Pad size, cost, permit requirements
5. User manually plans route based on results

## Future Enhancements

The TODO list has been updated with priorities for:
- Better API integration with Frontier Developments
- Enhanced routing system using Spansh or EDSM data
- These will provide automated route planning when ready

