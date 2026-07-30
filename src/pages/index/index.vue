<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useEmotionStore } from '@/store'

const store = useEmotionStore()

const todayRecords = ref([])
const weeklyStats = ref([])

onShow(() => {
  todayRecords.value = store.getTodayRecords()
  weeklyStats.value = store.getWeeklyStats()
})

const todayDate = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${y}年${m}月${d}日 星期${weekdays[now.getDay()]}`
})

const todayMoodText = computed(() => {
  if (todayRecords.value.length === 0) return '暂无记录'
  const latest = todayRecords.value[todayRecords.value.length - 1]
  if (latest.emotion) return latest.emotion.emoji + ' ' + latest.emotion.label
  if (latest.result?.score != null) return getMoodText(latest.result.score)
  return '已记录'
})

const todayMoodEmoji = computed(() => {
  if (todayRecords.value.length === 0) return '😶'
  const latest = todayRecords.value[todayRecords.value.length - 1]
  if (latest.emotion) return latest.emotion.emoji
  return '📝'
})

function getMoodText(score) {
  if (!score && score !== 0) return '暂无记录'
  const s = Number(score)
  if (s >= 80) return '感觉很好 ☀️'
  if (s >= 60) return '还不错 🌤'
  if (s >= 40) return '一般般 ⛅'
  if (s >= 20) return '不太好 🌧'
  return '很糟糕 ⛈'
}

const maxScore = computed(() => {
  const scores = weeklyStats.value.map(d => d.avgScore || 0)
  return Math.max(...scores, 1)
})

function goToQuickRecord() {
  uni.navigateTo({ url: '/pages/quick-record/quick-record' })
}

function goToRecord() {
  uni.navigateTo({ url: '/pages/record/record' })
}

function goToHistory() {
  uni.navigateTo({ url: '/pages/history/history' })
}

function goToIntro() {
  uni.navigateTo({ url: '/pages/intro/intro' })
}
</script>

<template>
  <view class="container">
    <view class="header-section">
      <view class="header-top">
        <text class="date-text">{{ todayDate }}</text>
        <text class="intro-link" @tap="goToIntro">📚 功能介绍</text>
      </view>
      <text class="greeting">今天的心情</text>
      <view class="mood-card">
        <text class="mood-emoji">{{ todayMoodEmoji }}</text>
        <text class="mood-text">{{ todayMoodText }}</text>
        <text class="record-count" v-if="todayRecords.length > 0">
          今日已记录 {{ todayRecords.length }} 条
        </text>
        <text class="record-count" v-else>
          今天还没有记录，开始记录你的情绪吧
        </text>
      </view>
    </view>

    <view class="action-section">
      <view class="action-card" @tap="goToQuickRecord">
        <view class="action-icon">⚡</view>
        <text class="action-title">极速记录</text>
        <text class="action-desc">10秒快速记录当下情绪</text>
      </view>

      <view class="action-card" @tap="goToRecord">
        <view class="action-icon">✏️</view>
        <text class="action-title">详细记录</text>
        <text class="action-desc">伯恩斯5栏梳理感受</text>
      </view>

      <view class="action-card" @tap="goToHistory">
        <view class="action-icon">📖</view>
        <text class="action-title">历史记录</text>
        <text class="action-desc">回顾过往的情绪旅程</text>
      </view>
    </view>

    <!-- 周情绪趋势 -->
    <view class="weekly-section" v-if="weeklyStats.some(d => d.records > 0)">
      <text class="section-title">📈 本周情绪趋势</text>
      <view class="weekly-chart">
        <view class="weekly-bar-group" v-for="(day, idx) in weeklyStats" :key="idx">
          <view class="weekly-bar-wrapper">
            <view
              class="weekly-bar"
              :style="{
                height: (day.avgScore != null ? (day.avgScore / 100) * 200 : 4) + 'rpx',
                background: day.emotion?.color || 'linear-gradient(180deg, #E8A87C, #D4896B)'
              }"
            >
            </view>
          </view>
          <view class="weekly-bar-info">
            <text v-if="day.emotion" class="weekly-emoji">{{ day.emotion.emoji }}</text>
            <text v-else-if="day.records > 0" class="weekly-emoji">📝</text>
          </view>
          <text class="weekly-label">{{ day.weekday }}</text>
        </view>
      </view>
    </view>

    <view class="recent-section" v-if="todayRecords.length > 0">
      <text class="section-title">今日记录</text>
      <view
        class="record-item"
        v-for="(record, index) in todayRecords"
        :key="index"
        @tap="goToHistory"
      >
        <text v-if="record.emotion" class="record-emotion">{{ record.emotion.emoji }}</text>
        <text class="record-time">{{ record.createdAt }}</text>
        <text class="record-preview">{{ record.situation?.slice(0, 30) || record.note?.slice(0, 30) || '情绪记录' }}</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: $spacing-lg $spacing-md;
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl 0 $spacing-lg;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 $spacing-md;
  margin-bottom: $spacing-md;
}

.date-text {
  font-size: $font-sm;
  color: $text-secondary;
}

.intro-link {
  font-size: $font-sm;
  color: $primary-color;
  padding: $spacing-xs $spacing-sm;
}

.greeting {
  font-size: $font-xl;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.mood-card {
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  border-radius: $radius-xl;
  padding: $spacing-lg $spacing-xl;
  width: 80%;
  text-align: center;
  box-shadow: $shadow-lg;
}

.mood-emoji {
  font-size: 64rpx;
  display: block;
  margin-bottom: $spacing-xs;
}

.mood-text {
  font-size: $font-xxl;
  color: #fff;
  font-weight: 600;
  display: block;
}

.record-count {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.85);
  margin-top: $spacing-sm;
  display: block;
}

.action-section {
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-md 0;
}

.action-card {
  flex: 1;
  background: $card-bg;
  border-radius: $radius-lg;
  padding: $spacing-md $spacing-sm;
  text-align: center;
  box-shadow: $shadow-sm;
}

.action-icon {
  font-size: 56rpx;
  margin-bottom: $spacing-sm;
}

.action-title {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  display: block;
}

.action-desc {
  font-size: $font-sm;
  color: $text-secondary;
  margin-top: $spacing-xs;
  display: block;
}

.weekly-section {
  margin-top: $spacing-md;
  background: $card-bg;
  border-radius: $radius-lg;
  padding: $spacing-lg $spacing-md;
  box-shadow: $shadow-sm;
}

.section-title {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: $spacing-lg;
}

.weekly-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: $spacing-xs;
  padding: 0 $spacing-sm;
}

.weekly-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  flex: 1;
}

.weekly-bar-wrapper {
  height: 220rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
}

.weekly-bar {
  width: 40rpx;
  border-radius: 20rpx 20rpx 8rpx 8rpx;
  min-height: 4rpx;
  transition: height 0.3s;
}

.weekly-bar-info {
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.weekly-emoji {
  font-size: 28rpx;
}

.weekly-label {
  font-size: 20rpx;
  color: $text-secondary;
}

.recent-section {
  margin-top: $spacing-md;
}

.record-item {
  background: $card-bg;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin: 0 $spacing-md $spacing-sm;
  box-shadow: $shadow-sm;
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.record-emotion {
  font-size: 32rpx;
  flex-shrink: 0;
}

.record-time {
  font-size: $font-sm;
  color: $text-light;
  flex-shrink: 0;
}

.record-preview {
  font-size: $font-md;
  color: $text-primary;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
