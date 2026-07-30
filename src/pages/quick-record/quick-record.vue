<script setup>
import { ref } from 'vue'
import { useEmotionStore } from '@/store'
import { EMOTIONS } from '@/constants/emotions'

const store = useEmotionStore()
const selectedEmotion = ref(null)
const note = ref('')

function selectEmotion(em) {
  selectedEmotion.value = em
}

function save() {
  if (!selectedEmotion.value) {
    uni.showToast({ title: '请选择一个情绪', icon: 'none' })
    return
  }
  store.saveQuickRecord(selectedEmotion.value, note.value)
  uni.showToast({ title: '已记录', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 1500)
}

function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <view class="container">
    <view class="header-section">
      <text class="page-title">极速记录</text>
      <text class="page-desc">此刻你的心情如何？选择一个情绪标签快速记录</text>
    </view>

    <view class="emotion-grid">
      <view
        class="emotion-item"
        v-for="em in EMOTIONS"
        :key="em.label"
        :class="{ selected: selectedEmotion?.label === em.label }"
        :style="selectedEmotion?.label === em.label ? { borderColor: em.color, background: em.color + '20' } : {}"
        @tap="selectEmotion(em)"
      >
        <text class="emotion-emoji">{{ em.emoji }}</text>
        <text class="emotion-label">{{ em.label }}</text>
      </view>
    </view>

    <view class="note-section" v-if="selectedEmotion">
      <text class="section-label">备注（可选）</text>
      <textarea
        v-model="note"
        class="input-textarea"
        placeholder="简单记录一下发生了什么…"
        maxlength="500"
      />
      <text class="char-count">{{ note.length }}/500</text>
    </view>

    <view class="bottom-actions">
      <button class="btn-secondary" @tap="goBack">取消</button>
      <button
        class="btn-primary"
        :class="{ disabled: !selectedEmotion }"
        :disabled="!selectedEmotion"
        @tap="save"
      >
        💾 保存记录
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: $spacing-lg $spacing-md;
  padding-bottom: 160rpx;
}

.header-section {
  text-align: center;
  padding: $spacing-lg 0;
}

.page-title {
  font-size: $font-xl;
  font-weight: 600;
  color: $text-primary;
  display: block;
}

.page-desc {
  font-size: $font-md;
  color: $text-secondary;
  display: block;
  margin-top: $spacing-sm;
}

.emotion-grid {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
  justify-content: center;
  padding: $spacing-md 0;
}

.emotion-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-md;
  background: $card-bg;
  border: 2rpx solid $border-color;
  border-radius: $radius-lg;
  width: 120rpx;
  transition: all 0.2s;
}

.emotion-item.selected {
  transform: scale(1.08);
}

.emotion-emoji {
  font-size: 56rpx;
}

.emotion-label {
  font-size: $font-sm;
  color: $text-primary;
}

.note-section {
  margin-top: $spacing-lg;
  padding: 0 $spacing-sm;
}

.section-label {
  font-size: $font-md;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: $spacing-sm;
}

.input-textarea {
  width: 100%;
  min-height: 160rpx;
  background: #FDF8F5;
  border: 1rpx solid $border-color;
  border-radius: $radius-md;
  padding: $spacing-md;
  font-size: $font-md;
  color: $text-primary;
  box-sizing: border-box;
  line-height: 1.6;
}

.char-count {
  font-size: $font-sm;
  color: $text-light;
  display: block;
  text-align: right;
  margin-top: $spacing-xs;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-color;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.btn-secondary {
  flex: 1;
  background: $card-bg;
  border: 1rpx solid $border-color;
  border-radius: $radius-xl;
  padding: 20rpx;
  font-size: $font-lg;
  color: $text-primary;
  text-align: center;
}

.btn-primary {
  flex: 2;
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  color: #fff;
  border-radius: $radius-xl;
  padding: 20rpx;
  font-size: $font-lg;
  text-align: center;
  border: none;
}

.btn-primary.disabled {
  opacity: 0.5;
}
</style>
