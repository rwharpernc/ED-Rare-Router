import { useState } from "react";
import SystemInput from "./SystemInput";
import PowerInput from "./PowerInput";
import ResultsList from "./ResultsList";
import type { ScanResult, AnalyzeResult, PpSystemType } from "../types/api";

/**
 * Main interactive component for the ED Rare Router application.
 * 
 * Manages form state and handles both scan and analyze modes:
 * - Scan: Quick analysis from current system
 * - Analyze: Full route planning between current and target systems
 * 
 * Features:
 * - System autocomplete
 * - PowerPlay configuration
 * - Two-column layout (form left, results right on desktop)
 */
export default function RaresPlannerIsland() {
  const [currentSystem, setCurrentSystem] = useState("");
  const [targetSystem, setTargetSystem] = useState("");
  const [currentPpType, setCurrentPpType] = useState<PpSystemType>("none");
  const [targetPpType, setTargetPpType] = useState<PpSystemType>("none");
  const [power, setPower] = useState("");
  const [hasFinanceEthos, setHasFinanceEthos] = useState(false);
  const [mode, setMode] = useState<"scan" | "analyze">("scan");
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [analyzeResults, setAnalyzeResults] = useState<AnalyzeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          currentPpType,
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
      setMode("scan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setScanResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!currentSystem) {
      setError("Current system is required");
      return;
    }

    if (!targetSystem) {
      setError("Target system is required for analyze mode");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rares-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current: currentSystem,
          target: targetSystem,
          targetPpType,
          power,
          hasFinanceEthos,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze rares");
      }

      const data: AnalyzeResult[] = await response.json();
      setAnalyzeResults(data);
      setMode("analyze");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setAnalyzeResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentResults =
    mode === "scan" ? scanResults : analyzeResults;

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

      {/* Two-column layout: form on left, results on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Configuration
          </h2>

          <div className="space-y-4">
            {/* Mode toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Analysis Mode
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setMode("scan")}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                    mode === "scan"
                      ? "bg-blue-600 text-white ring-2 ring-blue-400"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">Quick Scan</div>
                    <div className="text-xs opacity-90 mt-0.5">From current location</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("analyze")}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                    mode === "analyze"
                      ? "bg-purple-600 text-white ring-2 ring-purple-400"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">Route Planning</div>
                    <div className="text-xs opacity-90 mt-0.5">Current → Target</div>
                  </div>
                </button>
              </div>
              <div className="text-xs text-gray-400 bg-gray-900/50 rounded p-2 border border-gray-700">
                {mode === "scan" ? (
                  <>
                    <strong className="text-blue-400">Quick Scan:</strong> Shows all rare goods near your current system. 
                    Use this when you're already at a location and want to see what's nearby.
                  </>
                ) : (
                  <>
                    <strong className="text-purple-400">Route Planning:</strong> Plans a route from your current system to a target system. 
                    Shows which rares are profitable to pick up along the way and checks if they're legal at your destination.
                  </>
                )}
              </div>
            </div>

            <SystemInput
              label="Current System"
              value={currentSystem}
              onChange={setCurrentSystem}
              required
              name="current"
            />

            {mode === "analyze" && (
              <SystemInput
                label="Target System"
                value={targetSystem}
                onChange={setTargetSystem}
                required
                placeholder="Enter target system for route planning..."
                name="target"
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                PowerPlay System Type
                {mode === "scan" && " (Current)"}
                {mode === "analyze" && " (Target)"}
              </label>
              <select
                value={mode === "scan" ? currentPpType : targetPpType}
                onChange={(e) => {
                  const value = e.target.value as PpSystemType;
                  if (mode === "scan") {
                    setCurrentPpType(value);
                  } else {
                    setTargetPpType(value);
                  }
                }}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="acquisition">Acquisition</option>
                <option value="exploit">Exploit</option>
                <option value="reinforcement">Reinforcement</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Only acquisition and exploit systems allow profit-based CP from
                rare goods
              </p>
            </div>

            <PowerInput
              label="Pledged Power (Optional)"
              value={power}
              onChange={setPower}
              placeholder="e.g., Aisling Duval, Zachary Hudson..."
              name="power"
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="financeEthos"
                checked={hasFinanceEthos}
                onChange={(e) => setHasFinanceEthos(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="financeEthos" className="ml-2 text-sm text-gray-300">
                Finance Ethos (reduces CP divisor from 5333 to 3555)
              </label>
            </div>

            <div className="pt-2">
              <button
                onClick={mode === "scan" ? handleScan : handleAnalyze}
                disabled={isLoading || !currentSystem || (mode === "analyze" && !targetSystem)}
                className={`w-full px-6 py-3 font-medium rounded-lg transition-colors ${
                  mode === "scan"
                    ? "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700"
                    : "bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700"
                } disabled:cursor-not-allowed text-white`}
              >
                {isLoading
                  ? mode === "scan"
                    ? "Scanning nearby rares..."
                    : "Analyzing route..."
                  : mode === "scan"
                  ? "Scan Nearby Rares"
                  : "Plan Route"}
              </button>
              {mode === "analyze" && !targetSystem && (
                <p className="text-xs text-yellow-400 mt-1">
                  ⚠ Enter a target system to plan your route
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Results */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Results ({currentResults.length} rare goods)
          </h2>
          <ResultsList results={currentResults} mode={mode} />
        </div>
      </div>
    </div>
  );
}
