import { useState, useEffect, useRef } from "react";
import { fuzzySearch } from "../lib/fuzzySearch";

interface SystemInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  name?: string;
}

/**
 * Reusable system input component with autocomplete suggestions.
 * 
 * Features:
 * - Debounced API calls to reduce server load
 * - Dropdown suggestions from EDSM API
 * - Click-outside-to-close behavior
 * - Loading indicator during fetch
 */
export default function SystemInput({
  label,
  value,
  onChange,
  required = false,
  placeholder = "Enter system name...",
  name,
}: SystemInputProps) {
  const [suggestions, setSuggestions] = useState<
    Array<{ name: string; coords?: { x: number; y: number; z: number } }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<"valid" | "invalid" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/systems?q=${encodeURIComponent(value)}`
        );
        const data = await response.json();
        const systems = Array.isArray(data) ? data : [];

        // Apply fuzzy search to improve matching and sort by relevance
        // This helps with typos and partial matches
        const fuzzyResults = fuzzySearch(value, systems, 0.1);
        const sortedSuggestions = fuzzyResults.map((result) => result.item);

        setSuggestions(sortedSuggestions);
        setShowSuggestions(sortedSuggestions.length > 0);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce API calls
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
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

  // Verify system name when user finishes typing (on blur or after delay)
  useEffect(() => {
    // Early return if value is too short
    if (!value || value.trim().length < 2) {
      setValidationStatus(null);
      return;
    }

    const trimmedValue = value.trim();
    
    // Double-check we have a valid value
    if (!trimmedValue || trimmedValue.length < 2) {
      setValidationStatus(null);
      return;
    }
    
    const normalizedValue = trimmedValue.toLowerCase();

    // Always check suggestions first (case-insensitive match)
    const exactSuggestionMatch = suggestions.find(
      (s) => s.name.toLowerCase() === normalizedValue
    );
    
    if (exactSuggestionMatch) {
      setValidationStatus("valid");
      // Update to exact case from suggestion if different
      if (exactSuggestionMatch.name !== trimmedValue) {
        onChange(exactSuggestionMatch.name);
      }
      return;
    }

    // Don't validate via API while autocomplete is still loading
    // Wait for autocomplete to finish first
    if (isLoading) {
      setValidationStatus(null);
      return;
    }

    // Only verify via API if no suggestion match and autocomplete has finished
    // Wait a bit longer to ensure autocomplete has had time to return results
    const verifySystem = async () => {
      // Capture current values to avoid closure issues
      const currentValue = value.trim();
      const currentNormalized = currentValue.toLowerCase();
      const currentSuggestions = suggestions;
      
      // Validate we still have a valid value
      if (!currentValue || currentValue.length < 2) {
        setValidationStatus(null);
        return;
      }

      // Double-check suggestions one more time (in case they loaded while we waited)
      const finalSuggestionMatch = currentSuggestions.find(
        (s) => s.name.toLowerCase() === currentNormalized
      );
      
      if (finalSuggestionMatch) {
        setValidationStatus("valid");
        if (finalSuggestionMatch.name !== currentValue) {
          onChange(finalSuggestionMatch.name);
        }
        return;
      }

      // If we have suggestions but no exact match, the system might still be valid
      // (user might have typed a partial match). Only validate via API if we have
      // no suggestions at all, or if the value is significantly different from suggestions.
      if (currentSuggestions.length > 0) {
        // We have suggestions but no exact match - might be a partial match
        // Don't mark as invalid, just leave as unknown
        setValidationStatus(null);
        return;
      }

      // No suggestions found - verify via API lookup (EDSM API is case-insensitive)
      setIsValidating(true);
      try {
        const lookupUrl = `/api/system-lookup?name=${encodeURIComponent(currentValue)}`;
        console.log(`[SystemInput] Verifying system: "${currentValue}"`);
        
        const response = await fetch(lookupUrl);
        
        if (!response.ok) {
          // Handle 400 errors (bad request) differently from 500 errors
          if (response.status === 400) {
            const errorData = await response.json().catch(() => ({}));
            console.warn(`[SystemInput] Lookup API returned 400:`, errorData);
            // Don't mark as invalid for 400 - might be a validation issue
            setValidationStatus(null);
          } else {
            console.warn(`[SystemInput] Lookup API returned ${response.status}`);
            setValidationStatus(null);
          }
          return;
        }
        
        const data = await response.json();
        
        if (data.found && data.system) {
          setValidationStatus("valid");
          // Update value to exact system name from API (case correction)
          if (data.system.name !== currentValue) {
            onChange(data.system.name);
          }
        } else {
          // Only mark as invalid if we're sure it's not found
          // (not just a network error)
          setValidationStatus("invalid");
        }
      } catch (error) {
        console.error("Error verifying system:", error);
        // Don't set invalid on network errors, just leave as unknown
        setValidationStatus(null);
      } finally {
        setIsValidating(false);
      }
    };

    // Debounce verification (wait 2 seconds after user stops typing)
    // Longer delay to ensure autocomplete has finished
    const timeoutId = setTimeout(verifySystem, 2000);
    return () => clearTimeout(timeoutId);
  }, [value, suggestions, isLoading, onChange]);

  const handleSelect = (systemName: string) => {
    onChange(systemName);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setValidationStatus(null); // Reset validation on change
          }}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          onBlur={() => {
            // Verify on blur if not already validated
            if (value.trim().length >= 2 && validationStatus === null) {
              // Verification will happen via useEffect
            }
          }}
          placeholder={placeholder}
          className={`w-full px-4 py-2 pr-10 bg-gray-800 border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent ${
            validationStatus === "valid"
              ? "border-green-600 focus:ring-green-500"
              : validationStatus === "invalid"
              ? "border-red-600 focus:ring-red-500"
              : "border-gray-700 focus:ring-blue-500"
          }`}
        />
        <div className="absolute right-3 top-9 flex items-center gap-2">
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
          {!isLoading && isValidating && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
          )}
          {!isLoading && !isValidating && validationStatus === "valid" && (
            <svg
              className="h-4 w-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {!isLoading && !isValidating && validationStatus === "invalid" && (
            <svg
              className="h-4 w-4 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>
      </div>
      {validationStatus === "invalid" && value.trim().length >= 2 && (
        <p className="text-xs text-red-400 mt-1">
          System not found. Please check spelling or select from suggestions.
        </p>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((system, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(system.name)}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-100 focus:bg-gray-700 focus:outline-none"
            >
              {system.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
