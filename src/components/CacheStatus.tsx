import { useEffect, useState } from "react";

interface CacheStatusData {
  rareSystems?: {
    lastUpdated?: string;
    totalSystems?: number;
  };
  marketData?: {
    fetchedAt?: string;
    totalRares?: number;
    successCount?: number;
    cacheFresh?: boolean;
  };
  eddnWorker?: {
    lastUpdated?: string;
    totalEntries?: number;
  };
}

/**
 * Formats a date string to a human-readable relative time
 */
function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      const minutes = Math.floor(diffMs / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      const hours = Math.floor(diffHours);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      const days = Math.floor(diffDays);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  } catch {
    return "Unknown";
  }
}

/**
 * Formats a full date string for display
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch {
    return dateString;
  }
}

export default function CacheStatus() {
  const [status, setStatus] = useState<CacheStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch("/api/cache-status");
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error("Error fetching cache status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStatus();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return null;
  }

  if (!status || (!status.rareSystems && !status.marketData && !status.eddnWorker)) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-xs text-gray-400">
      <div className="font-medium text-gray-300 mb-2">Data Last Updated:</div>
      <div className="space-y-1">
        {status.rareSystems?.lastUpdated && (
          <div>
            <span className="text-gray-500">Rare Systems Cache:</span>{" "}
            <span className="text-gray-300">
              {formatRelativeTime(status.rareSystems.lastUpdated)}
            </span>
            {status.rareSystems.totalSystems && (
              <span className="text-gray-500 ml-2">
                ({status.rareSystems.totalSystems} systems)
              </span>
            )}
          </div>
        )}
        {status.marketData?.fetchedAt && (
          <div>
            <span className="text-gray-500">Market Data:</span>{" "}
            <span className={status.marketData.cacheFresh ? "text-green-400" : "text-yellow-400"}>
              {formatRelativeTime(status.marketData.fetchedAt)}
            </span>
            {status.marketData.cacheFresh === false && (
              <span className="text-yellow-400 ml-2">(stale)</span>
            )}
            {status.marketData.successCount !== undefined && (
              <span className="text-gray-500 ml-2">
                ({status.marketData.successCount} of {status.marketData.totalRares} rares)
              </span>
            )}
          </div>
        )}
        {status.eddnWorker?.lastUpdated && (
          <div>
            <span className="text-gray-500">EDDN Worker:</span>{" "}
            <span className="text-blue-400">
              {formatRelativeTime(status.eddnWorker.lastUpdated)}
            </span>
            {status.eddnWorker.totalEntries !== undefined && (
              <span className="text-gray-500 ml-2">
                ({status.eddnWorker.totalEntries} entries)
              </span>
            )}
          </div>
        )}
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-gray-500 hover:text-gray-400">
          Show full timestamps
        </summary>
        <div className="mt-2 space-y-1 text-gray-500">
          {status.rareSystems?.lastUpdated && (
            <div>
              Rare Systems: {formatDate(status.rareSystems.lastUpdated)}
            </div>
          )}
          {status.marketData?.fetchedAt && (
            <div>
              Market Data: {formatDate(status.marketData.fetchedAt)}
            </div>
          )}
          {status.eddnWorker?.lastUpdated && (
            <div>
              EDDN Worker: {formatDate(status.eddnWorker.lastUpdated)}
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
