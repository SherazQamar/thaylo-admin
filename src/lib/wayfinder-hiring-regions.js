/**
 * Hiring / coverage regions for US Wayfinders.
 * Timezone follows the region they were hired for (operational hours).
 */
export const WAYFINDER_HIRING_REGIONS = [
  {
    code: 'US-Pacific',
    label: 'US Pacific (West Coast hours)',
    timeZone: 'America/Los_Angeles',
    timeZoneLabel: 'Pacific Time (PT)',
  },
  {
    code: 'US-Mountain',
    label: 'US Mountain',
    timeZone: 'America/Denver',
    timeZoneLabel: 'Mountain Time (MT)',
  },
  {
    code: 'US-Arizona',
    label: 'US Arizona (no DST)',
    timeZone: 'America/Phoenix',
    timeZoneLabel: 'Mountain Time — Arizona (no DST)',
  },
  {
    code: 'US-Central',
    label: 'US Central',
    timeZone: 'America/Chicago',
    timeZoneLabel: 'Central Time (CT)',
  },
  {
    code: 'US-Eastern',
    label: 'US Eastern (East Coast hours)',
    timeZone: 'America/New_York',
    timeZoneLabel: 'Eastern Time (ET)',
  },
  {
    code: 'US-Alaska',
    label: 'US Alaska',
    timeZone: 'America/Anchorage',
    timeZoneLabel: 'Alaska Time (AKT)',
  },
  {
    code: 'US-Hawaii',
    label: 'US Hawaii',
    timeZone: 'Pacific/Honolulu',
    timeZoneLabel: 'Hawaii Time (HT)',
  },
]

export function hiringRegionByCode(code) {
  if (!code?.trim()) return null
  const normalized = code.trim()
  return (
    WAYFINDER_HIRING_REGIONS.find(
      (r) => r.code.toLowerCase() === normalized.toLowerCase(),
    ) ?? null
  )
}
