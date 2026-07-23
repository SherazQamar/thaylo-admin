const READ_PREFIX = 'thaylo-admin-alerts-read:'
const RESOLVED_PREFIX = 'thaylo-admin-alerts-resolved:'

/**
 * @param {string} prefix
 * @param {number | string | null | undefined} userId
 */
function storageKey(prefix, userId) {
  return `${prefix}${userId ?? 'anon'}`
}

/**
 * @param {string} prefix
 * @param {number | string | null | undefined} userId
 * @returns {Set<string>}
 */
function loadIdSet(prefix, userId) {
  try {
    const raw = localStorage.getItem(storageKey(prefix, userId))
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.map(String))
  } catch {
    return new Set()
  }
}

/**
 * @param {string} prefix
 * @param {number | string | null | undefined} userId
 * @param {Set<string> | string[]} ids
 */
function persistIdSet(prefix, userId, ids) {
  localStorage.setItem(storageKey(prefix, userId), JSON.stringify(Array.from(ids)))
}

/**
 * @param {number | string | null | undefined} userId
 * @returns {Set<string>}
 */
export function getReadAdminAlertIds(userId) {
  return loadIdSet(READ_PREFIX, userId)
}

/**
 * @param {number | string | null | undefined} userId
 * @returns {Set<string>}
 */
export function getResolvedAdminAlertIds(userId) {
  return loadIdSet(RESOLVED_PREFIX, userId)
}

/**
 * @param {number | string | null | undefined} userId
 * @param {string} alertId
 * @returns {boolean} true if newly marked
 */
export function markAdminAlertRead(userId, alertId) {
  if (!alertId) return false
  const ids = getReadAdminAlertIds(userId)
  const key = String(alertId)
  if (ids.has(key)) return false
  ids.add(key)
  persistIdSet(READ_PREFIX, userId, ids)
  return true
}

/**
 * Clears an alert from the admin feed (any kind: lesson / SEL / parent message).
 * @param {number | string | null | undefined} userId
 * @param {string} alertId
 * @returns {boolean} true if newly resolved
 */
export function markAdminAlertResolved(userId, alertId) {
  if (!alertId) return false
  const ids = getResolvedAdminAlertIds(userId)
  const key = String(alertId)
  if (ids.has(key)) return false
  ids.add(key)
  persistIdSet(RESOLVED_PREFIX, userId, ids)
  // Resolved implies read for badge purposes.
  markAdminAlertRead(userId, alertId)
  return true
}

/**
 * @param {{ priorityAlerts?: Array<{ id: string }>; otherAlerts?: Array<{ id: string }> } | null | undefined} alerts
 * @param {number | string | null | undefined} userId
 */
export function filterActiveAdminAlerts(alerts, userId) {
  const resolved = getResolvedAdminAlertIds(userId)
  const keep = (a) => a?.id && !resolved.has(String(a.id))
  return {
    priorityAlerts: (alerts?.priorityAlerts ?? []).filter(keep),
    otherAlerts: (alerts?.otherAlerts ?? []).filter(keep),
    totalCount: 0,
    generatedAt: alerts?.generatedAt ?? new Date().toISOString(),
  }
}

/**
 * @param {{ priorityAlerts?: Array<{ id: string }>; otherAlerts?: Array<{ id: string }> } | null | undefined} alerts
 * @param {number | string | null | undefined} userId
 */
export function countUnreadAdminAlerts(alerts, userId) {
  const active = filterActiveAdminAlerts(alerts, userId)
  const read = getReadAdminAlertIds(userId)
  const all = [...active.priorityAlerts, ...active.otherAlerts]
  return all.filter((a) => !read.has(String(a.id))).length
}

/**
 * Drop stored ids that are no longer in the live alert feed.
 * @param {number | string | null | undefined} userId
 * @param {{ priorityAlerts?: Array<{ id: string }>; otherAlerts?: Array<{ id: string }> } | null | undefined} alerts
 */
export function pruneAdminAlertLocalState(userId, alerts) {
  const live = new Set(
    [...(alerts?.priorityAlerts ?? []), ...(alerts?.otherAlerts ?? [])].map((a) =>
      String(a.id),
    ),
  )

  for (const prefix of [READ_PREFIX, RESOLVED_PREFIX]) {
    const current = loadIdSet(prefix, userId)
    let changed = false
    for (const id of current) {
      if (!live.has(id)) {
        current.delete(id)
        changed = true
      }
    }
    if (changed) persistIdSet(prefix, userId, current)
  }
}

/** @deprecated use pruneAdminAlertLocalState */
export function pruneReadAdminAlertIds(userId, alerts) {
  pruneAdminAlertLocalState(userId, alerts)
}
