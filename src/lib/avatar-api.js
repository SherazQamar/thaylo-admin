import { api } from './api'

/**
 * @returns {Promise<Array<{ key: string; imageUrl: string }>>}
 */
export async function fetchAdminAvatarPresets() {
  const { data } = await api.get('/avatars/presets')
  return data.data.presets
}

/**
 * @param {string} avatarKey
 */
export async function setAdminAvatar(avatarKey) {
  const { data } = await api.put('/avatars/me', { avatarKey })
  return data.data
}
