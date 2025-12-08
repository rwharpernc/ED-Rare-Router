import type { APIRoute } from "astro";
import { rares } from "../../data/rares";
import { getSystem } from "../../lib/edsm";
import { getRareOriginSystem } from "../../lib/rareSystemsCache";
import { lyDistance } from "../../lib/distances";
import { evaluateLegality } from "../../lib/legality";
import { ppEligibleForSystemType, cpDivisors } from "../../lib/powerplay";
import type { AnalyzeRequest, AnalyzeResult } from "../../types/api";

/**
 * Analyze mode endpoint.
 * 
 * Analyzes rare goods for route planning between current and target systems:
 * - Computes distance from current to rare origin
 * - Computes distance from rare origin to target
 * - Checks if target distance is in profit range (>= sellHintLy)
 * - Evaluates legality at target system
 * - Determines PowerPlay eligibility at target
 * - Calculates CP divisors if eligible
 * 
 * Request body: AnalyzeRequest
 * Returns: Array of AnalyzeResult objects
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
    let body: AnalyzeRequest;
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

    const { current, target, targetPpType, power, hasFinanceEthos } = body;

    if (!current) {
      return new Response(
        JSON.stringify({ error: "Current system is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!target) {
      return new Response(
        JSON.stringify({ error: "Target system is required for analyze mode" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Resolve current and target systems
    const currentSystem = await getSystem(current);
    const targetSystem = await getSystem(target);

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

    if (!targetSystem || !targetSystem.coords) {
      return new Response(
        JSON.stringify({
          error: "Could not find coordinates for target system",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Process each rare good
    const results: AnalyzeResult[] = await Promise.all(
      rares.map(async (rare) => {
        // Try to get rare origin system from cache first, fall back to API
        let originSystem = await getRareOriginSystem(rare.system);
        
        // If not in cache, try API lookup (should be rare after initial cache is built)
        if (!originSystem) {
          originSystem = await getSystem(rare.system);
        }

        const systemNotFound = !originSystem?.coords;
        
        if (systemNotFound) {
          // Return result with system not found flag
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
            distanceCurrentToOriginLy: 0,
            distanceOriginToTargetLy: 0,
            systemNotFound: true,
            inProfitRange: false,
            legal: true,
            legalReason: "Origin system not found in EDSM",
            ppEligible: false,
            cpDivisors: null,
          };
        }

        // Compute distances
        const distanceCurrentToOriginLy = lyDistance(
          currentSystem.coords,
          originSystem.coords
        );
        const distanceOriginToTargetLy = lyDistance(
          originSystem.coords,
          targetSystem.coords
        );

        // Check if in profit range (target distance >= sellHintLy)
        const inProfitRange = distanceOriginToTargetLy >= rare.sellHintLy;

        // Evaluate legality at target system
        const legality = evaluateLegality(rare, targetSystem);

        // Determine PP eligibility at target
        const eligible = ppEligibleForSystemType(rare, targetPpType);

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
          distanceCurrentToOriginLy,
          distanceOriginToTargetLy,
          systemNotFound: false,
          inProfitRange,
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
    console.error("Error in rares-analyze API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze rares" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
