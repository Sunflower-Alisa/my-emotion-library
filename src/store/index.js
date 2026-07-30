import { defineStore } from 'pinia'

const STORAGE_KEY = 'emotion_records'

export const useEmotionStore = defineStore('emotion', {
  state: () => ({
    records: []
  }),

  actions: {
    loadRecords() {
      try {
        const data = uni.getStorageSync(STORAGE_KEY)
        this.records = data ? JSON.parse(data) : []
      } catch {
        this.records = []
      }
    },

    saveRecord(record) {
      this.loadRecords()
      const now = new Date()
      const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      const newRecord = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        date: dateKey,
        createdAt: timeStr,
        template: 'burns',
        emotion: null,
        ...record
      }

      this.records.push(newRecord)
      uni.setStorageSync(STORAGE_KEY, JSON.stringify(this.records))
    },

    saveQuickRecord(emotion, note) {
      this.loadRecords()
      const now = new Date()
      const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      const newRecord = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        date: dateKey,
        createdAt: timeStr,
        template: 'quick',
        emotion,
        note: note || ''
      }

      this.records.push(newRecord)
      uni.setStorageSync(STORAGE_KEY, JSON.stringify(this.records))
    },

    deleteRecord(recordId) {
      this.loadRecords()
      this.records = this.records.filter(r => r.id !== recordId)
      uni.setStorageSync(STORAGE_KEY, JSON.stringify(this.records))
    },

    getTodayRecords() {
      this.loadRecords()
      const now = new Date()
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      return this.records.filter(r => r.date === today)
    },

    getGroupedRecords(filterDate) {
      this.loadRecords()
      let filtered = this.records
      if (filterDate) {
        filtered = filtered.filter(r => r.date === filterDate)
      }
      const map = {}
      for (const r of filtered) {
        if (!map[r.date]) {
          map[r.date] = { date: r.date, records: [] }
        }
        map[r.date].records.push(r)
      }
      return Object.values(map).sort((a, b) => b.date.localeCompare(a.date))
    },

    getAllRecords() {
      return this.getGroupedRecords()
    },

    getWeeklyStats() {
      this.loadRecords()
      const stats = []
      const now = new Date()
      const dayOfWeek = now.getDay()
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const monday = new Date(now)
      monday.setDate(now.getDate() + diffToMonday)
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        const dayRecords = this.records.filter(r => r.date === dateKey)
        const weekdays = ['日', '一', '二', '三', '四', '五', '六']

        let avgScore = null
        let emotion = null
        if (dayRecords.length > 0) {
          const scores = dayRecords.filter(r => r.result?.score != null).map(r => r.result.score)
          if (scores.length > 0) {
            avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          }
          const emotionCounts = {}
          dayRecords.forEach(r => {
            if (r.emotion) {
              const key = r.emotion.label
              if (!emotionCounts[key]) emotionCounts[key] = { count: 0, emotion: r.emotion }
              emotionCounts[key].count++
            }
          })
          const sorted = Object.values(emotionCounts).sort((a, b) => b.count - a.count)
          if (sorted.length > 0) emotion = sorted[0].emotion
        }

        stats.push({
          date: dateKey,
          dayLabel: `${d.getDate()}日`,
          weekday: `周${weekdays[d.getDay()]}`,
          records: dayRecords.length,
          avgScore,
          emotion
        })
      }
      return stats
    },

    getCalendarData(year, month) {
      this.loadRecords()
      const prefix = `${year}-${String(month).padStart(2, '0')}`
      const monthRecords = this.records.filter(r => r.date.startsWith(prefix))

      const dayMap = {}
      monthRecords.forEach(r => {
        if (!dayMap[r.date]) {
          dayMap[r.date] = { records: [], emotions: [] }
        }
        dayMap[r.date].records.push(r)
        if (r.emotion) dayMap[r.date].emotions.push(r.emotion)
      })

      const result = {}
      for (const [date, data] of Object.entries(dayMap)) {
        const emotionCounts = {}
        data.emotions.forEach(e => {
          const key = e.label
          if (!emotionCounts[key]) emotionCounts[key] = { count: 0, emotion: e }
          emotionCounts[key].count++
        })
        const sorted = Object.values(emotionCounts).sort((a, b) => b.count - a.count)
        result[date] = {
          count: data.records.length,
          dominantEmotion: sorted.length > 0 ? sorted[0].emotion : null
        }
      }

      return result
    },

    getStats() {
      this.loadRecords()
      const dateSet = new Set(this.records.map(r => r.date))
      return {
        totalDays: dateSet.size,
        totalRecords: this.records.length
      }
    },

    exportData() {
      this.loadRecords()
      return JSON.stringify(this.records, null, 2)
    },

    importData(jsonStr) {
      try {
        const data = JSON.parse(jsonStr)
        if (!Array.isArray(data)) throw new Error('无效的数据格式')
        this.loadRecords()
        const existingIds = new Set(this.records.map(r => r.id))
        let imported = 0
        for (const item of data) {
          if (item.id && !existingIds.has(item.id)) {
            this.records.push(item)
            existingIds.add(item.id)
            imported++
          }
        }
        uni.setStorageSync(STORAGE_KEY, JSON.stringify(this.records))
        return { success: true, imported }
      } catch {
        return { success: false, imported: 0 }
      }
    }
  }
})
