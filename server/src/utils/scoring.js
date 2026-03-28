import config from '../config.js';

/**
 * Score and rank travel options.
 * Lower score = better option.
 * Score = weighted combination of normalized duration and cost.
 */
export function scoreAndRank(results) {
  if (results.length === 0) return [];

  // Find min/max for normalization
  const durations = results.map(r => r.durationMin).filter(d => d > 0);
  const costs = results.map(r => r.costEur).filter(c => c > 0);

  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs);

  const durationRange = maxDuration - minDuration || 1;
  const costRange = maxCost - minCost || 1;

  // Calculate score for each result
  const scored = results.map(result => {
    const normDuration = (result.durationMin - minDuration) / durationRange;
    const normCost = result.costEur > 0 ? (result.costEur - minCost) / costRange : 0.5;

    const score = config.durationWeight * normDuration + config.costWeight * normCost;

    return { ...result, score: Math.round(score * 1000) / 1000 };
  });

  // Sort by score (lower is better)
  scored.sort((a, b) => a.score - b.score);

  // Assign ranks
  return scored.map((result, index) => ({
    ...result,
    rank: index + 1,
  }));
}
