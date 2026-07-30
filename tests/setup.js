import { vi } from 'vitest'

export const mockStorage = {}

globalThis.uni = {
  getStorageSync: vi.fn((key) => {
    const val = mockStorage[key]
    return val !== undefined ? val : ''
  }),
  setStorageSync: vi.fn((key, val) => {
    mockStorage[key] = val
  }),
  removeStorageSync: vi.fn((key) => {
    delete mockStorage[key]
  }),
  clearStorageSync: vi.fn(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key])
  }),
}

export function clearMockStorage() {
  Object.keys(mockStorage).forEach(key => delete mockStorage[key])
  vi.clearAllMocks()
}
