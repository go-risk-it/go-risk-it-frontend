/**
 * Display formatting helpers for game entities.
 */

/**
 * Convert a snake_case region ID into a human-readable label.
 * @param id - Region identifier (e.g., "eastern_australia")
 * @returns Display name with spaces (e.g., "eastern australia")
 */
export const formatRegionName = (id: string): string => id.replace(/_/g, ' ');
