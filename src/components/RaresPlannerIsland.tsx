import { useState, useMemo } from "react";
import SystemInput from "./SystemInput";
import PowerInput from "./PowerInput";
import ResultsList from "./ResultsList";
import type { ScanResult } from "../types/api";
import { getPowerByName } from "../data/powers";

/**
 * Main interactive component for the ED Rare Router application.
 * 
 * Quick scan functionality to find rare goods near your current system.
 * Route planning is done manually by the user based on scan results.
 * 
 * Features:
 * - System autocomplete
 * - PowerPlay configuration
 * - Vertical layout (selector panel above results)
 */
export default function RaresPlannerIsland() {
  const [currentSystem, setCurrentSystem] = useState("Sol");
  const [power, setPower] = useState("");
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-determine Finance Ethos from selected power
  const hasFinanceEthos = useMemo(() => {
    if (!power) return false;
    const powerData = getPowerByName(power);
    return powerData?.hasFinanceEthos ?? false;
  }, [power]);

  const handleScan = async () => {
    if (!currentSystem) {
      setError("Current system is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rares-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current: currentSystem,
          currentPpType: "none",
          power,
          hasFinanceEthos,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to scan rares");
      }

      const data: ScanResult[] = await response.json();
      setScanResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setScanResults([]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          ED Rare Router
        </h1>
        <p className="text-gray-400">
          Rare goods + PowerPlay route helper
        </p>
      </div>

      {/* Vertical layout: selector panel above results */}
      <div className="flex flex-col gap-6">
        {/* Selector panel: Configuration */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Configuration
          </h2>

          <div className="space-y-4">
            <SystemInput
              label="Current System"
              value={currentSystem}
              onChange={setCurrentSystem}
              required
              name="current"
            />

            <PowerInput
              label="Pledged Power (Optional)"
              value={power}
              onChange={setPower}
              placeholder="e.g., Aisling Duval, Jerome Archer..."
              name="power"
            />
            {power && hasFinanceEthos && (
              <div className="p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-200 text-sm">
                <strong>Finance Ethos Active:</strong> This power has Finance Ethos. CP divisor will be reduced from 5,333 to 3,555 for eligible rares.
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={handleScan}
                disabled={isLoading || !currentSystem}
                className="w-full px-6 py-3 font-medium rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white"
              >
                {isLoading ? "Scanning nearby rares..." : "Scan Nearby Rares"}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results panel */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Results ({scanResults.length} rare goods)
            {isLoading && <span className="text-sm text-gray-400 ml-2">(Loading...)</span>}
          </h2>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">
              Scanning nearby rares...
            </div>
          ) : (
            <ResultsList results={scanResults} mode="scan" />
          )}
        </div>
      </div>
    </div>
  );
}
