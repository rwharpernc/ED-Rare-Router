import { useState, useEffect, useRef } from "react";
import { searchPowers, type PowerPlayPower } from "../data/powers";

interface PowerInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
}

/**
 * Get faction color for styling
 */
function getFactionColor(faction: PowerPlayPower["faction"]): string {
  switch (faction) {
    case "Federation":
      return "text-blue-400";
    case "Alliance":
      return "text-green-400";
    case "Empire":
      return "text-purple-400";
    case "Independent":
      return "text-yellow-400";
    default:
      return "text-gray-400";
  }
}

/**
 * PowerPlay power input component with fuzzy search autocomplete.
 * 
 * Features:
 * - Instant fuzzy search on static power list (no API calls)
 * - Case-insensitive matching
 * - Dropdown suggestions with faction badges
 * - Click-outside-to-close behavior
 * - Similar UX to SystemInput for consistency
 */
export default function PowerInput({
  label,
  value,
  onChange,
  placeholder = "Enter power name...",
  name,
}: PowerInputProps) {
  const [suggestions, setSuggestions] = useState<PowerPlayPower[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Perform fuzzy search on power list
    if (value.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const matches = searchPowers(value);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (powerName: string) => {
    onChange(powerName);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.trim().length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((power, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(power.name)}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-100 focus:bg-gray-700 focus:outline-none flex items-center justify-between"
            >
              <span>{power.name}</span>
              <span className={`text-xs font-medium ${getFactionColor(power.faction)}`}>
                {power.faction}
              </span>
            </button>
          ))}
        </div>
      )}
      {showSuggestions && suggestions.length === 0 && value.trim().length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 text-gray-400 text-sm"
        >
          No matching powers found
        </div>
      )}
    </div>
  );
}
