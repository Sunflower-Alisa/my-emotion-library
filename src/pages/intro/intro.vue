<script setup>
const features = [
  { icon: '⚡', title: '极速记录', desc: '选择情绪标签，10秒完成记录' },
  { icon: '📝', title: '伯恩斯5栏', desc: '基于CBT认知行为疗法的结构化情绪日志' },
  { icon: '📅', title: '情绪日历', desc: '日历视图直观查看每日情绪变化' },
  { icon: '📊', title: '周趋势', desc: '每周情绪趋势可视化，发现情绪规律' },
  { icon: '🔍', title: '认知扭曲识别', desc: '识别10种常见思维陷阱，打破负面思维' },
  { icon: '💪', title: '理性回应', desc: '学习用事实和理性回应自动思维' },
]

function goToHome() {
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>

<template>
  <view class="container">
    <view class="hero-section">
      <view class="hero-icon">📚</view>
      <text class="hero-title">心迹手账</text>
      <text class="hero-desc">了解你的情绪，成为情绪的主人</text>
    </view>

    <view class="features-section">
      <text class="section-title">它能帮你做什么？</text>

      <view class="feature-grid">
        <view class="feature-card" v-for="f in features" :key="f.title">
          <text class="feature-icon">{{ f.icon }}</text>
          <text class="feature-title">{{ f.title }}</text>
          <text class="feature-desc">{{ f.desc }}</text>
        </view>
      </view>
    </view>

    <view class="quote-section">
      <text class="quote-text">"觉察是改变的开始。记录情绪，就是在为心灵做一次温柔的问诊。"</text>
    </view>

    <view class="bottom-section">
      <button class="btn-primary" @tap="goToHome">开始使用</button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: $spacing-lg $spacing-md;
}

.hero-section {
  text-align: center;
  padding: $spacing-xl 0;
}

.hero-icon {
  font-size: 120rpx;
  margin-bottom: $spacing-md;
}

.hero-title {
  font-size: 52rpx;
  font-weight: 700;
  color: $primary-dark;
  display: block;
}

.hero-desc {
  font-size: $font-lg;
  color: $text-secondary;
  display: block;
  margin-top: $spacing-sm;
}

.features-section {
  padding: $spacing-lg 0;
}

.section-title {
  font-size: $font-xl;
  font-weight: 600;
  color: $text-primary;
  display: block;
  text-align: center;
  margin-bottom: $spacing-lg;
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-md;
}

.feature-card {
  background: $card-bg;
  border-radius: $radius-lg;
  padding: $spacing-lg $spacing-md;
  box-shadow: $shadow-sm;
  text-align: center;
}

.feature-icon {
  font-size: 56rpx;
  display: block;
  margin-bottom: $spacing-sm;
}

.feature-title {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: $spacing-xs;
}

.feature-desc {
  font-size: $font-sm;
  color: $text-secondary;
  display: block;
  line-height: 1.5;
}

.quote-section {
  background: linear-gradient(135deg, #FFF5EE, #FFE8D6);
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin: $spacing-lg 0;
  text-align: center;
}

.quote-text {
  font-size: $font-md;
  color: $primary-dark;
  line-height: 1.8;
  font-style: italic;
}

.bottom-section {
  padding: $spacing-lg 0 $spacing-xl;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  color: #fff;
  border-radius: $radius-xl;
  padding: 24rpx 80rpx;
  font-size: $font-lg;
  border: none;
  text-align: center;
}
</style>
