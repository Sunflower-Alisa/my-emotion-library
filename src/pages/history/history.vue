<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useEmotionStore } from '@/store'

const store = useEmotionStore()
const records = ref([])
const selectedRecord = ref(null)
const showDetail = ref(false)

const viewMode = ref('list')
const filterDate = ref('')
const filterLabel = ref('全部')

// 日历状态
const now = new Date()
const calYear = ref(now.getFullYear())
const calMonth = ref(now.getMonth() + 1)
const calendarData = ref({})

const weekHeaders = ['日', '一', '二', '三', '四', '五', '六']

const daysInMonth = computed(() => {
  return new Date(calYear.value, calMonth.value, 0).getDate()
})

const firstDayOfWeek = computed(() => {
  return new Date(calYear.value, calMonth.value - 1, 1).getDay()
})

const calendarDays = computed(() => {
  const days = []
  for (let i = 0; i < firstDayOfWeek.value; i++) {
    days.push({ empty: true })
  }
  for (let d = 1; d <= daysInMonth.value; d++) {
    const dateKey = `${calYear.value}-${String(calMonth.value).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const data = calendarData.value[dateKey]
    days.push({
      day: d, date: dateKey,
      hasRecord: !!data,
      emotion: data?.dominantEmotion || null
    })
  }
  return days
})

function loadCalendar() {
  calendarData.value = store.getCalendarData(calYear.value, calMonth.value)
}

function prevMonth() {
  if (calMonth.value === 1) { calMonth.value = 12; calYear.value-- }
  else { calMonth.value-- }
  loadCalendar()
}

function nextMonth() {
  if (calMonth.value === 12) { calMonth.value = 1; calYear.value++ }
  else { calMonth.value++ }
  loadCalendar()
}

function selectDay(day) {
  if (day.empty || !day.hasRecord) return
  viewMode.value = 'list'
  filterDate.value = day.date
  refreshList()
}

function switchMode(mode) {
  viewMode.value = mode
  if (mode === 'calendar') loadCalendar()
}

onShow(() => {
  refreshList()
})

function refreshList() {
  records.value = store.getGroupedRecords(filterDate.value || null)
  if (filterDate.value) {
    filterLabel.value = formatDate(filterDate.value)
  } else {
    filterLabel.value = '全部'
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}年${m}月${day}日`
}

function viewDetail(record) {
  selectedRecord.value = record
  showDetail.value = true
}

function closeDetail() {
  showDetail.value = false
  selectedRecord.value = null
}

function deleteRecord(recordId) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条记录吗？',
    success: (res) => {
      if (res.confirm) {
        store.deleteRecord(recordId)
        refreshList()
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

function clearFilter() {
  filterDate.value = ''
  refreshList()
}
</script>

<template>
  <view class="container">
    <text class="page-title">情绪旅程</text>

    <!-- 视图切换 -->
    <view class="view-tabs">
      <text
        class="view-tab"
        :class="{ active: viewMode === 'list' }"
        @tap="switchMode('list')"
      >📋 列表</text>
      <text
        class="view-tab"
        :class="{ active: viewMode === 'calendar' }"
        @tap="switchMode('calendar')"
      >📅 日历</text>
    </view>

    <!-- 日历视图 -->
    <view v-if="viewMode === 'calendar'" class="calendar-section">
      <view class="calendar">
        <view class="calendar-header">
          <text class="month-nav" @tap="prevMonth">‹</text>
          <text class="month-title">{{ calYear }}年{{ calMonth }}月</text>
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
      <text class="calendar-tip">点击日历上有记录的日期，可筛选查看该日的日志</text>
    </view>

    <!-- 列表视图 -->
    <view v-else class="list-section">
      <!-- 日期筛选 -->
      <view class="filter-bar">
        <picker
          mode="date"
          :value="filterDate"
          @change="(e) => { filterDate = e.detail.value; refreshList() }"
        >
          <view class="filter-btn">
            <text>📅 {{ filterLabel }}</text>
            <text class="filter-arrow">▼</text>
          </view>
        </picker>
        <text v-if="filterDate" class="filter-clear" @tap="clearFilter">✕ 清除</text>
      </view>

      <!-- 空状态 -->
      <view v-if="records.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">还没有任何记录</text>
        <text class="empty-desc">去首页开始你的第一次情绪记录吧</text>
      </view>

      <!-- 记录列表 -->
      <view v-else class="record-list">
        <view
          class="record-group"
          v-for="(group, gIdx) in records"
          :key="gIdx"
        >
          <text class="group-date">{{ formatDate(group.date) }}</text>
          <view
            class="record-card"
            v-for="(record, rIdx) in group.records"
            :key="rIdx"
            @tap="viewDetail(record)"
          >
            <view class="card-header">
              <view class="card-header-left">
                <text v-if="record.emotion" class="card-emotion">{{ record.emotion.emoji }}</text>
                <text class="card-time">{{ record.createdAt }}</text>
              </view>
              <text
                class="card-mood"
                :style="{ color: record.result?.score >= 50 ? '#A8D5BA' : '#F0C8C8' }"
                v-if="record.result?.score != null"
              >
                {{ record.result.score }}%
              </text>
            </view>
            <text class="card-preview">
              {{ record.situation?.slice(0, 50) || record.note?.slice(0, 50) || '情绪记录' }}
            </text>
            <view class="card-footer">
              <text class="card-template">{{ record.template === 'burns' ? '伯恩斯5栏' : '极速记录' }}</text>
              <text
                v-if="record.emotion"
                class="card-emotion-tag"
                :style="{ background: record.emotion.color + '20', color: record.emotion.color }"
              >
                {{ record.emotion.label }}
              </text>
              <text class="card-delete" @tap.stop="deleteRecord(record.id)">删除</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <view v-if="showDetail && selectedRecord" class="detail-overlay" @tap="closeDetail">
      <view class="detail-modal" @tap.stop>
        <view class="detail-header">
          <text class="detail-title">记录详情</text>
          <text class="detail-close" @tap="closeDetail">✕</text>
        </view>

        <scroll-view scroll-y class="detail-content">
          <view v-if="selectedRecord.emotion" class="detail-field">
            <text class="field-label">😊 情绪标签</text>
            <text class="field-value" style="font-size: 48rpx">
              {{ selectedRecord.emotion.emoji }} {{ selectedRecord.emotion.label }}
            </text>
          </view>

          <template v-if="selectedRecord.template === 'burns'">
            <view class="detail-field">
              <text class="field-label">📋 情境</text>
              <text class="field-value">{{ selectedRecord.situation }}</text>
            </view>

            <view class="detail-field">
              <text class="field-label">💭 自动思维</text>
              <text class="field-value">{{ selectedRecord.autoThought }}</text>
              <text class="field-score" v-if="selectedRecord.autoThoughtBelief">
                相信度：{{ selectedRecord.autoThoughtBelief }}%
              </text>
            </view>

            <view class="detail-field">
              <text class="field-label">🔍 认知扭曲</text>
              <view class="tag-list">
                <text class="tag" v-for="(item, i) in selectedRecord.cognitiveDistortions" :key="i">
                  {{ item }}
                </text>
              </view>
            </view>

            <view class="detail-field">
              <text class="field-label">💡 理性回应</text>
              <text class="field-value">{{ selectedRecord.rationalResponse }}</text>
              <text class="field-score" v-if="selectedRecord.rationalResponseBelief">
                相信度：{{ selectedRecord.rationalResponseBelief }}%
              </text>
            </view>

            <view class="detail-field">
              <text class="field-label">📊 结果</text>
              <text class="field-value">{{ selectedRecord.result?.note || '无备注' }}</text>
              <text class="field-score">情绪评分：{{ selectedRecord.result?.score }}%</text>
            </view>
          </template>

          <template v-else>
            <view class="detail-field">
              <text class="field-label">📝 备注</text>
              <text class="field-value">{{ selectedRecord.note || '无备注' }}</text>
            </view>
          </template>

          <view class="detail-field">
            <text class="field-label">🕐 记录时间</text>
            <text class="field-value">{{ selectedRecord.date }} {{ selectedRecord.createdAt }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: $spacing-lg $spacing-md;
}

.page-title {
  font-size: $font-xl;
  font-weight: 600;
  color: $text-primary;
  display: block;
  text-align: center;
  margin-bottom: $spacing-lg;
}

.view-tabs {
  display: flex;
  gap: $spacing-md;
  justify-content: center;
  margin-bottom: $spacing-lg;
}

.view-tab {
  padding: $spacing-sm $spacing-lg;
  border-radius: $radius-xl;
  background: $card-bg;
  border: 1rpx solid $border-color;
  font-size: $font-md;
  color: $text-secondary;
}

.view-tab.active {
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  color: #fff;
  border-color: transparent;
}

.calendar-section {
  padding: 0 $spacing-sm;
}

.calendar-tip {
  font-size: $font-sm;
  color: $text-light;
  display: block;
  text-align: center;
  margin-top: $spacing-sm;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
  padding: 0 $spacing-sm;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  background: $card-bg;
  border: 1rpx solid $border-color;
  border-radius: $radius-xl;
  padding: $spacing-sm $spacing-md;
  font-size: $font-md;
  color: $text-primary;
}

.filter-arrow {
  font-size: $font-sm;
  color: $text-light;
}

.filter-clear {
  font-size: $font-sm;
  color: $accent-pink;
  padding: $spacing-xs;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
}

.empty-icon {
  font-size: 96rpx;
  margin-bottom: $spacing-md;
}

.empty-text {
  font-size: $font-lg;
  color: $text-secondary;
}

.empty-desc {
  font-size: $font-sm;
  color: $text-light;
  margin-top: $spacing-xs;
}

.record-group {
  margin-bottom: $spacing-lg;
}

.group-date {
  font-size: $font-md;
  font-weight: 600;
  color: $text-primary;
  padding: 0 $spacing-md $spacing-sm;
  display: block;
}

.record-card {
  background: $card-bg;
  border-radius: $radius-lg;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;
  box-shadow: $shadow-sm;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-xs;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.card-emotion {
  font-size: 32rpx;
}

.card-time {
  font-size: $font-sm;
  color: $text-light;
}

.card-mood {
  font-size: $font-lg;
  font-weight: 600;
}

.card-preview {
  font-size: $font-md;
  color: $text-primary;
  display: block;
  margin-bottom: $spacing-sm;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $spacing-xs;
}

.card-template {
  font-size: $font-sm;
  color: $primary-color;
  background: $primary-light;
  padding: 4rpx 16rpx;
  border-radius: $radius-sm;
}

.card-emotion-tag {
  font-size: $font-sm;
  padding: 4rpx 16rpx;
  border-radius: $radius-sm;
}

.card-delete {
  font-size: $font-sm;
  color: $accent-pink;
  padding: 4rpx 12rpx;
}

/* 详情弹窗 */
.detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.detail-modal {
  background: $card-bg;
  border-radius: $radius-xl $radius-xl 0 0;
  width: 100%;
  max-height: 80vh;
  padding: $spacing-lg;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
}

.detail-title {
  font-size: $font-xl;
  font-weight: 600;
}

.detail-close {
  font-size: 40rpx;
  color: $text-light;
  padding: $spacing-xs;
}

.detail-content {
  max-height: 60vh;
}

.detail-field {
  margin-bottom: $spacing-lg;
  padding-bottom: $spacing-lg;
  border-bottom: 1rpx solid $border-color;
}

.detail-field:last-child {
  border-bottom: none;
}

.field-label {
  font-size: $font-md;
  font-weight: 600;
  color: $primary-dark;
  display: block;
  margin-bottom: $spacing-sm;
}

.field-value {
  font-size: $font-md;
  color: $text-primary;
  display: block;
  line-height: 1.6;
}

.field-score {
  font-size: $font-sm;
  color: $text-secondary;
  margin-top: $spacing-xs;
  display: block;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
}

.tag {
  background: $primary-light;
  color: $primary-dark;
  font-size: $font-sm;
  padding: 6rpx 16rpx;
  border-radius: $radius-sm;
}

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
