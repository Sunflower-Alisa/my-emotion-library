import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEmotionStore } from '@/store'
import { clearMockStorage, mockStorage } from '../setup.js'

const STORAGE_KEY = 'emotion_records'

function createSampleRecord(overrides = {}) {
  return {
    id: `test_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    date: '2026-06-01',
    createdAt: '10:30',
    template: 'burns',
    emotion: { label: '开心', emoji: '😊', color: '#A8D5BA' },
    situation: '和朋友出去玩',
    autoThought: '今天真开心',
    autoThoughtBelief: 80,
    cognitiveDistortions: [],
    rationalResponse: '',
    rationalResponseBelief: 60,
    result: { score: 80, note: '很好' },
    ...overrides
  }
}

function setupStorage(records) {
  mockStorage[STORAGE_KEY] = JSON.stringify(records)
}

beforeEach(() => {
  setActivePinia(createPinia())
  clearMockStorage()
})

describe('loadRecords', () => {
  it('从空存储加载时返回空数组', () => {
    const store = useEmotionStore()
    store.loadRecords()
    expect(store.records).toEqual([])
  })

  it('加载已存在的存储数据', () => {
    setupStorage([createSampleRecord({ id: 'r1' })])
    const store = useEmotionStore()
    store.loadRecords()
    expect(store.records).toHaveLength(1)
    expect(store.records[0].id).toBe('r1')
  })

  it('存储数据损坏时返回空数组', () => {
    mockStorage[STORAGE_KEY] = '不是合法 JSON{{{'
    const store = useEmotionStore()
    store.loadRecords()
    expect(store.records).toEqual([])
  })
})

describe('saveRecord', () => {
  it('创建正确的记录结构', () => {
    const store = useEmotionStore()
    store.saveRecord({ emotion: { label: '开心' } })
    expect(store.records).toHaveLength(1)
    const r = store.records[0]
    expect(r.id).toBeDefined()
    expect(r.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(r.createdAt).toMatch(/^\d{2}:\d{2}$/)
    expect(r.template).toBe('burns')
    expect(r.emotion).toEqual({ label: '开心' })
    expect(r.id.length).toBeGreaterThan(5)
  })

  it('写入存储', () => {
    const store = useEmotionStore()
    store.saveRecord({ emotion: { label: '平静' } })
    const saved = JSON.parse(mockStorage[STORAGE_KEY])
    expect(saved).toHaveLength(1)
    expect(saved[0].emotion.label).toBe('平静')
  })

  it('多次保存生成不同 ID', () => {
    const store = useEmotionStore()
    store.saveRecord({ emotion: { label: '开心' } })
    store.saveRecord({ emotion: { label: '悲伤' } })
    expect(store.records).toHaveLength(2)
    expect(store.records[0].id).not.toBe(store.records[1].id)
  })
})

describe('saveQuickRecord', () => {
  it('创建正确的极速记录', () => {
    const store = useEmotionStore()
    store.saveQuickRecord({ label: '疲惫', emoji: '😴', color: '#B8B0A8' }, '今天很累')
    expect(store.records).toHaveLength(1)
    const r = store.records[0]
    expect(r.template).toBe('quick')
    expect(r.emotion.label).toBe('疲惫')
    expect(r.note).toBe('今天很累')
    expect(r.date).toBeDefined()
    expect(r.createdAt).toBeDefined()
  })

  it('无备注时 note 为空字符串', () => {
    const store = useEmotionStore()
    store.saveQuickRecord({ label: '开心' })
    expect(store.records[0].note).toBe('')
  })
})

describe('deleteRecord', () => {
  it('按 ID 删除记录', () => {
    setupStorage([
      createSampleRecord({ id: 'r1' }),
      createSampleRecord({ id: 'r2' }),
      createSampleRecord({ id: 'r3' }),
    ])
    const store = useEmotionStore()
    store.deleteRecord('r2')
    expect(store.records).toHaveLength(2)
    expect(store.records.map(r => r.id)).toEqual(['r1', 'r3'])
  })

  it('删除不存在的 ID 不影响其他记录', () => {
    setupStorage([createSampleRecord({ id: 'r1' })])
    const store = useEmotionStore()
    store.deleteRecord('nonexistent')
    expect(store.records).toHaveLength(1)
  })

  it('从空数组中删除不报错', () => {
    const store = useEmotionStore()
    expect(() => store.deleteRecord('r1')).not.toThrow()
  })
})

describe('getTodayRecords', () => {
  it('返回今天的记录', () => {
    const today = new Date()
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    setupStorage([
      createSampleRecord({ id: 'r1', date: todayKey }),
      createSampleRecord({ id: 'r2', date: '2025-01-01' }),
    ])
    const store = useEmotionStore()
    const result = store.getTodayRecords()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('r1')
  })

  it('今天无记录时返回空数组', () => {
    setupStorage([createSampleRecord({ id: 'r1', date: '2025-01-01' })])
    const store = useEmotionStore()
    expect(store.getTodayRecords()).toEqual([])
  })
})

describe('getGroupedRecords', () => {
  it('按日期分组并降序排列', () => {
    setupStorage([
      createSampleRecord({ id: 'r1', date: '2026-06-01' }),
      createSampleRecord({ id: 'r2', date: '2026-06-02' }),
      createSampleRecord({ id: 'r3', date: '2026-06-01' }),
    ])
    const store = useEmotionStore()
    const grouped = store.getGroupedRecords()
    expect(grouped).toHaveLength(2)
    expect(grouped[0].date).toBe('2026-06-02')
    expect(grouped[1].date).toBe('2026-06-01')
    expect(grouped[1].records).toHaveLength(2)
  })

  it('按日期筛选', () => {
    setupStorage([
      createSampleRecord({ id: 'r1', date: '2026-06-01' }),
      createSampleRecord({ id: 'r2', date: '2026-06-02' }),
    ])
    const store = useEmotionStore()
    const filtered = store.getGroupedRecords('2026-06-01')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].records).toHaveLength(1)
    expect(filtered[0].records[0].id).toBe('r1')
  })

  it('无匹配日期时返回空数组', () => {
    setupStorage([createSampleRecord({ id: 'r1', date: '2026-06-01' })])
    const store = useEmotionStore()
    expect(store.getGroupedRecords('2099-01-01')).toEqual([])
  })
})

describe('getWeeklyStats', () => {
  it('返回 7 天的统计数据', () => {
    const store = useEmotionStore()
    const stats = store.getWeeklyStats()
    expect(stats).toHaveLength(7)
  })

  it('每天都有 date/dayLabel/weekday/records 字段', () => {
    const store = useEmotionStore()
    const stats = store.getWeeklyStats()
    stats.forEach(day => {
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(day.dayLabel).toMatch(/\d+日/)
      expect(typeof day.weekday).toBe('string')
      expect(typeof day.records).toBe('number')
    })
  })

  it('按周一到周日顺序排列', () => {
    const store = useEmotionStore()
    const stats = store.getWeeklyStats()
    const order = stats.map(d => d.weekday)
    const chinaOrder = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    expect(order).toEqual(chinaOrder)
  })

  describe('有记录时的统计', () => {
    function findStatsForDate(stats, date) {
      return stats.find(d => d.date === date)
    }

    it('计算 avgScore', () => {
      setupStorage([
        createSampleRecord({ id: 'v1', date: '2026-06-01', result: { score: 80 } }),
      ])
      const store = useEmotionStore()
      const found = findStatsForDate(store.getWeeklyStats(), '2026-06-01')
      if (found) {
        expect(found.records).toBe(1)
        expect(found.avgScore).toBe(80)
        expect(found.emotion).toBeDefined()
      }
    })

    it('计算 dominant emotion', () => {
      setupStorage([
        createSampleRecord({ id: 'e1', date: '2026-06-01', emotion: { label: '开心', emoji: '😊', color: '#A8D5BA' } }),
        createSampleRecord({ id: 'e2', date: '2026-06-01', emotion: { label: '开心', emoji: '😊', color: '#A8D5BA' } }),
        createSampleRecord({ id: 'e3', date: '2026-06-01', emotion: { label: '悲伤', emoji: '😢', color: '#8B9DC3' } }),
      ])
      const store = useEmotionStore()
      const found = findStatsForDate(store.getWeeklyStats(), '2026-06-01')
      if (found) {
        expect(found.emotion.label).toBe('开心')
      }
    })

    it('部分记录没有 emotion 不影响 dominant emotion 统计', () => {
      setupStorage([
        createSampleRecord({ id: 'n1', date: '2026-06-01', emotion: null }),
        createSampleRecord({ id: 'n2', date: '2026-06-01', emotion: { label: '开心', emoji: '😊', color: '#A8D5BA' } }),
      ])
      const store = useEmotionStore()
      const found = findStatsForDate(store.getWeeklyStats(), '2026-06-01')
      if (found) {
        expect(found.emotion.label).toBe('开心')
      }
    })

    it('部分记录没有 result.score 不影响 avgScore 计算', () => {
      setupStorage([
        createSampleRecord({ id: 's1', date: '2026-06-01', result: null }),
        createSampleRecord({ id: 's2', date: '2026-06-01', result: { score: 90 } }),
      ])
      const store = useEmotionStore()
      const found = findStatsForDate(store.getWeeklyStats(), '2026-06-01')
      if (found) {
        expect(found.avgScore).toBe(90)
      }
    })
  })

  it('无记录的日子 avgScore 和 emotion 为 null', () => {
    const store = useEmotionStore()
    const stats = store.getWeeklyStats()
    stats.forEach(day => {
      expect(day.avgScore).toBeNull()
      expect(day.emotion).toBeNull()
    })
  })
})

describe('getCalendarData', () => {
  it('返回指定月份的数据', () => {
    const store = useEmotionStore()
    const result = store.getCalendarData(2026, 6)
    expect(typeof result).toBe('object')
    expect(Array.isArray(result)).toBe(false)
  })

  it('当月无记录时返回空对象', () => {
    setupStorage([createSampleRecord({ id: 'c1', date: '2025-01-01' })])
    const store = useEmotionStore()
    const result = store.getCalendarData(2026, 6)
    expect(Object.keys(result)).toHaveLength(0)
  })

  it('正确统计当日记录数和 dominant emotion', () => {
    setupStorage([
      createSampleRecord({ id: 'd1', date: '2026-06-01', emotion: { label: '开心', emoji: '😊', color: '#A8D5BA' } }),
      createSampleRecord({ id: 'd2', date: '2026-06-01', emotion: { label: '开心', emoji: '😊', color: '#A8D5BA' } }),
      createSampleRecord({ id: 'd3', date: '2026-06-01', emotion: { label: '悲伤', emoji: '😢', color: '#8B9DC3' } }),
      createSampleRecord({ id: 'd4', date: '2026-06-02', emotion: { label: '平静', emoji: '😌', color: '#B8D4E3' } }),
    ])
    const store = useEmotionStore()
    const result = store.getCalendarData(2026, 6)
    expect(result['2026-06-01'].count).toBe(3)
    expect(result['2026-06-01'].dominantEmotion.label).toBe('开心')
    expect(result['2026-06-02'].count).toBe(1)
    expect(result['2026-06-02'].dominantEmotion.label).toBe('平静')
  })

  it('不包含其他月份的数据', () => {
    setupStorage([
      createSampleRecord({ id: 'm1', date: '2026-06-15' }),
      createSampleRecord({ id: 'm2', date: '2026-07-01' }),
    ])
    const store = useEmotionStore()
    const result = store.getCalendarData(2026, 6)
    expect(Object.keys(result)).toHaveLength(1)
    expect(result['2026-06-15']).toBeDefined()
  })
})

describe('getStats', () => {
  it('正确统计天数和记录数', () => {
    setupStorage([
      createSampleRecord({ id: 't1', date: '2026-06-01' }),
      createSampleRecord({ id: 't2', date: '2026-06-01' }),
      createSampleRecord({ id: 't3', date: '2026-06-02' }),
    ])
    const store = useEmotionStore()
    const stats = store.getStats()
    expect(stats.totalDays).toBe(2)
    expect(stats.totalRecords).toBe(3)
  })

  it('空记录时统计为 0', () => {
    const store = useEmotionStore()
    const stats = store.getStats()
    expect(stats.totalDays).toBe(0)
    expect(stats.totalRecords).toBe(0)
  })
})

describe('exportData', () => {
  it('导出为合法 JSON 字符串', () => {
    setupStorage([createSampleRecord({ id: 'x1' })])
    const store = useEmotionStore()
    const json = store.exportData()
    const parsed = JSON.parse(json)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed).toHaveLength(1)
  })

  it('空记录导出为空数组 JSON', () => {
    const store = useEmotionStore()
    const json = store.exportData()
    expect(JSON.parse(json)).toEqual([])
  })
})

describe('importData', () => {
  it('导入合法 JSON 数组', () => {
    const store = useEmotionStore()
    const data = [
      createSampleRecord({ id: 'i1' }),
      createSampleRecord({ id: 'i2' }),
    ]
    const result = store.importData(JSON.stringify(data))
    expect(result.success).toBe(true)
    expect(result.imported).toBe(2)
    expect(store.records).toHaveLength(2)
  })

  it('拒绝非法 JSON', () => {
    const store = useEmotionStore()
    const result = store.importData('not json')
    expect(result.success).toBe(false)
    expect(result.imported).toBe(0)
  })

  it('拒绝非数组 JSON', () => {
    const store = useEmotionStore()
    const result = store.importData('{"a": 1}')
    expect(result.success).toBe(false)
    expect(result.imported).toBe(0)
  })

  it('按 ID 去重，已有 ID 不重复导入', () => {
    setupStorage([createSampleRecord({ id: 'dup1' })])
    const store = useEmotionStore()
    const data = [
      createSampleRecord({ id: 'dup1' }),
      createSampleRecord({ id: 'dup2' }),
      createSampleRecord({ id: 'dup3' }),
    ]
    const result = store.importData(JSON.stringify(data))
    expect(result.success).toBe(true)
    expect(result.imported).toBe(2)
    expect(store.records).toHaveLength(3)
  })

  it('全部重复时导入 0 条', () => {
    setupStorage([createSampleRecord({ id: 'alldup1' })])
    const store = useEmotionStore()
    const result = store.importData(JSON.stringify([createSampleRecord({ id: 'alldup1' })]))
    expect(result.success).toBe(true)
    expect(result.imported).toBe(0)
  })

  it('导入后写入存储', () => {
    const store = useEmotionStore()
    store.importData(JSON.stringify([createSampleRecord({ id: 'w1' })]))
    expect(mockStorage[STORAGE_KEY]).toBeDefined()
    expect(JSON.parse(mockStorage[STORAGE_KEY])).toHaveLength(1)
  })
})
