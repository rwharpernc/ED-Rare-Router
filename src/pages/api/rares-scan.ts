import type { APIRoute } from "astro";
import { rares } from "../../data/rares";
import { getSystem } from "../../lib/edsm";
import { getRareOriginSystem } from "../../lib/rareSystemsCache";
import { lyDistance } from "../../lib/distances";
import { evaluateLegality } from "../../lib/legality";
import { ppEligibleForSystemType, cpDivisors } from "../../lib/powerplay";
import type { ScanRequest, ScanResult } from "../../types/api";

/**
 * Scan mode endpoint.
 * 
 * Analyzes all rare goods from the current system perspective:
 * - Computes distances from current system to each rare origin
 * - Evaluates legality at current system
 * - Determines PowerPlay eligibility
 * - Calculates CP divisors if eligible
 * 
 * Request body: ScanRequest
 * Returns: Array of ScanResult objects
 */
export const prerender = false; // Ensure this endpoint is server-rendered

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check if request has a body
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return new Response(
        JSON.stringify({ error: "Content-Type must be application/json" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body with error handling
    let body: ScanRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid JSON in request body",
          details: parseError instanceof Error ? parseError.message : "Unknown error"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { current, currentPpType, power, hasFinanceEthos } = body;

    if (!current) {
      return new Response(
        JSON.stringify({ error: "Current system is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Resolve current system coordinates
    const currentSystem = await getSystem(current);
    if (!currentSystem || !currentSystem.coords) {
      return new Response(
        JSON.stringify({
          error: "Could not find coordinates for current system",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Process each rare good
    const results: ScanResult[] = await Promise.all(
      rares.map(async (rare) => {
        // Try to get rare origin system from cache first, fall back to API
        let originSystem = await getRareOriginSystem(rare.system);
        
        // If not in cache, try API lookup (should be rare after initial cache is built)
        if (!originSystem) {
          originSystem = await getSystem(rare.system);
        }
        
        if (!originSystem?.coords) {
          // Log warning for systems that couldn't be found
          console.warn(`[rares-scan] Could not find coordinates for rare origin system: ${rare.system} (${rare.rare})`);
        }
        
        const systemNotFound = !originSystem?.coords;
        const distanceFromCurrentLy = originSystem?.coords
          ? lyDistance(currentSystem.coords, originSystem.coords)
          : 0;

        // Evaluate legality at current system
        const legality = evaluateLegality(rare, currentSystem);

        // Determine PP eligibility
        const eligible = ppEligibleForSystemType(rare, currentPpType);

        // Calculate CP divisors if eligible
        const cpDivisorInfo = eligible ? cpDivisors(hasFinanceEthos) : null;

        return {
          rare: rare.rare,
          originSystem: rare.system,
          originStation: rare.station,
          pad: rare.pad,
          sellHintLy: rare.sellHintLy,
          distanceToStarLs: rare.distanceToStarLs,
          allocation: rare.allocation,
          cost: rare.cost,
          permitRequired: rare.permitRequired,
          stationState: rare.stationState,
          distanceFromCurrentLy,
          systemNotFound,
          legal: legality.legal,
          legalReason: legality.reason,
          ppEligible: eligible,
          cpDivisors: cpDivisorInfo,
        };
      })
    );

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in rares-scan API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to scan rares" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
