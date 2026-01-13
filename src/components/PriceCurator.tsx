import { useState } from "react";
import type { RareGood } from "../types/rares";
import type { CuratedPriceData } from "../lib/curatedPrices";

interface PriceCuratorProps {
  rare: RareGood;
  curatedData?: CuratedPriceData[string];
  onSave: (rareName: string, data: CuratedPriceData[string]) => Promise<void>;
  onDelete: (rareName: string) => Promise<void>;
}

export default function PriceCurator({
  rare,
  curatedData,
  onSave,
  onDelete,
}: PriceCuratorProps) {
  const [cost, setCost] = useState<string>(
    curatedData?.cost?.toString() ?? rare.cost?.toString() ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const hasCuratedData = curatedData !== undefined;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const costValue = cost.trim() === "" ? undefined : parseFloat(cost);
      
      if (costValue !== undefined && (isNaN(costValue) || costValue < 0)) {
        setSaveMessage("Cost must be a non-negative number");
        setIsSaving(false);
        return;
      }

      await onSave(rare.rare, {
        cost: costValue,
      });

      setSaveMessage("Saved successfully!");
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (error) {
      setSaveMessage("Error saving: " + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!hasCuratedData) return;

    if (!confirm(`Delete curated price data for ${rare.rare}?`)) {
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await onDelete(rare.rare);
      setCost(rare.cost?.toString() ?? "");
      setSaveMessage("Deleted successfully!");
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (error) {
      setSaveMessage("Error deleting: " + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">{rare.rare}</h3>
          <p className="text-sm text-gray-400">
            {rare.system} / {rare.station}
          </p>
        </div>
        {hasCuratedData && (
          <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
            Curated
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Baseline Cost (Credits)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder={rare.cost?.toString() ?? "Enter baseline cost..."}
              min="0"
              step="1"
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
            />
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            {hasCuratedData && (
              <button
                onClick={handleDelete}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded font-medium"
              >
                Delete
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Baseline purchase price. Leave empty to use base data or remove curated entry.
            {rare.cost && (
              <span className="ml-2 text-gray-500">
                Base data: {rare.cost.toLocaleString()} credits
              </span>
            )}
          </p>
        </div>

        {saveMessage && (
          <div
            className={`p-2 rounded text-sm ${
              saveMessage.includes("Error")
                ? "bg-red-900 text-red-200"
                : "bg-green-900 text-green-200"
            }`}
          >
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  );
}
