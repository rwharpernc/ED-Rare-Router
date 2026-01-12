import { useState, useEffect } from "react";
import { rares } from "../data/rares";
import LegalityCurator from "./LegalityCurator";
import type { CuratedLegalityData } from "../lib/curatedLegality";

export default function CuratorApp() {
  const [curatedData, setCuratedData] = useState<CuratedLegalityData>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCurated, setFilterCurated] = useState<"all" | "curated" | "uncurated">("all");

  useEffect(() => {
    loadCuratedData();
  }, []);

  const loadCuratedData = async () => {
    try {
      const response = await fetch("/api/curated-legality");
      if (response.ok) {
        const data = await response.json();
        setCuratedData(data);
      }
    } catch (error) {
      console.error("Error loading curated data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (
    rareName: string,
    data: CuratedLegalityData[string]
  ) => {
    const response = await fetch("/api/curated-legality", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rareName, data }),
    });

    if (!response.ok) {
      throw new Error("Failed to save");
    }

    // Update local state
    setCuratedData((prev) => ({
      ...prev,
      [rareName]: data,
    }));
  };

  const handleDelete = async (rareName: string) => {
    const response = await fetch("/api/curated-legality", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rareName }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete");
    }

    // Update local state
    setCuratedData((prev) => {
      const next = { ...prev };
      delete next[rareName];
      return next;
    });
  };

  const filteredRares = rares.filter((rare) => {
    const matchesSearch =
      rare.rare.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rare.system.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterCurated === "curated") {
      return curatedData[rare.rare] !== undefined;
    }
    if (filterCurated === "uncurated") {
      return curatedData[rare.rare] === undefined;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-400">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by rare name or system..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filter
            </label>
            <select
              value={filterCurated}
              onChange={(e) =>
                setFilterCurated(
                  e.target.value as "all" | "curated" | "uncurated"
                )
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
            >
              <option value="all">All Rares</option>
              <option value="curated">Curated Only</option>
              <option value="uncurated">Uncurated Only</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          Showing {filteredRares.length} of {rares.length} rare goods
          {Object.keys(curatedData).length > 0 && (
            <span className="ml-2 text-blue-400">
              ({Object.keys(curatedData).length} curated)
            </span>
          )}
        </div>
      </div>

      {/* Rares List */}
      <div className="space-y-4">
        {filteredRares.map((rare) => (
          <LegalityCurator
            key={rare.rare}
            rare={rare}
            curatedData={curatedData[rare.rare]}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
