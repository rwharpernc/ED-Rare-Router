import type { ScanResult, AnalyzeResult } from "../types/api";

type Result = ScanResult | AnalyzeResult;

interface ResultsListProps {
  results: Result[];
  mode: "scan" | "analyze";
}

/**
 * Displays rare goods analysis results in a card-based layout.
 * 
 * Supports both scan and analyze modes with different data fields.
 * Shows legality, distances, PP eligibility, and CP divisor information.
 */
export default function ResultsList({ results, mode }: ResultsListProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No rare goods found. Enter a current system to get started.
      </div>
    );
  }

  const formatDistance = (distance: number) => {
    return `${distance.toFixed(2)} ly`;
  };

  const isAnalyzeResult = (result: Result): result is AnalyzeResult => {
    return "distanceOriginToTargetLy" in result;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result, index) => {
          const analyzeResult = isAnalyzeResult(result) ? result : null;

          return (
            <div
              key={index}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-100">
                  {result.rare}
                </h3>
                <div className="flex flex-col gap-1">
                  {!result.legal && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-900 text-red-200 rounded">
                      Illegal
                    </span>
                  )}
                  {result.legal && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-900 text-green-200 rounded">
                      Legal
                    </span>
                  )}
                  {result.ppEligible && (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-900 text-yellow-200 rounded">
                      PP Eligible
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-400">
                <div>
                  <span className="text-gray-500">System:</span>{" "}
                  <span className="text-gray-300">{result.originSystem}</span>
                </div>
                <div>
                  <span className="text-gray-500">Station:</span>{" "}
                  <span className="text-gray-300">{result.originStation}</span>
                </div>
                <div>
                  <span className="text-gray-500">Distance:</span>{" "}
                  <span className="text-blue-400 font-medium">
                    {formatDistance(
                      mode === "scan"
                        ? result.distanceFromCurrentLy
                        : analyzeResult?.distanceCurrentToOriginLy || 0
                    )}
                  </span>
                </div>
                {analyzeResult && (
                  <>
                    <div>
                      <span className="text-gray-500">To Target:</span>{" "}
                      <span className="text-purple-400 font-medium">
                        {formatDistance(analyzeResult.distanceOriginToTargetLy)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Profit Range:</span>{" "}
                      <span
                        className={`font-medium ${
                          analyzeResult.inProfitRange
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {analyzeResult.inProfitRange ? "Yes" : "No"}
                      </span>
                    </div>
                  </>
                )}
                <div className="text-xs text-gray-500 italic">
                  {result.legalReason}
                </div>
                {result.ppEligible && result.cpDivisors && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="text-yellow-400 font-medium text-xs">
                      CP Divisors
                    </div>
                    <div className="text-yellow-300 text-xs">
                      Base: {result.cpDivisors.divisor.toLocaleString()}
                    </div>
                    <div className="text-yellow-300 text-xs">
                      With Finance:{" "}
                      {result.cpDivisors.divisorWithFinanceEthos.toLocaleString()}
                    </div>
                    <div className="text-yellow-200 font-semibold text-xs">
                      Effective: {result.cpDivisors.effective.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
