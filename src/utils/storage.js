/**
 * 本地存储工具
 * 对 uni.getStorage / uni.setStorage 的简单封装
 * 后续迁移到云端时，只需替换此文件中的实现
 */

const PREFIX = 'emotion_lib_'

export const storage = {
  get(key) {
    try {
      return uni.getStorageSync(PREFIX + key)
    } catch {
      return null
    }
  },

  set(key, value) {
    try {
      uni.setStorageSync(PREFIX + key, value)
      return true
    } catch {
      return false
    }
  },

  remove(key) {
    try {
      uni.removeStorageSync(PREFIX + key)
      return true
    } catch {
      return false
    }
  },

  clear() {
    try {
      uni.clearStorageSync()
      return true
    } catch {
      return false
    }
  }
}
