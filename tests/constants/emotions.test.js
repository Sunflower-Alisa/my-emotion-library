import { describe, it, expect } from 'vitest'
import { EMOTIONS } from '@/constants/emotions'

describe('EMOTIONS', () => {
  it('有 10 种情绪', () => {
    expect(EMOTIONS).toHaveLength(10)
  })

  it('每种情绪都有 label/emoji/color', () => {
    EMOTIONS.forEach(e => {
      expect(e).toHaveProperty('label')
      expect(e).toHaveProperty('emoji')
      expect(e).toHaveProperty('color')
      expect(typeof e.label).toBe('string')
      expect(typeof e.emoji).toBe('string')
      expect(typeof e.color).toBe('string')
    })
  })

  it('所有 label 唯一', () => {
    const labels = EMOTIONS.map(e => e.label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('所有 emoji 唯一', () => {
    const emojis = EMOTIONS.map(e => e.emoji)
    expect(new Set(emojis).size).toBe(emojis.length)
  })

  it('所有 color 是合法的十六进制颜色', () => {
    EMOTIONS.forEach(e => {
      expect(e.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })

  it('包含关键情绪标签', () => {
    const labels = EMOTIONS.map(e => e.label)
    expect(labels).toContain('开心')
    expect(labels).toContain('悲伤')
    expect(labels).toContain('愤怒')
    expect(labels).toContain('焦虑')
  })
})
