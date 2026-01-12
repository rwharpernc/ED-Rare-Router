import { useState, useEffect } from "react";
import { rares } from "../data/rares";
import type { RareGood } from "../types/rares";
import type { CuratedLegalityData } from "../lib/curatedLegality";

interface LegalityCuratorProps {
  rare: RareGood;
  curatedData?: CuratedLegalityData[string];
  onSave: (rareName: string, data: CuratedLegalityData[string]) => Promise<void>;
  onDelete: (rareName: string) => Promise<void>;
}

export default function LegalityCurator({
  rare,
  curatedData,
  onSave,
  onDelete,
}: LegalityCuratorProps) {
  const [illegalInSuperpowers, setIllegalInSuperpowers] = useState<string[]>(
    curatedData?.illegalInSuperpowers ?? rare.illegalInSuperpowers ?? []
  );
  const [illegalInGovs, setIllegalInGovs] = useState<string[]>(
    curatedData?.illegalInGovs ?? rare.illegalInGovs ?? []
  );
  const [combinedRestrictions, setCombinedRestrictions] = useState<
    Array<{ superpower: string; government: string }>
  >(curatedData?.illegalInSuperpowerGovs ?? rare.illegalInSuperpowerGovs ?? []);

  const [newSuperpower, setNewSuperpower] = useState("");
  const [newGov, setNewGov] = useState("");
  const [newCombinedSuperpower, setNewCombinedSuperpower] = useState("");
  const [newCombinedGov, setNewCombinedGov] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const superpowers = ["Federation", "Empire", "Alliance", "Independent"];
  const governments = [
    "Anarchy",
    "Communism",
    "Confederacy",
    "Cooperative",
    "Corporate",
    "Democracy",
    "Dictatorship",
    "Feudal",
    "Patronage",
    "Prison",
    "Prison Colony",
    "Theocracy",
  ];

  const hasChanges =
    JSON.stringify(illegalInSuperpowers) !==
      JSON.stringify(rare.illegalInSuperpowers ?? []) ||
    JSON.stringify(illegalInGovs) !==
      JSON.stringify(rare.illegalInGovs ?? []) ||
    JSON.stringify(combinedRestrictions) !==
      JSON.stringify(rare.illegalInSuperpowerGovs ?? []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await onSave(rare.rare, {
        illegalInSuperpowers,
        illegalInGovs,
        illegalInSuperpowerGovs: combinedRestrictions,
      });
      setSaveMessage("Saved successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage("Error saving: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete curated data for ${rare.rare}? This will revert to base data.`)) {
      return;
    }
    try {
      await onDelete(rare.rare);
      // Reset to base data
      setIllegalInSuperpowers(rare.illegalInSuperpowers ?? []);
      setIllegalInGovs(rare.illegalInGovs ?? []);
      setCombinedRestrictions(rare.illegalInSuperpowerGovs ?? []);
      setSaveMessage("Deleted and reverted to base data");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage("Error deleting: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const addSuperpower = () => {
    if (newSuperpower && !illegalInSuperpowers.includes(newSuperpower)) {
      setIllegalInSuperpowers([...illegalInSuperpowers, newSuperpower]);
      setNewSuperpower("");
    }
  };

  const removeSuperpower = (sp: string) => {
    setIllegalInSuperpowers(illegalInSuperpowers.filter((s) => s !== sp));
  };

  const addGov = () => {
    if (newGov && !illegalInGovs.includes(newGov)) {
      setIllegalInGovs([...illegalInGovs, newGov]);
      setNewGov("");
    }
  };

  const removeGov = (gov: string) => {
    setIllegalInGovs(illegalInGovs.filter((g) => g !== gov));
  };

  const addCombined = () => {
    if (
      newCombinedSuperpower &&
      newCombinedGov &&
      !combinedRestrictions.some(
        (r) =>
          r.superpower === newCombinedSuperpower &&
          r.government === newCombinedGov
      )
    ) {
      setCombinedRestrictions([
        ...combinedRestrictions,
        {
          superpower: newCombinedSuperpower,
          government: newCombinedGov,
        },
      ]);
      setNewCombinedSuperpower("");
      setNewCombinedGov("");
    }
  };

  const removeCombined = (index: number) => {
    setCombinedRestrictions(combinedRestrictions.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">{rare.rare}</h3>
          <p className="text-sm text-gray-400">
            {rare.system} - {rare.station}
          </p>
        </div>
        {curatedData && (
          <span className="px-2 py-1 text-xs bg-blue-900 text-blue-200 rounded">
            Curated
          </span>
        )}
      </div>

      {/* Illegal in Superpowers */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Illegal in Superpowers (all government types)
        </label>
        <div className="flex gap-2 mb-2">
          <select
            value={newSuperpower}
            onChange={(e) => setNewSuperpower(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
          >
            <option value="">Select superpower...</option>
            {superpowers.map((sp) => (
              <option key={sp} value={sp}>
                {sp}
              </option>
            ))}
          </select>
          <button
            onClick={addSuperpower}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {illegalInSuperpowers.map((sp) => (
            <span
              key={sp}
              className="px-3 py-1 bg-red-900 text-red-200 rounded flex items-center gap-2"
            >
              {sp}
              <button
                onClick={() => removeSuperpower(sp)}
                className="text-red-300 hover:text-red-100"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Illegal in Governments */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Illegal in Governments (all superpowers)
        </label>
        <div className="flex gap-2 mb-2">
          <select
            value={newGov}
            onChange={(e) => setNewGov(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
          >
            <option value="">Select government...</option>
            {governments.map((gov) => (
              <option key={gov} value={gov}>
                {gov}
              </option>
            ))}
          </select>
          <button
            onClick={addGov}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {illegalInGovs.map((gov) => (
            <span
              key={gov}
              className="px-3 py-1 bg-red-900 text-red-200 rounded flex items-center gap-2"
            >
              {gov}
              <button
                onClick={() => removeGov(gov)}
                className="text-red-300 hover:text-red-100"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Combined Restrictions */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Illegal in Combined (Superpower + Government)
        </label>
        <div className="flex gap-2 mb-2">
          <select
            value={newCombinedSuperpower}
            onChange={(e) => setNewCombinedSuperpower(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
          >
            <option value="">Superpower...</option>
            {superpowers.map((sp) => (
              <option key={sp} value={sp}>
                {sp}
              </option>
            ))}
          </select>
          <select
            value={newCombinedGov}
            onChange={(e) => setNewCombinedGov(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100"
          >
            <option value="">Government...</option>
            {governments.map((gov) => (
              <option key={gov} value={gov}>
                {gov}
              </option>
            ))}
          </select>
          <button
            onClick={addCombined}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {combinedRestrictions.map((r, idx) => (
            <span
              key={`${r.superpower}-${r.government}-${idx}`}
              className="px-3 py-1 bg-orange-900 text-orange-200 rounded flex items-center gap-2"
            >
              {r.superpower} {r.government}
              <button
                onClick={() => removeCombined(idx)}
                className="text-orange-300 hover:text-orange-100"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-700">
        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        {curatedData && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Delete Curated Data
          </button>
        )}
        {saveMessage && (
          <span className="px-4 py-2 text-sm text-gray-300">{saveMessage}</span>
        )}
      </div>
    </div>
  );
}
