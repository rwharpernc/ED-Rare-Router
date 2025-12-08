import { useEffect, useMemo, useState } from "react";
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
  const [enablePagination, setEnablePagination] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<number>(100);
  const [page, setPage] = useState<number>(0);

  // Safety check for undefined/null results
  if (!results || !Array.isArray(results)) {
    console.warn('[ResultsList] Invalid results prop:', results);
    return (
      <div className="text-center py-8 text-gray-400">
        No results data available.
      </div>
    );
  }

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('[ResultsList] Rendering with:', { 
      resultsCount: results.length, 
      mode,
      firstResult: results[0] 
    });
  }

  const formatDistanceLy = (distance: number) => `${distance.toFixed(2)} ly`;
  const formatDistanceLs = (distance?: number) =>
    distance != null ? `${distance.toLocaleString()} Ls` : "N/A";
  const formatCredits = (credits?: number) =>
    credits != null ? `${credits.toLocaleString()} cr` : "N/A";
  const formatNumber = (value?: number) =>
    value != null ? value.toLocaleString() : "N/A";

  const isAnalyzeResult = (result: Result): result is AnalyzeResult => {
    return "distanceOriginToTargetLy" in result;
  };

  // Sort results by distance; keep entries even if distance is 0 so the user can see which systems failed lookup
  const sortedResults = useMemo(() => {
    const getDistance = (result: Result) => {
      const analyzeResult = isAnalyzeResult(result) ? result : null;
      return mode === "scan"
        ? result.distanceFromCurrentLy
        : analyzeResult?.distanceCurrentToOriginLy ?? 0;
    };
    return [...results].sort((a, b) => getDistance(a) - getDistance(b));
  }, [results, mode]);
  
  const distanceFromCurrent = (result: Result) => {
    const analyzeResult = isAnalyzeResult(result) ? result : null;
    return mode === "scan"
      ? result.distanceFromCurrentLy
      : analyzeResult?.distanceCurrentToOriginLy ?? 0;
  };
  
  // Count how many results have zero/unknown distance (likely missing coords)
  const invalidResults = sortedResults.filter((r) => distanceFromCurrent(r) <= 0).length;

  const maxDistance =
    sortedResults.length > 0
      ? Math.max(...sortedResults.map((r) => distanceFromCurrent(r)))
      : 0;
  
  if (sortedResults.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No rare goods found. Enter a current system to get started.
      </div>
    );
  }
  
  // If pagination is disabled, show all results
  const allZeroDistance = maxDistance === 0;
  const totalPages = allZeroDistance 
    ? 1 
    : Math.max(1, Math.ceil(Math.max(maxDistance, pageSize) / pageSize));
  const startLy = page * pageSize;
  const endLy = startLy + pageSize;

  useEffect(() => {
    setPage(0);
  }, [results, mode, pageSize, enablePagination]);

  // If pagination is disabled, show all results. Otherwise, apply distance-based pagination
  const pagedResults = !enablePagination
    ? sortedResults // Show all results when pagination is disabled
    : allZeroDistance
    ? sortedResults // Show all results if all distances are 0
    : sortedResults.filter((result) => {
        const distance = distanceFromCurrent(result);
        // Always include distance 0 results on page 1 (you're at the origin)
        if (distance === 0 && page === 0) return true;
        // Include the max distance item on the final page even if equal to endLy
        if (page === totalPages - 1 && distance === maxDistance) return true;
        return distance >= startLy && distance < endLy;
      });

  // If pagination filtered out all results, show a message (only when pagination is enabled)
  if (enablePagination && pagedResults.length === 0 && sortedResults.length > 0) {
    return (
      <div className="space-y-4">
        {invalidResults > 0 && (
          <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-200 text-sm">
            <strong>Note:</strong> {invalidResults} rare{invalidResults !== 1 ? 's' : ''} excluded because their origin systems couldn't be found in EDSM. This usually means the system name needs verification.
          </div>
        )}
        <div className="text-center py-8 text-gray-400">
          <p>No results found in the current distance range.</p>
          <p className="text-sm mt-2">Try adjusting the page size or navigating to a different page.</p>
          <p className="text-xs mt-1 text-gray-500">
            Showing page {page + 1} of {totalPages} (distance range {startLy.toFixed(0)}-{endLy.toFixed(0)} ly)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invalidResults > 0 && (
        <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-200 text-sm">
          <strong>Note:</strong> {invalidResults} rare{invalidResults !== 1 ? 's' : ''} excluded because their origin systems couldn't be found in EDSM. This usually means the system name needs verification.
        </div>
      )}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-sm">
        <div className="text-gray-300">
          Showing {pagedResults.length} of {sortedResults.length} rares
          {enablePagination && (
            <>
              {" "}• Distance range {startLy.toFixed(0)}-{Math.min(endLy, maxDistance).toFixed(0)}{" "}
              ly (from current to origin)
            </>
          )}
          {invalidResults > 0 && (
            <span className="text-yellow-300 ml-2">
              ({invalidResults} origin{invalidResults !== 1 ? "s" : ""} missing coordinates)
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enablePagination}
              onChange={(e) => setEnablePagination(e.target.checked)}
              className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-400 text-xs uppercase tracking-wide">
              Paginate by Distance
            </span>
          </label>
          {enablePagination && (
            <>
              <label className="text-gray-400 text-xs uppercase tracking-wide">
                Page Size (ly)
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  disabled={page === 0}
                  aria-label="Previous distance page"
                >
                  Prev
                </button>
                <span className="text-gray-300">
                  Page {page + 1} / {totalPages}
                </span>
                <button
                  className="px-3 py-1 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                  disabled={page >= totalPages - 1}
                  aria-label="Next distance page"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pagedResults.map((result, index) => {
          const analyzeResult = isAnalyzeResult(result) ? result : null;
          const distanceToOrigin = distanceFromCurrent(result);

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
                  {result.systemNotFound ? (
                    <span className="text-yellow-400 font-medium" title="Origin system not found in EDSM database">
                      Unknown (system not found)
                    </span>
                  ) : distanceToOrigin === 0 ? (
                    <span className="text-green-400 font-medium" title="You are at the origin system for this rare">
                      {formatDistanceLy(distanceToOrigin)} (You are here)
                    </span>
                  ) : (
                    <span className="text-blue-400 font-medium">
                      {formatDistanceLy(distanceToOrigin)}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-2 text-xs text-gray-400">
                  <div>
                    <span className="text-gray-500">Pad:</span>{" "}
                    <span className="text-gray-200">
                      {result.pad ?? "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Sell @ ≥</span>{" "}
                    <span className="text-gray-200">
                      {result.sellHintLy != null
                        ? `${result.sellHintLy} ly`
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">To Star:</span>{" "}
                    <span className="text-gray-200">
                      {formatDistanceLs(result.distanceToStarLs)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Allocation:</span>{" "}
                    <span className="text-gray-200">
                      {formatNumber(result.allocation)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Cost:</span>{" "}
                    <span className="text-gray-200">
                      {formatCredits(result.cost)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Permit:</span>{" "}
                    <span className="text-gray-200">
                      {result.permitRequired ? "Required" : "None"}
                    </span>
                  </div>
                </div>
                {result.stationState && (
                  <div>
                    <span className="text-gray-500">State:</span>{" "}
                    <span className="text-gray-200">{result.stationState}</span>
                  </div>
                )}
                {analyzeResult && (
                  <>
                    <div>
                      <span className="text-gray-500">To Target:</span>{" "}
                      <span className="text-purple-400 font-medium">
                        {formatDistanceLy(analyzeResult.distanceOriginToTargetLy)}
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
