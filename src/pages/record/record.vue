<script setup>
import { ref } from 'vue'
import BurnsFiveColumn from '@/components/templates/BurnsFiveColumn.vue'

const currentTemplate = ref('')
const showTemplateSelector = ref(true)

const templates = [
  {
    id: 'burns',
    name: '伯恩斯5栏情绪日志',
    desc: '基于CBT认知行为疗法，帮你梳理负面情绪背后的思维模式',
    icon: '📝'
  }
]

function selectTemplate(id) {
  currentTemplate.value = id
  showTemplateSelector.value = false
}

function goBack() {
  showTemplateSelector.value = true
  currentTemplate.value = ''
}

function onSaved() {
  uni.showToast({ title: '记录已保存', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}
</script>

<template>
  <view class="container">
    <!-- 模板选择页 -->
    <view v-if="showTemplateSelector" class="template-selector">
      <text class="page-title">选择记录方式</text>
      <text class="page-desc">快速记录或深入梳理，随心选择</text>

      <view
        class="template-card"
        v-for="tpl in templates"
        :key="tpl.id"
        @tap="selectTemplate(tpl.id)"
      >
        <text class="template-icon">{{ tpl.icon }}</text>
        <view class="template-info">
          <text class="template-name">{{ tpl.name }}</text>
          <text class="template-desc">{{ tpl.desc }}</text>
        </view>
        <text class="template-arrow">›</text>
      </view>
    </view>

    <!-- 伯恩斯5栏模板 -->
    <BurnsFiveColumn
      v-else
      @back="goBack"
      @saved="onSaved"
    />
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: $spacing-lg $spacing-md;
}

.template-selector {
  padding-top: $spacing-lg;
}

.page-title {
  font-size: $font-xl;
  font-weight: 600;
  color: $text-primary;
  display: block;
  text-align: center;
}

.page-desc {
  font-size: $font-md;
  color: $text-secondary;
  display: block;
  text-align: center;
  margin-top: $spacing-sm;
  margin-bottom: $spacing-xl;
}

.template-card {
  background: $card-bg;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-sm;
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.template-icon {
  font-size: 64rpx;
  flex-shrink: 0;
}

.template-info {
  flex: 1;
}

.template-name {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  display: block;
}

.template-desc {
  font-size: $font-sm;
  color: $text-secondary;
  margin-top: $spacing-xs;
  display: block;
}

.template-arrow {
  font-size: 48rpx;
  color: $text-light;
  flex-shrink: 0;
}
</style>
