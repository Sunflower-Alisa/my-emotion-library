<script setup>
import { ref, computed } from 'vue'
import { useEmotionStore } from '@/store'

const emit = defineEmits(['selectDate'])
const store = useEmotionStore()

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1)

const calendarData = ref({})

function loadData() {
  calendarData.value = store.getCalendarData(currentYear.value, currentMonth.value)
}

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 0).getDate()
})

const firstDayOfWeek = computed(() => {
  return new Date(currentYear.value, currentMonth.value - 1, 1).getDay()
})

const calendarDays = computed(() => {
  const days = []
  const totalDays = daysInMonth.value
  const startDay = firstDayOfWeek.value

  for (let i = 0; i < startDay; i++) {
    days.push({ empty: true })
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateKey = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const data = calendarData.value[dateKey]
    days.push({
      day: d,
      date: dateKey,
      hasRecord: !!data,
      count: data?.count || 0,
      emotion: data?.dominantEmotion || null
    })
  }

  return days
})

function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
  loadData()
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
  loadData()
}

function selectDay(day) {
  if (day.empty || !day.hasRecord) return
  emit('selectDate', day.date)
}

const weekHeaders = ['日', '一', '二', '三', '四', '五', '六']

loadData()
</script>

<template>
  <view class="calendar">
    <view class="calendar-header">
      <text class="month-nav" @tap="prevMonth">‹</text>
      <text class="month-title">{{ currentYear }}年{{ currentMonth }}月</text>
      <text class="month-nav" @tap="nextMonth">›</text>
    </view>

    <view class="weekday-row">
      <text class="weekday" v-for="w in weekHeaders" :key="w">{{ w }}</text>
    </view>

    <view class="days-grid">
      <view
        class="day-cell"
        v-for="(day, idx) in calendarDays"
        :key="idx"
        :class="{ empty: day.empty }"
        @tap="selectDay(day)"
      >
        <view
          v-if="!day.empty"
          class="day-content"
          :style="day.emotion ? { background: day.emotion.color + '30' } : {}"
        >
          <text class="day-num">{{ day.day }}</text>
          <text v-if="day.emotion" class="day-emoji">{{ day.emotion.emoji }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.calendar {
  background: $card-bg;
  border-radius: $radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
  margin-bottom: $spacing-md;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
}

.month-nav {
  font-size: 48rpx;
  color: $primary-color;
  padding: $spacing-xs $spacing-sm;
  font-weight: 600;
}

.month-title {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
}

.weekday-row {
  display: flex;
  margin-bottom: $spacing-sm;
}

.weekday {
  width: 14.285%;
  text-align: center;
  font-size: $font-sm;
  color: $text-light;
  padding: $spacing-xs 0;
  flex-shrink: 0;
}

.days-grid {
  display: flex;
  flex-wrap: wrap;
}

.day-cell {
  width: 14.285%;
  padding: 6rpx;
  box-sizing: border-box;
}

.day-cell.empty {
  visibility: hidden;
}

.day-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  padding: 8rpx 0;
  min-height: 80rpx;
}

.day-num {
  font-size: $font-sm;
  color: $text-primary;
}

.day-emoji {
  font-size: 24rpx;
  margin-top: 2rpx;
}
</style>
